"""Stars Climb: el servidor.

Hace dos cosas, y una sola instancia de Render basta para las dos:

  1. Sirve la aplicación (la carpeta web/), que es una página que funciona sin
     internet una vez cargada.
  2. Atiende /api/, que es lo único que necesita servidor: cuentas y progreso.

Que las dos vivan en la misma dirección no es casualidad. Siendo el mismo
origen, la cookie de sesión viaja sola, no hace falta CORS, y no hay que
configurar dos servicios ni mantener dos direcciones sincronizadas.
"""

import os

from flask import Flask, Response, jsonify, send_from_directory

from api.config import CONFIGS
from api.extensiones import db

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(RAIZ, "web")

# Archivos que el navegador nunca debe guardar en caché: son los que deciden
# qué versión de la aplicación se está usando.
SIN_CACHE = {"sw.js", "index.html", "manifest.webmanifest"}


def create_app(nombre_config=None):
    nombre_config = nombre_config or os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__, static_folder=None)
    app.config.from_object(CONFIGS[nombre_config])

    db.init_app(app)

    from api.auth import bp as auth_bp
    from api.progreso import bp as progreso_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(progreso_bp)

    with app.app_context():
        # create_all en vez de migraciones, a propósito. Son dos tablas que casi
        # no van a cambiar, es idempotente, y evita de raíz el problema de que
        # un "flask db upgrade" falle contra Neon en pleno despliegue y deje el
        # servicio caído. Si algún día el esquema crece, se agrega Alembic.
        db.create_all()

    _registrar_estaticos(app)
    _registrar_errores(app)
    _registrar_cabeceras(app)

    return app


def _registrar_estaticos(app):
    """Sirve la aplicación desde web/."""

    def entregar(archivo):
        completo = os.path.join(WEB, archivo)
        if not os.path.isfile(completo):
            return None
        respuesta = send_from_directory(WEB, archivo)

        if archivo.endswith(".webmanifest"):
            respuesta.mimetype = "application/manifest+json"

        if archivo in SIN_CACHE:
            respuesta.headers["Cache-Control"] = "no-cache, must-revalidate"
        else:
            respuesta.headers["Cache-Control"] = "public, max-age=86400"

        # Sin esta cabecera el service worker no puede hacerse cargo de toda la
        # aplicación, y entonces no funciona sin internet.
        if archivo == "sw.js":
            respuesta.headers["Service-Worker-Allowed"] = "/"

        return respuesta

    @app.get("/")
    def portada():
        return entregar("index.html")

    @app.get("/healthz")
    def healthz():
        """Chequeo de salud de Render. No toca la base a propósito: si la base
        tiene un mal momento, Render no debe dar el servicio por muerto y
        reiniciarlo, que empeoraría las cosas."""
        return "ok", 200

    @app.get("/<path:archivo>")
    def estatico(archivo):
        # Esta ruta atrapa todo, incluido /api/loquesea, y sin este corte le
        # devolvería el index.html con un 200. La aplicación haría .json() sobre
        # un HTML y reventaría con un error de sintaxis que no dice nada; peor
        # aún, un 200 hace creer que la petición salió bien.
        if archivo.startswith("api/"):
            return jsonify({"error": "No encontrado"}), 404

        respuesta = entregar(archivo)
        if respuesta is not None:
            return respuesta
        # Cualquier otra dirección devuelve la aplicación: así, abrir un enlace
        # guardado a una ruta interna no muestra un 404.
        return entregar("index.html") or (jsonify({"error": "No encontrado"}), 404)


def _registrar_errores(app):
    """Que /api/ responda siempre JSON, incluso cuando algo revienta."""

    @app.errorhandler(404)
    def no_encontrado(e):
        from flask import request

        if request.path.startswith("/api/"):
            return jsonify({"error": "No encontrado"}), 404
        return send_from_directory(WEB, "index.html")

    @app.errorhandler(413)
    def muy_grande(e):
        return jsonify({"error": "El cuerpo es demasiado grande"}), 413

    @app.errorhandler(500)
    def error_interno(e):
        # La transacción puede haber quedado rota; descartarla evita que el
        # error se arrastre a las peticiones siguientes.
        try:
            db.session.rollback()
        except Exception:
            db.session.remove()
        app.logger.exception("Error interno")
        return jsonify({"error": "Algo falló en el servidor"}), 500


def _registrar_cabeceras(app):
    """Cabeceras de seguridad en toda respuesta.

    default-src 'self' no rompe nada porque la aplicación no carga nada de
    fuera: ni tipografías, ni iconos, ni analítica. 'unsafe-inline' queda en
    style-src porque varias pantallas usan atributos style en línea.
    """
    csp = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "base-uri 'none'; "
        "form-action 'self'; "
        "frame-ancestors 'none'"
    )

    @app.after_request
    def cabeceras(respuesta: Response):
        respuesta.headers.setdefault("Content-Security-Policy", csp)
        respuesta.headers.setdefault("X-Content-Type-Options", "nosniff")
        respuesta.headers.setdefault("Referrer-Policy", "same-origin")
        respuesta.headers.setdefault("X-Frame-Options", "DENY")
        return respuesta
