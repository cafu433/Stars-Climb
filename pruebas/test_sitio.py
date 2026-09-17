"""Que el servidor sirva bien la aplicación.

Casi todo esto son cabeceras, y las cabeceras son justamente lo que falla sin
avisar: la aplicación se ve perfecta y sin embargo el teléfono se quedó con la
versión de la semana pasada, o no se puede instalar, o no funciona sin internet.
"""


def test_la_portada_es_la_aplicacion(cliente):
    r = cliente.get("/")
    assert r.status_code == 200
    assert b"<title>" in r.data


def test_ni_el_index_ni_el_service_worker_se_guardan_en_cache(cliente):
    """El fallo más caro de diagnosticar de toda la aplicación: si el navegador
    cachea sw.js, quien ya la tiene instalada se queda con la versión vieja
    para siempre y ninguna corrección le llega nunca."""
    for ruta in ["/", "/sw.js", "/manifest.webmanifest"]:
        cache = cliente.get(ruta).headers.get("Cache-Control", "")
        assert "no-cache" in cache, ruta


def test_el_service_worker_puede_hacerse_cargo_de_todo_el_sitio(cliente):
    assert cliente.get("/sw.js").headers.get("Service-Worker-Allowed") == "/"


def test_el_manifiesto_se_sirve_con_su_tipo(cliente):
    """Sin este tipo, el navegador no ofrece instalar la aplicación."""
    assert cliente.get("/manifest.webmanifest").mimetype == "application/manifest+json"


def test_el_javascript_si_se_cachea(cliente):
    """Lo contrario del caso de arriba: los módulos llevan el nombre fijo pero
    los gobierna el service worker, y cachearlos es lo que hace que abra rápido."""
    assert "max-age" in cliente.get("/js/app.js").headers.get("Cache-Control", "")


def test_una_ruta_interna_guardada_abre_la_aplicacion(cliente):
    """Quien guarde /practica en favoritos debe ver la aplicación, no un 404."""
    r = cliente.get("/practica")
    assert r.status_code == 200
    assert b"<title>" in r.data


def test_el_chequeo_de_salud_no_toca_la_base(cliente):
    """Render reinicia el servicio si esto falla. Si consultara la base, un mal
    momento de Neon se convertiría en la aplicación caída."""
    assert cliente.get("/healthz").status_code == 200


def test_las_cabeceras_de_seguridad_estan(cliente):
    cabeceras = cliente.get("/").headers
    assert "default-src 'self'" in cabeceras["Content-Security-Policy"]
    assert cabeceras["X-Content-Type-Options"] == "nosniff"
    assert cabeceras["X-Frame-Options"] == "DENY"


def test_no_se_puede_salir_de_la_carpeta_web(cliente):
    for intento in ["/../wsgi.py", "/..%2fwsgi.py", "/js/../../wsgi.py"]:
        r = cliente.get(intento)
        assert b"gunicorn" not in r.data.lower()
        assert b"create_app" not in r.data
