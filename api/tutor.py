"""Conversar en inglés con un tutor, hablando o escribiendo.

Es lo único de toda la aplicación que necesita internet y que cuesta dinero.
Por eso está construido con tres cuidados que el resto no necesita:

  1. La clave vive SÓLO acá. Nunca se manda al teléfono. Si estuviera en el
     JavaScript, cualquiera que abra el inspector la copia y gasta el crédito
     de otro. Es el motivo por el que esto es un intermediario y no una llamada
     directa desde el navegador.

  2. Hay un tope diario por persona. Sin tope, un bucle en el cliente o una
     sesión robada se comen el crédito de un mes en una tarde.

  3. Si no está configurado, se dice. La aplicación entera sigue funcionando
     sin esto: es un añadido, no un requisito, y quien no ponga crédito no
     debe encontrarse errores raros sino una explicación.

El servidor no guarda la conversación: la manda el cliente en cada turno y se
queda en su teléfono. Guardar conversaciones de alguien practicando —con sus
errores, sus temas, lo que cuenta de su trabajo— sería recoger datos sensibles
que esta aplicación no necesita para nada.
"""

import json
import os
from datetime import datetime, timezone

import requests
from flask import Blueprint, jsonify, request

from api.auth import cuerpo_json, error, usuario_actual
from api.extensiones import db
from api.modelos import UsoTutor

bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")

URL = "https://api.anthropic.com/v1/messages"
VERSION_API = "2023-06-01"

# Haiku por defecto: para conversar y corregir errores de un principiante rinde
# de sobra, responde rápido —que en una conversación importa más que en otra
# cosa— y cuesta una fracción de los modelos grandes. Quien quiera otro lo pone
# en la variable de entorno.
MODELO = os.environ.get("TUTOR_MODELO", "claude-haiku-4-5-20251001")

MENSAJES_POR_DIA = int(os.environ.get("TUTOR_TOPE_DIARIO", "60"))
MAX_LARGO_MENSAJE = 800
MAX_TURNOS = 16  # lo que se manda de historia; más no mejora y sí cuesta
ESPERA = 45

INSTRUCCIONES = """Eres un profesor de inglés conversando con una persona adulta de Chile que está aprendiendo. Su lengua materna es el español.

Tu trabajo en cada turno:
1. Responder a lo que te dijo, en inglés, de forma natural y breve (una o dos frases). Eres una persona conversando, no un ejercicio.
2. Si cometió un error de inglés, corregirlo y explicar POR QUÉ en español, en una línea. Si no cometió ninguno, no inventes uno.
3. Terminar con una pregunta, para que la conversación siga. Sin pregunta, la conversación se muere y con ella la práctica.

Reglas:
- Ajusta tu inglés al nivel que ves. Si escribe con frases de tres palabras, contéstale con frases cortas.
- Corrige lo que impide entenderse, no cada matiz. Corregir todo desanima y hace que la gente deje de escribir.
- Las explicaciones van SIEMPRE en español y contrastando con el español cuando ayude ("en inglés el adjetivo va antes").
- Si te escribe en español, contéstale en inglés simple y anímala a intentarlo en inglés. No le hagas de traductor.
- Nunca inventes que algo está bien si está mal.

Responde SIEMPRE con un objeto JSON y nada más, con esta forma:
{"respuesta": "tu respuesta en inglés", "correccion": null o {"mal": "lo que escribió", "bien": "como se dice", "porque": "explicación en español"}}"""


def _hoy():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def clave():
    return os.environ.get("ANTHROPIC_API_KEY", "").strip()


def uso_de_hoy(usuario_id):
    fila = UsoTutor.query.filter_by(usuario_id=usuario_id, dia=_hoy()).first()
    return fila.mensajes if fila else 0


def anotar_uso(usuario_id):
    fila = UsoTutor.query.filter_by(usuario_id=usuario_id, dia=_hoy()).first()
    if fila:
        fila.mensajes += 1
    else:
        db.session.add(UsoTutor(usuario_id=usuario_id, dia=_hoy(), mensajes=1))
    db.session.commit()


@bp.get("/estado")
def estado():
    """Si el tutor se puede usar, y cuánto queda hoy.

    La aplicación lo pregunta al abrir la pantalla para saber si ofrecer la
    conversación o explicar que falta configurarla. Devuelve 200 siempre: que
    no esté configurado no es un error, es una respuesta.
    """
    usuario = usuario_actual()
    if not clave():
        return jsonify({
            "disponible": False,
            "motivo": "sin_clave",
        })
    if not usuario:
        return jsonify({"disponible": False, "motivo": "sin_cuenta"})

    usados = uso_de_hoy(usuario.id)
    return jsonify({
        "disponible": True,
        "usados": usados,
        "tope": MENSAJES_POR_DIA,
        "quedan": max(0, MENSAJES_POR_DIA - usados),
    })


@bp.post("/mensaje")
def mensaje():
    usuario = usuario_actual()
    if not usuario:
        return error("Para conversar con el tutor necesitas una cuenta", 401)
    if not clave():
        return error("El tutor no está configurado en este servidor", 503)

    if uso_de_hoy(usuario.id) >= MENSAJES_POR_DIA:
        return error(
            "Llegaste al tope de %d mensajes por hoy. Vuelve mañana." % MENSAJES_POR_DIA, 429
        )

    datos = cuerpo_json()
    if datos is None:
        return error("Falta el cuerpo de la petición")

    texto = (datos.get("texto") or "").strip()
    if not texto:
        return error("No mandaste nada")
    if len(texto) > MAX_LARGO_MENSAJE:
        return error("El mensaje es demasiado largo")

    # La historia llega del cliente. Se limpia y se recorta: no se confía en
    # que venga bien formada sólo porque la mandó nuestra propia aplicación.
    historia = []
    for turno in (datos.get("historia") or [])[-MAX_TURNOS:]:
        if not isinstance(turno, dict):
            continue
        papel = turno.get("papel")
        cuerpo = (turno.get("texto") or "")[:MAX_LARGO_MENSAJE]
        if papel in ("yo", "tutor") and cuerpo:
            historia.append({
                "role": "user" if papel == "yo" else "assistant",
                "content": cuerpo,
            })

    mensajes = historia + [{"role": "user", "content": texto}]

    try:
        r = requests.post(
            URL,
            timeout=ESPERA,
            headers={
                "x-api-key": clave(),
                "anthropic-version": VERSION_API,
                "content-type": "application/json",
            },
            json={
                "model": MODELO,
                "max_tokens": 400,
                "system": INSTRUCCIONES,
                "messages": mensajes,
            },
        )
    except requests.Timeout:
        return error("El tutor tardó demasiado en contestar. Prueba otra vez.", 504)
    except requests.RequestException:
        return error("No se pudo hablar con el tutor. ¿Tienes internet?", 502)

    if r.status_code == 401:
        return error("La clave del tutor no es válida. Revísala en Render.", 503)
    if r.status_code == 429:
        return error("El tutor está saturado ahora mismo. Prueba en un minuto.", 429)
    if r.status_code >= 400:
        return error("El tutor devolvió un error (%d)." % r.status_code, 502)

    try:
        bloques = r.json().get("content") or []
        crudo = "".join(b.get("text", "") for b in bloques if b.get("type") == "text").strip()
    except (ValueError, AttributeError):
        return error("El tutor contestó algo que no se entiende.", 502)

    anotar_uso(usuario.id)
    return jsonify(interpretar(crudo))


def interpretar(crudo):
    """Saca respuesta y corrección del texto del modelo.

    Se le pide JSON, pero a veces llega envuelto en ```json o con una frase
    delante. Recortar entre la primera llave y la última cubre esos casos. Y si
    aun así no se puede leer, se devuelve el texto tal cual como respuesta: una
    conversación algo peor formateada es mucho mejor que un error en pantalla.
    """
    limpio = crudo.strip()
    if limpio.startswith("```"):
        limpio = limpio.split("```")[1] if "```" in limpio[3:] else limpio[3:]
        if limpio.startswith("json"):
            limpio = limpio[4:]

    i, j = limpio.find("{"), limpio.rfind("}")
    if i >= 0 and j > i:
        try:
            d = json.loads(limpio[i : j + 1])
            if isinstance(d, dict) and d.get("respuesta"):
                c = d.get("correccion")
                return {
                    "respuesta": str(d["respuesta"])[:1500],
                    "correccion": c if isinstance(c, dict) and c.get("bien") else None,
                }
        except ValueError:
            pass

    return {"respuesta": crudo[:1500], "correccion": None}
