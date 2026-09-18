"""Arma Stars Climb en un solo archivo HTML.

Sirve para compartirla por un enlace sin instalar nada: se juntan el CSS y todos
los JavaScript dentro de la página. Esa versión no funciona sin internet (no
lleva service worker) pero se abre en cualquier teléfono y guarda el progreso
igual, en el navegador.

    python3 herramientas/armar-una-pagina.py [destino.html]

La versión que se instala en el teléfono es el sitio publicado; ésta es sólo
para probar o mandarla por WhatsApp.
"""

import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
WEB = RAIZ / "web"


def armar() -> str:
    html = (WEB / "index.html").read_text(encoding="utf-8")

    cuerpo = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    titulo = re.search(r"<title>(.*?)</title>", html, re.S).group(1)

    css = (WEB / "css" / "app.css").read_text(encoding="utf-8")

    # El juego de caracteres y el viewport van primero y sí o sí: esta página se
    # publica dentro del <head> de otro sitio, y si ese sitio no los declara, en
    # el teléfono se ve a 980 px de ancho y con las tildes rotas.
    partes = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        f"<title>{titulo}</title>",
        "<style>",
        css,
        "</style>",
    ]

    # El cuerpo sin las etiquetas <script src>: cada archivo se pega entero más
    # abajo, en el mismo orden en que la portada los carga.
    partes.append(re.sub(r'\s*<script src="[^"]+"></script>', "", cuerpo).strip())

    for src in re.findall(r'<script src="([^"]+)"', html):
        codigo = (WEB / src).read_text(encoding="utf-8")
        # Un "</script>" dentro de un texto cerraría la etiqueta antes de tiempo.
        codigo = codigo.replace("</script>", "<\\/script>")
        partes.append(f"<script>\n/* {src} */\n{codigo}\n</script>")

    return "\n".join(partes) + "\n"


if __name__ == "__main__":
    destino = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "stars-climb-una-pagina.html"
    destino.write_text(armar(), encoding="utf-8")
    print(f"{destino} — {destino.stat().st_size // 1024} KB")
