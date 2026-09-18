"""Registro, entrada, salida y contraseñas.

Lo que se comprueba acá no es que "funcione" —eso se ve usándolo— sino lo que
falla en silencio: que la contraseña nunca se guarde tal cual, que dar con un
correo que no existe no se distinga de dar con una contraseña mala, y que el
freno a la fuerza bruta se active de verdad.
"""

from api.extensiones import db
from api.modelos import Usuario

CUENTA = {"email": "ana@ejemplo.cl", "clave": "clave-larga-1"}


def test_registro_crea_la_cuenta_y_deja_la_sesion_abierta(cliente):
    r = cliente.post("/api/registro", json=CUENTA)
    assert r.status_code == 201
    assert r.get_json()["email"] == "ana@ejemplo.cl"

    # Sin volver a mandar nada: la cookie ya viaja sola.
    assert cliente.get("/api/yo").get_json()["conectado"] is True


def test_la_clave_no_se_guarda_tal_cual(cliente, app):
    cliente.post("/api/registro", json=CUENTA)
    with app.app_context():
        usuario = Usuario.query.filter_by(email="ana@ejemplo.cl").first()
        assert CUENTA["clave"] not in usuario.hash_clave
        assert usuario.clave_correcta(CUENTA["clave"])
        assert not usuario.clave_correcta("otra-cosa")


def test_el_correo_se_guarda_en_minusculas(cliente, app):
    cliente.post("/api/registro", json={"email": "  Ana@Ejemplo.CL ", "clave": "clave-larga-1"})
    with app.app_context():
        assert Usuario.query.filter_by(email="ana@ejemplo.cl").first() is not None

    # Y por eso se puede entrar escribiéndolo de cualquier forma.
    cliente.post("/api/salir")
    r = cliente.post("/api/entrar", json={"email": "ANA@ejemplo.cl", "clave": "clave-larga-1"})
    assert r.status_code == 200


def test_no_se_puede_repetir_el_correo(cliente):
    cliente.post("/api/registro", json=CUENTA)
    cliente.post("/api/salir")
    r = cliente.post("/api/registro", json=CUENTA)
    assert r.status_code == 409


def test_correo_invalido_y_clave_corta_se_rechazan(cliente):
    r = cliente.post("/api/registro", json={"email": "no-es-correo", "clave": "clave-larga-1"})
    assert r.status_code == 400
    assert r.get_json()["campo"] == "email"

    r = cliente.post("/api/registro", json={"email": "b@ejemplo.cl", "clave": "corta"})
    assert r.status_code == 400
    assert r.get_json()["campo"] == "clave"


def test_entrar_con_clave_mala_no_revela_si_la_cuenta_existe(cliente):
    cliente.post("/api/registro", json=CUENTA)
    cliente.post("/api/salir")

    mala = cliente.post("/api/entrar", json={"email": CUENTA["email"], "clave": "equivocada"})
    fantasma = cliente.post("/api/entrar", json={"email": "nadie@ejemplo.cl", "clave": "equivocada"})

    assert mala.status_code == fantasma.status_code == 401
    assert mala.get_json() == fantasma.get_json()


def test_tras_ocho_intentos_la_cuenta_queda_bloqueada(cliente):
    cliente.post("/api/registro", json=CUENTA)
    cliente.post("/api/salir")

    for _ in range(8):
        r = cliente.post("/api/entrar", json={"email": CUENTA["email"], "clave": "equivocada"})
        assert r.status_code == 401

    # Ahora ni siquiera la contraseña buena sirve, hasta que pase el rato.
    r = cliente.post("/api/entrar", json=CUENTA)
    assert r.status_code == 429


def test_una_entrada_buena_borra_los_intentos_fallidos(cliente, app):
    cliente.post("/api/registro", json=CUENTA)
    cliente.post("/api/salir")

    for _ in range(7):
        cliente.post("/api/entrar", json={"email": CUENTA["email"], "clave": "equivocada"})
    assert cliente.post("/api/entrar", json=CUENTA).status_code == 200

    with app.app_context():
        assert Usuario.query.filter_by(email=CUENTA["email"]).first().intentos_fallidos == 0


def test_salir_cierra_la_sesion(conectado):
    conectado.post("/api/salir")
    assert conectado.get("/api/yo").get_json()["conectado"] is False


def test_cambiar_clave(conectado):
    r = conectado.post("/api/cambiar-clave", json={"actual": "equivocada", "nueva": "otra-larga-1"})
    assert r.status_code == 401

    r = conectado.post("/api/cambiar-clave", json={"actual": CUENTA["clave"], "nueva": "corta"})
    assert r.status_code == 400

    r = conectado.post(
        "/api/cambiar-clave", json={"actual": CUENTA["clave"], "nueva": "otra-larga-1"}
    )
    assert r.status_code == 200

    conectado.post("/api/salir")
    assert conectado.post("/api/entrar", json=CUENTA).status_code == 401
    assert conectado.post(
        "/api/entrar", json={"email": CUENTA["email"], "clave": "otra-larga-1"}
    ).status_code == 200


def test_borrar_cuenta_pide_la_clave_y_se_lleva_el_progreso(conectado, app):
    conectado.put("/api/progreso", json={"xp": 10})

    assert conectado.post("/api/borrar-cuenta", json={"clave": "equivocada"}).status_code == 401
    assert conectado.post("/api/borrar-cuenta", json={"clave": CUENTA["clave"]}).status_code == 200

    with app.app_context():
        from api.modelos import Progreso

        assert Usuario.query.count() == 0
        assert Progreso.query.count() == 0  # se va con la cuenta, no queda huérfano

    assert conectado.get("/api/yo").get_json()["conectado"] is False


def test_sin_json_no_se_hace_nada(cliente):
    """Es la protección CSRF: un formulario de otro sitio no puede mandar
    Content-Type application/json sin permiso previo del navegador."""
    r = cliente.post(
        "/api/entrar",
        data="email=ana@ejemplo.cl&clave=clave-larga-1",
        content_type="application/x-www-form-urlencoded",
    )
    assert r.status_code == 400


def test_lo_que_no_existe_bajo_api_responde_json(cliente):
    r = cliente.get("/api/no-existe")
    assert r.status_code == 404
    assert r.is_json
