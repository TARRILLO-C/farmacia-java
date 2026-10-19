"""Renderiza cada diagrama HTML de esta carpeta a PNG con Microsoft Edge en modo headless.

Uso:  python render.py            (todos)
      python render.py 04 07      (solo los que empiezan con esos prefijos)

Salida: ../<nombre>.png a 2x de resolución, recortado al contenido.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
AQUI = Path(__file__).resolve().parent
SALIDA = AQUI.parent
ANCHO, ALTO = 4200, 7600  # ventana amplia; luego se recorta el espacio en blanco
MARGEN = 24


def recortar(ruta: Path) -> None:
    im = Image.open(ruta).convert("RGB")
    fondo = Image.new("RGB", im.size, (255, 255, 255))
    caja = ImageChops.difference(im, fondo).getbbox()
    if caja:
        x0, y0, x1, y1 = caja
        im = im.crop((max(0, x0 - MARGEN), max(0, y0 - MARGEN),
                      min(im.width, x1 + MARGEN), min(im.height, y1 + MARGEN)))
    im.save(ruta, optimize=True)


def renderizar(html: Path) -> Path:
    png = SALIDA / (html.stem + ".png")
    comando = [
        EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=2", f"--window-size={ANCHO},{ALTO}",
        "--virtual-time-budget=15000", "--run-all-compositor-stages-before-draw",
        f"--screenshot={png}", html.as_uri(),
    ]
    # Edge headless a veces se cuelga al arrancar: se reintenta una vez
    for intento in range(2):
        try:
            subprocess.run(comando, check=True, capture_output=True, timeout=90)
            break
        except subprocess.TimeoutExpired:
            if intento == 1:
                raise
    recortar(png)
    return png


if __name__ == "__main__":
    prefijos = sys.argv[1:]
    for html in sorted(AQUI.glob("*.html")):
        if prefijos and not any(html.name.startswith(p) for p in prefijos):
            continue
        png = renderizar(html)
        w, h = Image.open(png).size
        print(f"{png.name}: {w}x{h}")
