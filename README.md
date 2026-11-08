# Computación Cuántica · FIUBA (TB032)

Apuntes interactivos de **Computación Cuántica (TB032)** de la Facultad de Ingeniería de la UBA, cursada del **1.er cuatrimestre de 2026**: teoría ordenada como la da la cátedra, gráficos que se pueden tocar, simulador de circuitos, parciales resueltos, autoevaluaciones y todo el material de la cátedra en un solo lugar.

### 👉 [Abrir los apuntes](https://facucabral.me/fiuba/cuantica/?utm_source=FIUBA-Repos&utm_medium=Readme)

Funcionan en la compu y en el celular, sin instalar nada.

---

## Qué hay adentro

| | |
|---|---|
| **22 temas** | De los números complejos a BB84: cada uno arranca con una “bajada a tierra” intuitiva, sigue con procesos paso a paso y termina con lo que se toma en el parcial. |
| **Código de colores** | Kets, bras, brakets y proyectores tienen su color en todas las fórmulas, para leer la notación de Dirac de un vistazo. |
| **Laboratorio de circuitos** | Simulador de hasta 3 qubits que muestra el estado en notación de Dirac y la medición con proyectores. |
| **Esfera de Bloch 3D** | Para ver las compuertas como rotaciones. |
| **3 parciales resueltos** | Recuperatorio 19/06/2024, parcial 11/06/2026 y recuperatorio 24/06/2026: una pestaña por examen, enunciados completos y resolución paso a paso. |
| **Tu práctica** | Marcá cada ejercicio como resuelto y seguí tu avance (se guarda en tu navegador). |
| **Machete en PDF** | [`material/machete.pdf`](material/machete.pdf): todo en 5 páginas, para tener sin conexión. |
| **4 autoevaluaciones** | Las del campus, resueltas. |
| **Quiz y ejercicios infinitos** | 50+ preguntas con explicación y un generador de circuitos al azar que corrige tu respuesta. |
| **Biblioteca** | Slides, guías y enunciados para ver dentro de la página, abrir en otra pestaña o descargar. |

### Temas

| Unidad | Temas |
|---|---|
| 1 · Fundamentos | [¿Por qué computación cuántica?](https://facucabral.me/fiuba/cuantica/#/por-que) · [Tecnologías de qubits](https://facucabral.me/fiuba/cuantica/#/tecnologias) |
| 2 · Matemática | [Números complejos](https://facucabral.me/fiuba/cuantica/#/complejos) · [Notación de Dirac](https://facucabral.me/fiuba/cuantica/#/dirac) · [Operadores lineales](https://facucabral.me/fiuba/cuantica/#/operadores) |
| 3 · Mecánica cuántica | [Los postulados](https://facucabral.me/fiuba/cuantica/#/postulados) · [Stern-Gerlach](https://facucabral.me/fiuba/cuantica/#/stern-gerlach) |
| 4 · Qubits | [El qubit y la medición](https://facucabral.me/fiuba/cuantica/#/qubit) · [Esfera de Bloch](https://facucabral.me/fiuba/cuantica/#/bloch) · [Sistemas de qubits](https://facucabral.me/fiuba/cuantica/#/sistemas) · [Entrelazamiento y Bell](https://facucabral.me/fiuba/cuantica/#/entrelazamiento) · [Fotones y polarizadores](https://facucabral.me/fiuba/cuantica/#/fotones) |
| 5 · Compuertas y circuitos | [Compuertas](https://facucabral.me/fiuba/cuantica/#/compuertas) · [Circuitos](https://facucabral.me/fiuba/cuantica/#/circuitos) |
| 6 · Algoritmos y protocolos | [Paralelismo e interferencia](https://facucabral.me/fiuba/cuantica/#/paralelismo) · [Deutsch](https://facucabral.me/fiuba/cuantica/#/deutsch) · [No-clonación](https://facucabral.me/fiuba/cuantica/#/no-clonacion) · [Teleportación](https://facucabral.me/fiuba/cuantica/#/teleportacion) · [Superdensa](https://facucabral.me/fiuba/cuantica/#/superdensa) · [BB84](https://facucabral.me/fiuba/cuantica/#/bb84) · [Matriz densidad](https://facucabral.me/fiuba/cuantica/#/densidad) |
| Práctica | [Machete](https://facucabral.me/fiuba/cuantica/#/machete) · [Parciales resueltos](https://facucabral.me/fiuba/cuantica/#/parciales) · [Autoevaluaciones](https://facucabral.me/fiuba/cuantica/#/autoevaluaciones) · [Quiz](https://facucabral.me/fiuba/cuantica/#/quiz) · [Ejercicios infinitos](https://facucabral.me/fiuba/cuantica/#/practica) |

El texto de cada tema está en [`paginas/`](paginas) (HTML legible) por si preferís leerlo desde GitHub.

## Material de la cátedra

Todo está en [`material/`](material):

| Carpeta | Contenido |
|---|---|
| [`machete.pdf`](material/machete.pdf) | Resumen del parcial de estos apuntes, para imprimir o tener en el celular. |
| [`slides/`](material/slides) | Las 12 presentaciones de clase: Dirac, operadores, postulados, Stern-Gerlach, qubit, compuertas, circuitos, paralelismo e interferencia. |
| [`guias/`](material/guias) | Guías 1 a 5 del Seminario de Computación Cuántica (FIUBA) y la guía de 13 circuitos (ITBA) que se usó en la cursada. |
| [`autoevaluaciones/`](material/autoevaluaciones) | Enunciados y respuestas oficiales de las autoevaluaciones del campus. |
| [`parciales/`](material/parciales) | Enunciados del recuperatorio 2024 y del parcial 2026. |

> El material pertenece a la cátedra de Computación Cuántica de FIUBA y se comparte con fines de estudio. Si sos parte de la cátedra y preferís que algo no esté publicado, abrí un *issue* y se retira.

## Usarlo en tu compu

Es una página estática, sin dependencias ni compilación. Como carga los temas con `fetch`, hay que servir la carpeta (abrir `index.html` con doble clic no alcanza):

```bash
python -m http.server 5173
```

y abrir <http://localhost:5173>. Las pruebas del simulador (verifican los resultados de los parciales) se corren con:

```bash
node --test pruebas/*.test.mjs
```

### Estructura

```
index.html            esqueleto: barra lateral, búsqueda, visor de documentos
css/                  tokens y componentes (misma estética que facucabral.me)
js/app.js             navegación por hash, progreso, búsqueda
js/rutas.js           índice de temas: agregar un tema = una entrada + un archivo en paginas/
js/nucleo/            números complejos, simulador de qubits, circuitos, visor de PDF
js/widgets/           interactivos (esfera de Bloch, laboratorio, BB84, quiz…), se cargan solo si la página los usa
js/datos/             material, circuitos de los parciales y banco de preguntas
paginas/              un fragmento HTML por tema
material/             PDFs e imágenes de la cátedra
pruebas/              pruebas del simulador contra las resoluciones publicadas
herramientas/         scripts para preparar el material y copiar el sitio al portafolio
```

## Créditos

- **Cátedra de Computación Cuántica, FIUBA (1C 2026):** temario, notación, slides, guías, autoevaluaciones y parciales.
- **[El Qubit de Newton](https://www.youtube.com/results?search_query=El+Qubit+de+Newton)** (YouTube): muchas de las intuiciones de los apuntes vienen de sus videos. Muy recomendados.
- **Nielsen y Chuang**, *Quantum Computation and Quantum Information*.
- Fórmulas con [KaTeX](https://katex.org) y PDFs con [PDF.js](https://mozilla.github.io/pdf.js/).

Hecho por [Facundo Cabral](https://facucabral.me/?utm_source=FIUBA-Repos&utm_medium=Readme). ¿Encontraste un error? Abrí un *issue* o un *pull request*.

El código está bajo licencia [MIT](LICENSE). El material de `material/` es de la cátedra y no está cubierto por esa licencia.
