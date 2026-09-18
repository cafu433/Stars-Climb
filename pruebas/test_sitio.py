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


def test_el_javascript_no_se_puede_dejar_guardado(cliente):
    """Éste costó caro y es el más importante del archivo.

    Los .js llevan siempre el mismo nombre. Servidos con max-age de un día, el
    navegador se quedaba con el código viejo hasta 24 horas y —peor— se lo
    servía al service worker cuando éste iba a buscar la versión nueva: el
    service worker guardaba en su caché nueva exactamente el mismo código
    viejo. Resultado: publicar una versión no cambiaba nada, sin un solo error
    que lo explicara.

    "no-cache" no es "no guardar", es "pregunta antes de usar". El coste es una
    petición condicional que casi siempre devuelve un 304 vacío, y sólo la
    primera vez: después responde el service worker desde su propia caché.
    """
    for ruta in ["/js/app.js", "/js/pantallas.js", "/css/app.css"]:
        cache = cliente.get(ruta).headers.get("Cache-Control", "")
        assert "no-cache" in cache, ruta
        assert "max-age=86400" not in cache, ruta


def test_los_iconos_sí_se_pueden_guardar(cliente):
    """No tienen el problema de los .js: si un icono cambia, cambia su nombre."""
    assert "max-age" in cliente.get("/icons/icono-192.png").headers.get("Cache-Control", "")


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


def test_un_archivo_que_falta_da_404_y_no_la_portada(cliente):
    """Esto costó una tarde entera.

    El servidor devolvía index.html para cualquier dirección desconocida, lo
    cual está bien para /practica pero es pésimo para un .js que no se subió:
    el navegador pide JavaScript, recibe HTML, y falla con un error de sintaxis
    que no dice nada. Se concluye que es la caché del navegador y se pierde la
    tarde mirando donde no era.

    Con un 404 se ve al primer intento que el archivo no está en el servidor.
    """
    for ruta in ["/js/no-existe.js", "/css/no-existe.css", "/icons/no-existe.png", "/loquesea.txt"]:
        r = cliente.get(ruta)
        assert r.status_code == 404, ruta
        assert b"<title>" not in r.data, ruta + " devolvió la portada"


def test_una_ruta_interna_sí_devuelve_la_aplicación(cliente):
    """La otra mitad: /practica no es un archivo, es una pantalla. Quien la
    tenga en favoritos debe ver la aplicación, no un 404."""
    for ruta in ["/practica", "/camino/unidad/u1", "/reglas"]:
        r = cliente.get(ruta)
        assert r.status_code == 200, ruta
        assert b"<title>" in r.data, ruta
