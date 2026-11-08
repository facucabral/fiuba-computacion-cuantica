# Contexto del proyecto

Fecha de inicio: 2026-11-07.

## Origen

Reescritura completa de una guía personal hecha en junio de 2026 (con Gemini y Sonnet) para preparar el parcial. Estaba en `P:/FIUBA/Asignaturas/Computacion Cuantica/app/` (un HTML de 160 KB). Se reorganizó, se corrigió y se publicó para compartir.

## Decisiones

- **Sitio estático sin build.** Se copia tal cual a `public/` del portafolio (como `public/apps/curva`). GitHub Pages sirve el archivo real antes que el `404.html` de la SPA de React, así que `/fiuba/cuantica/` no necesita rutas en React.
- **Navegación por hash** (`#/tema`), con fragmentos HTML por tema y widgets de carga diferida: la primera carga solo trae el esqueleto, el tema abierto y sus interactivos.
- **Notación y orden de la cátedra.** Seis postulados (como las slides), $|\beta_{xy}\rangle$, oráculo $U_f|x,y\rangle = |x, y\oplus f(x)\rangle$. Las intuiciones de *El Qubit de Newton* se marcan como “Intuición” y no se atribuyen a los docentes.
- **Estética del portafolio**: fondo negro, Inter + Instrument Serif, vidrio, color solo como información, tema claro y oscuro.
- **Analítica** con la misma propiedad GA4 del portafolio, solo en `facucabral.me`; cada tema envía una vista virtual. El README enlaza con `utm_source=FIUBA-Repos&utm_medium=Readme`.
- **Visor de documentos** propio con PDF.js (las hojas se dibujan a medida que entran en pantalla), botón de pestaña nueva y descarga; el enlace refleja lo abierto (`#/material?ver=s04&p=3`).

## Correcciones de contenido respecto de la versión original

Postulados renumerados según la cátedra; Deutsch con qubit auxiliar en $|1\rangle$; circuito del ejercicio 5 rehecho; sección de compuerta Y duplicada eliminada; “factorizar primos” → productos de primos; fotónica no siempre a temperatura ambiente; citas de videos ya no atribuidas al profesor; teleportación y superdensa completas; se agregaron los parciales 2026, las autoevaluaciones resueltas y los errores que descuenta la cátedra.

## Estado (2026-11-07)

- 30 páginas, 20 interactivos, 59 preguntas de quiz (52 generales + 7 de la autoevaluación 1), 27 archivos de material (11 MB).
- 7 pruebas del simulador pasan (resultados de parciales y autoevaluación 4).
- Recorrido automático en navegador: las 30 páginas cargan sin errores de consola ni fórmulas rotas; sin scroll horizontal a 390 px; visor de PDF probado con la slide de 46 hojas.
- Publicado: repo en GitHub y facucabral.me/fiuba/cuantica (PR #10 del portafolio).

## Próximos pasos posibles

- Página `facucabral.me/fiuba/` con más materias (la estructura ya está en `Portfolio/public/fiuba/index.html`).
- Enlazar `/fiuba` desde la página de ingeniero del portafolio.

## Revisión del 2026-11-07 (pedido de Facundo)

- Código de colores de Dirac (ket azul, bra violeta, braket verde, proyector naranja) aplicado automáticamente a todas las fórmulas; color por unidad en encabezados, barra lateral y tarjetas (vuelve el estilo colorido de la versión original, pedido explícito).
- “Bajada a tierra” al comienzo de cada tema, con intuiciones de El Qubit de Newton (parafraseadas, sin transcribir los videos), y 10 procesos paso a paso (`secuencia`).
- Parciales en pestañas, con los 15 enunciados transcriptos completos (incluido el recuperatorio 2026, que no tiene foto publicable).
- Machete reescrito (checklists, ayudamemorias, recetas) y `material/machete.pdf` generado con Edge sin interfaz.
- Práctica: página “Tu práctica”, grupo destacado arriba en la barra lateral con insignias (x/15, x/4…), botón “Marcar como resuelto” por ejercicio.
- Verificado: 31 páginas sin errores de consola ni de KaTeX (~1750 piezas coloreadas), sin scroll horizontal a 390 px, pestañas y marcas actualizan el estado en vivo, PDF de 5 páginas revisado.
