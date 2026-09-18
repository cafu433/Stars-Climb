"""Registro, entrada y salida.

Sin confirmación por correo a propósito: mandar correos obliga a contratar un
servicio y a mantenerlo, y acá lo que se protege es el avance de un curso de
inglés. Lo que sí hay es lo que de verdad importa: contraseñas bien guardadas,
freno a quien pruebe contraseñas a lo bruto, y una cookie que el JavaScript no
puede leer.
"""

import re
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request, session

from api.extensiones import db
from api.modelos import Usuario

bp = Blueprint("auth", __name__, url_prefix="/api")

# Validación deliberadamente laxa: comprobar de verdad si un correo existe es
# imposible sin mandarle un mensaje, así que sólo se descarta lo que es
# evidentemente un error de tipeo.
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

CLAVE_MINIMA = 8
INTENTOS_ANTES_DE_BLOQUEAR = 8
MINUTOS_DE_BLOQUEO = 15


def error(mensaje, codigo=400, campo=None):
    cuerpo = {"error": mensaje}
    if campo:
        cuerpo["campo"] = campo
    return jsonify(cuerpo), codigo


def cuerpo_json():
    """Exige JSON de verdad.

    Además de evitar sorpresas, es media protección CSRF: un formulario de otro
    sitio no puede mandar Content-Type application/json sin que el navegador
    pida permiso primero con una petición previa.
    """
    if not request.is_json:
        return None
    try:
        datos = request.get_json(silent=True)
    except Exception:
        return None
    return datos if isinstance(datos, dict) else None


def usuario_actual():
    uid = session.get("uid")
    if not uid:
        return None
    return db.session.get(Usuario, uid)


def iniciar_sesion(usuario):
    session.clear()
    session["uid"] = usuario.id
    session.permanent = True


@bp.post("/registro")
def registro():
    datos = cuerpo_json()
    if datos is None:
        return error("Falta el cuerpo de la petición")

    email = Usuario.normalizar_email(datos.get("email"))
    clave = datos.get("clave") or ""

    if not EMAIL.match(email):
        return error("Ese correo no parece válido", 400, "email")
    if len(clave) < CLAVE_MINIMA:
        return error("La contraseña necesita al menos %d caracteres" % CLAVE_MINIMA, 400, "clave")

    if Usuario.query.filter_by(email=email).first():
        return error("Ya hay una cuenta con ese correo. Prueba entrando.", 409, "email")

    usuario = Usuario(email=email)
    usuario.poner_clave(clave)
    db.session.add(usuario)
    db.session.commit()

    iniciar_sesion(usuario)
    return jsonify({"email": usuario.email}), 201


@bp.post("/entrar")
def entrar():
    datos = cuerpo_json()
    if datos is None:
        return error("Falta el cuerpo de la petición")

    email = Usuario.normalizar_email(datos.get("email"))
    clave = datos.get("clave") or ""
    usuario = Usuario.query.filter_by(email=email).first()

    if usuario and usuario.esta_bloqueado():
        return error(
            "Demasiados intentos. Espera unos minutos antes de volver a probar.", 429
        )

    # El mismo mensaje para "no existe" y para "clave mala": decir cuál de las
    # dos falló le confirmaría a un desconocido qué correos tienen cuenta.
    if not usuario or not usuario.clave_correcta(clave):
        if usuario:
            usuario.intentos_fallidos = (usuario.intentos_fallidos or 0) + 1
            if usuario.intentos_fallidos >= INTENTOS_ANTES_DE_BLOQUEAR:
                usuario.bloqueado_hasta = datetime.now(timezone.utc) + timedelta(
                    minutes=MINUTOS_DE_BLOQUEO
                )
                usuario.intentos_fallidos = 0
            db.session.commit()
        return error("Correo o contraseña incorrectos", 401)

    usuario.intentos_fallidos = 0
    usuario.bloqueado_hasta = None
    usuario.ultima_entrada = datetime.now(timezone.utc)
    db.session.commit()

    iniciar_sesion(usuario)
    return jsonify({"email": usuario.email})


@bp.post("/salir")
def salir():
    session.clear()
    return jsonify({"ok": True})


@bp.get("/yo")
def yo():
    """Quién está conectado. La aplicación la llama al abrir para saber si
    mostrar 'entrar' o el correo de la cuenta."""
    usuario = usuario_actual()
    if not usuario:
        return jsonify({"conectado": False})
    return jsonify({"conectado": True, "email": usuario.email})


@bp.post("/cambiar-clave")
def cambiar_clave():
    usuario = usuario_actual()
    if not usuario:
        return error("Necesitas haber entrado", 401)

    datos = cuerpo_json()
    if datos is None:
        return error("Falta el cuerpo de la petición")

    if not usuario.clave_correcta(datos.get("actual")):
        return error("La contraseña actual no es correcta", 401, "actual")

    nueva = datos.get("nueva") or ""
    if len(nueva) < CLAVE_MINIMA:
        return error("La contraseña necesita al menos %d caracteres" % CLAVE_MINIMA, 400, "nueva")

    usuario.poner_clave(nueva)
    db.session.commit()
    return jsonify({"ok": True})


@bp.post("/borrar-cuenta")
def borrar_cuenta():
    """Borra la cuenta y su progreso. Pide la contraseña porque no se deshace."""
    usuario = usuario_actual()
    if not usuario:
        return error("Necesitas haber entrado", 401)

    datos = cuerpo_json()
    if datos is None or not usuario.clave_correcta(datos.get("clave")):
        return error("La contraseña no es correcta", 401, "clave")

    db.session.delete(usuario)
    db.session.commit()
    session.clear()
    return jsonify({"ok": True})
