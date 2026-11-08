"""Copia el sitio al portafolio para publicarlo en facucabral.me/fiuba/cuantica/.

Uso:
    python -I herramientas/copiarAlPortafolio.py ../Portfolio

El portafolio sirve `public/` tal cual en GitHub Pages, así que la carpeta destino
(public/fiuba/cuantica) se reemplaza entera por una copia de los archivos del sitio.
Solo se copian los archivos que forman la página: nada de pruebas, herramientas ni docs.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

RAIZ_REPO = Path(__file__).resolve().parent.parent
ARCHIVOS_DEL_SITIO = ["index.html"]
CARPETAS_DEL_SITIO = ["css", "js", "paginas", "material"]


def copiarSitio(carpetaPortafolio: Path) -> None:
    publico = carpetaPortafolio / "public"
    if not publico.is_dir():
        sys.exit(f"No encuentro {publico}: ¿es la carpeta del portafolio?")
    destino = publico / "fiuba" / "cuantica"
    if destino.exists():
        shutil.rmtree(destino)
    destino.mkdir(parents=True)
    for archivo in ARCHIVOS_DEL_SITIO:
        shutil.copy2(RAIZ_REPO / archivo, destino / archivo)
    for carpeta in CARPETAS_DEL_SITIO:
        shutil.copytree(RAIZ_REPO / carpeta, destino / carpeta)
    total = sum(f.stat().st_size for f in destino.rglob("*") if f.is_file())
    print(f"Sitio copiado a {destino} ({total / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    copiarSitio(Path(sys.argv[1]).resolve())
