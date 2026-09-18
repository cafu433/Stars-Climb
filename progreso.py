"""Guardar y devolver el avance de quien esté conectado.

El servidor no entiende lo que guarda y no tiene por qué: la aplicación manda
un documento y lo recibe de vuelta igual. Toda la lógica de juntar dos avances
sin perder nada vive en el teléfono, donde ya está escrita y probada, y donde
tiene que funcionar de todas formas para los ratos sin conexión.
"""

import json

from flask import Blueprint, jsonify, request

from api.auth import error, usuario_actual
from api.extensiones import db
from api.modelos import Progreso

bp = Blueprint("progreso", __name__, url_prefix="/api")

# Medio mega. El avance de años de práctica pesa unos 100 KB.
LARGO_MAXIMO = 512 * 1024


@bp.get("/progreso")
def leer():
    usuario = usuario_actual()
    if not usuario:
        return error("Necesitas haber entrado", 401)

    if not usuario.progreso:
        # Todavía no ha guardado nada: es una cuenta recién creada, no un error.
        return jsonify({"vacio": True}), 200

    return db.session.get(Progreso, usuario.progreso.id).datos, 200, {
        "Content-Type": "application/json; charset=utf-8"
    }


@bp.put("/progreso")
def guardar():
    usuario = usuario_actual()
    if not usuario:
        return error("Necesitas haber entrado", 401)

    crudo = request.get_data(as_text=True)
    if len(crudo) > LARGO_MAXIMO:
        return error("El progreso es demasiado grande", 413)

    # Se comprueba que sea un documento y no cualquier cosa. No se mira qué trae
    # adentro: eso es asunto de la aplicación, y validarlo acá obligaría a
    # cambiar el servidor cada vez que la aplicación guarde algo nuevo.
    try:
        datos = json.loads(crudo)
        if not isinstance(datos, dict):
            raise ValueError
    except (ValueError, TypeError):
        return error("El cuerpo no es un progreso válido", 400)

    if usuario.progreso:
        usuario.progreso.datos = crudo
    else:
        db.session.add(Progreso(usuario_id=usuario.id, datos=crudo))
    db.session.commit()

    return jsonify({"ok": True})
