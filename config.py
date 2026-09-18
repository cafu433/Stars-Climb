"""Configuración del servidor, toda desde variables de entorno.

Nada de secretos en el código: lo que cambia entre tu computador y Render se
pone en el panel de Render, y acá sólo se lee.
"""

import os


def _normalizar(uri: str) -> str:
    """Neon y Render entregan 'postgres://', que SQLAlchemy 2 ya no acepta."""
    if uri.startswith("postgres://"):
        return uri.replace("postgres://", "postgresql://", 1)
    return uri


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "clave-de-desarrollo-cambiar-en-produccion")

    SQLALCHEMY_DATABASE_URI = _normalizar(
        os.environ.get("DATABASE_URL", "sqlite:///" + os.path.join(os.getcwd(), "stars-climb.db"))
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Neon corta las conexiones que llevan rato sin usarse, y el plan gratuito de
    # Render duerme el servicio: sin pre_ping, la primera petición después de
    # despertar falla con "server closed the connection".
    SQLALCHEMY_ENGINE_OPTIONS = (
        {}
        if SQLALCHEMY_DATABASE_URI.startswith("sqlite")
        else {
            "pool_pre_ping": True,
            "pool_recycle": 280,
            "pool_size": 3,
            "max_overflow": 2,
            "connect_args": {"connect_timeout": 10},
        }
    )

    # La cookie de sesión. HttpOnly para que el JavaScript no pueda leerla, y
    # SameSite=Lax para que otro sitio no pueda usarla desde un formulario suyo
    # (que es lo que hace de protección CSRF acá, junto con exigir JSON).
    SESSION_COOKIE_NAME = "stars_sesion"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("FLASK_ENV", "development") == "production"
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 365  # un año: es una app de práctica diaria

    # Tope de lo que se acepta en un PUT de progreso. El avance de años pesa
    # unos 100 KB; medio mega es holgado y evita que alguien llene la base.
    MAX_CONTENT_LENGTH = 1024 * 1024


class ConfigPruebas(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "pruebas"
    SESSION_COOKIE_SECURE = False


CONFIGS = {"development": Config, "production": Config, "testing": ConfigPruebas}
