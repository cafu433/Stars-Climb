"""Guardar y recuperar el avance.

La regla de oro de este módulo: el servidor devuelve exactamente el mismo
documento que recibió, byte por byte. Si algún día empieza a "arreglarlo" —a
reordenar llaves, a rellenar campos que faltan, a quitar los que no conoce— el
teléfono recibiría de vuelta algo distinto de lo que mandó y la fusión de dos
aparatos empezaría a perder avance sin que nadie se dé cuenta.
"""

import json

AVANCE = {
    "xp": {"movil-abc": 180, "compu-def": 60},
    "tarjetas": {"u1l1-hello": {"repeticiones": 3, "facilidad": 2.5}},
    "racha": 4,
}


def test_una_cuenta_recien_creada_no_tiene_progreso(conectado):
    r = conectado.get("/api/progreso")
    assert r.status_code == 200
    assert r.get_json() == {"vacio": True}


def test_lo_que_se_guarda_vuelve_igual(conectado):
    assert conectado.put("/api/progreso", json=AVANCE).status_code == 200

    r = conectado.get("/api/progreso")
    assert r.status_code == 200
    assert r.get_json() == AVANCE


def test_el_documento_vuelve_tal_cual_sin_reordenar_ni_completar(conectado):
    crudo = '{"z":1,"a":2,"raro":[1,{"anidado":true}],"acento":"sesión"}'
    conectado.put("/api/progreso", data=crudo, content_type="application/json")

    r = conectado.get("/api/progreso")
    assert r.get_data(as_text=True) == crudo


def test_guardar_dos_veces_reemplaza_y_no_acumula_filas(conectado, app):
    conectado.put("/api/progreso", json={"xp": 1})
    conectado.put("/api/progreso", json={"xp": 2})

    assert conectado.get("/api/progreso").get_json() == {"xp": 2}
    with app.app_context():
        from api.modelos import Progreso

        assert Progreso.query.count() == 1


def test_sin_sesion_no_se_lee_ni_se_escribe(cliente):
    assert cliente.get("/api/progreso").status_code == 401
    assert cliente.put("/api/progreso", json={"xp": 1}).status_code == 401


def test_el_progreso_de_una_cuenta_no_se_ve_desde_otra(app):
    ana = app.test_client()
    ana.post("/api/registro", json={"email": "ana@ejemplo.cl", "clave": "clave-larga-1"})
    ana.put("/api/progreso", json={"xp": 999})

    beto = app.test_client()
    beto.post("/api/registro", json={"email": "beto@ejemplo.cl", "clave": "clave-larga-2"})
    assert beto.get("/api/progreso").get_json() == {"vacio": True}


def test_un_cuerpo_que_no_es_un_documento_se_rechaza(conectado):
    for crudo in ["[1,2,3]", '"texto"', "42", "no es json"]:
        r = conectado.put("/api/progreso", data=crudo, content_type="application/json")
        assert r.status_code == 400, crudo


def test_un_progreso_enorme_se_rechaza(conectado):
    enorme = json.dumps({"relleno": "x" * (600 * 1024)})
    r = conectado.put("/api/progreso", data=enorme, content_type="application/json")
    # 413 lo pone la aplicación o Flask mismo por MAX_CONTENT_LENGTH; cualquiera
    # de los dos sirve, lo que importa es que no entre a la base.
    assert r.status_code == 413
    assert conectado.get("/api/progreso").get_json() == {"vacio": True}


def test_el_progreso_sobrevive_a_salir_y_volver_a_entrar(conectado):
    conectado.put("/api/progreso", json=AVANCE)
    conectado.post("/api/salir")
    conectado.post("/api/entrar", json={"email": "ana@ejemplo.cl", "clave": "clave-larga-1"})

    assert conectado.get("/api/progreso").get_json() == AVANCE
