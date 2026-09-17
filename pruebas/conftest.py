"""Lo compartido por las pruebas del servidor.

Cada prueba estrena una base en memoria: así ninguna depende del orden en que
se corran ni de lo que otra haya dejado escrito.
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import create_app  # noqa: E402
from api.extensiones import db  # noqa: E402


@pytest.fixture
def app():
    aplicacion = create_app("testing")
    yield aplicacion
    with aplicacion.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def cliente(app):
    return app.test_client()


@pytest.fixture
def conectado(cliente):
    """Un cliente con la cuenta ya creada y la sesión abierta."""
    cliente.post("/api/registro", json={"email": "ana@ejemplo.cl", "clave": "clave-larga-1"})
    return cliente
