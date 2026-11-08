"""Copia el material público de la cursada a `material/` con nombres limpios.

Uso:
    python -I herramientas/prepararMaterial.py "P:/FIUBA/Asignaturas/Computacion Cuantica"

Por qué una lista explícita: la carpeta de la cursada mezcla material de la cátedra con
archivos personales (resoluciones propias, notas, nombre y legajo, el TP). Solo se copia
lo que figura en MATERIAL_PUBLICO; cualquier archivo nuevo queda afuera hasta sumarlo acá.

Las fotos se recodifican a WebP sin metadatos (los celulares guardan GPS y modelo en EXIF).
"""

from __future__ import annotations

import shutil
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

RAIZ_REPO = Path(__file__).resolve().parent.parent
DESTINO = RAIZ_REPO / "material"
ANCHO_MAXIMO_FOTO = 1800

# (ruta relativa a la carpeta de la cursada, ruta destino dentro de material/)
MATERIAL_PUBLICO: list[tuple[str, str]] = [
    ("Slides/1 - Presentacion de la Materia.pdf", "slides/01-presentacion-de-la-materia.pdf"),
    ("Slides/2 - Notacion de DIRAC.pdf", "slides/02-notacion-de-dirac.pdf"),
    ("Slides/3 - Operadores Lineales.pdf", "slides/03-operadores-lineales.pdf"),
    ("Slides/4 - Postulados de la Mecanica Cuantica.pdf", "slides/04-postulados.pdf"),
    ("Slides/5 - Experimento Stern-Gerlach.pdf", "slides/05-stern-gerlach.pdf"),
    ("Slides/6 - Qubit (Bit cuántico) - Parte 1.pdf", "slides/06-qubit-parte-1.pdf"),
    ("Slides/7 - Qubit (Bit cuántico) - Parte 2.pdf", "slides/07-qubit-parte-2.pdf"),
    ("Slides/8 - Compuertas Cuanticas - Parte 1.pdf", "slides/08-compuertas-parte-1.pdf"),
    ("Slides/9 - Compuertas Cuanticas - Parte 2.pdf", "slides/09-compuertas-parte-2.pdf"),
    ("Slides/10 - Circuitos Cuanticos.pdf", "slides/10-circuitos-cuanticos.pdf"),
    ("Slides/11 - Pararelismo Cuantico.pdf", "slides/11-paralelismo-cuantico.pdf"),
    ("Slides/12 - Interferencia Cuantica.pdf", "slides/12-interferencia-cuantica.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 1 - NOTACION DE DIRAC.pdf", "guias/guia-1-notacion-de-dirac.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 2 - Operadores Lineales.pdf", "guias/guia-2-operadores-lineales.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 3 - Postulados de la Mecanica Cuantica.pdf", "guias/guia-3-postulados.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 4 - Mediciones sobre Qubits, Estados Entrelazados.pdf", "guias/guia-4-mediciones-y-entrelazados.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 5 - Compuertas Cuanticas Elementales y Circuitos Cuanticos.pdf", "guias/guia-5-compuertas-y-circuitos.pdf"),
    ("Guias de Ejercicios (Seminarios)/QC GUIA 5 - Circuitos Cuanticos.pdf", "guias/guia-6-circuitos-cuanticos.pdf"),
    ("Autoevaluaciones/Autoevaluacion - Semana 1.jpg", "autoevaluaciones/1-notacion-de-dirac.webp"),
    ("Autoevaluaciones/2 Autoevaluacion - Postulados de la Mecanica Cuantica.png", "autoevaluaciones/2-postulados.webp"),
    ("Autoevaluaciones/2 Autoevaluación - Postulados (Respuesta).pdf", "autoevaluaciones/2-postulados-respuesta.pdf"),
    ("Autoevaluaciones/3 Autoevaluación - Sistema de Qubits.jpg", "autoevaluaciones/3-sistemas-de-qubits.webp"),
    ("Autoevaluaciones/3 Autoevaluación - Sistema de Qubits (Respuesta).pdf", "autoevaluaciones/3-sistemas-de-qubits-respuesta.pdf"),
    ("Autoevaluaciones/4 Autoevaluacion - Circuitos Cuanticos.jpg", "autoevaluaciones/4-circuitos.webp"),
    ("Autoevaluaciones/4 Autoevaluacion - Circuitos Cuanticos (Respuesta).pdf", "autoevaluaciones/4-circuitos-respuesta.pdf"),
    # Enunciados sin completar: no tienen nombre, legajo ni nota.
    ("Examen Parcial/Modelo Examen Parcial - Recuperatorio 2024.jpeg", "parciales/recuperatorio-2024-06-19.webp"),
    ("Examen Parcial/Parcial Tomado.JPEG", "parciales/parcial-2026-06-11.webp"),
]


def convertirFotoAWebp(origen: Path, destino: Path) -> None:
    with Image.open(origen) as foto:
        foto = ImageOps.exif_transpose(foto)  # respeta la orientación antes de descartar EXIF
        foto = foto.convert("RGB")
        if foto.width > ANCHO_MAXIMO_FOTO:
            alto = round(foto.height * ANCHO_MAXIMO_FOTO / foto.width)
            foto = foto.resize((ANCHO_MAXIMO_FOTO, alto), Image.LANCZOS)
        foto.save(destino, "WEBP", quality=82, method=6)  # sin exif=: sale sin metadatos


def buscarArchivo(carpetaCursada: Path, rutaRelativa: str) -> Path | None:
    """Encuentra el archivo aunque el nombre en disco use tildes descompuestas (NFD)."""
    ruta = carpetaCursada / rutaRelativa
    if ruta.exists():
        return ruta
    buscado = unicodedata.normalize("NFC", ruta.name)
    for candidato in ruta.parent.glob("*"):
        if unicodedata.normalize("NFC", candidato.name) == buscado:
            return candidato
    return None


def copiarMaterial(carpetaCursada: Path) -> None:
    faltantes = []
    for rutaOrigen, rutaDestino in MATERIAL_PUBLICO:
        origen = buscarArchivo(carpetaCursada, rutaOrigen)
        destino = DESTINO / rutaDestino
        if origen is None:
            faltantes.append(rutaOrigen)
            continue
        destino.parent.mkdir(parents=True, exist_ok=True)
        if destino.suffix == ".webp":
            convertirFotoAWebp(origen, destino)
        else:
            shutil.copyfile(origen, destino)
        print(f"ok  {rutaDestino}  ({destino.stat().st_size / 1024:.0f} KB)")
    if faltantes:
        print("\nNo se encontraron:", *faltantes, sep="\n  ")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    copiarMaterial(Path(sys.argv[1]))
