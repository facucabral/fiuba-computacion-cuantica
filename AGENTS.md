# Acuerdos del repositorio

Apuntes interactivos de Computación Cuántica (FIUBA, TB032). Se publican en `facucabral.me/fiuba/cuantica/` copiando el sitio a `Portfolio/public/fiuba/cuantica/` y se listan en FIUBA Repos con los topics `fiuba` y `tb032`.

## Contexto y continuidad

- Leer `docs/contexto.md` antes de cambiar algo. Ahí están las decisiones, el estado y los pendientes.
- En el equipo de Facundo, consultar `P:/GitHub/ConfiguracionIA/memoria/preferencias.md` y `P:/GitHub/ConfiguracionIA/plugin/skills/ingenieria-facundo/SKILL.md`.
- No copiar datos personales, memoria ni material privado de la cursada al repo (ver “Privacidad”).

## Código

- Español en nombres propios, carpetas y comentarios; camelCase en funciones y variables.
- Sitio estático sin compilación: HTML, CSS y módulos ES. Librerías externas solo desde cdnjs con versión fija (KaTeX 0.16.9, PDF.js 3.11.174); si se agrega una, sumar su origen a la CSP de `index.html`.
- Colores solo como tokens en `css/base.css` (regla del portafolio: el color es información). Componentes visuales compartidos en `css/componentes.css`.
- Un tema = una entrada en `js/rutas.js` + `paginas/<id>.html`. Un interactivo = `js/widgets/<nombre>.js` con `export function montar(contenedor)`, usado como `<div data-widget="nombre">`.
- Las fórmulas pasan por `colorearDirac` (js/nucleo/utilidades.js), que pinta kets, bras, brakets y proyectores. Para resaltar un cambio en un paso: `\htmlClass{q-cambio}{…}`.
- Procesos paso a paso: `<div data-widget="secuencia">` con hijos `.paso-visual`. Pestañas: `data-widget="pestanas"` con `<section data-pestana>`. Ejercicios con seguimiento: `data-ejercicio="id"` (ids en js/nucleo/progresoPractica.js).
- Los resultados numéricos que se publican (parciales, autoevaluaciones) se verifican en `pruebas/`.

## Comandos comprobados

- Servir: `python -m http.server 5173` (o `npm start`) y abrir http://localhost:5173.
- Pruebas: `node --test pruebas/*.test.mjs` (o `npm test`).
- Material: `python -I herramientas/prepararMaterial.py "P:/FIUBA/Asignaturas/Computacion Cuantica"`.
- Machete en PDF (con el sitio servido): `powershell -File herramientas/generarMachetePdf.ps1`.
- Portafolio: `python -I herramientas/copiarAlPortafolio.py ../Portfolio` (o `npm run portafolio`).

## Privacidad

`herramientas/prepararMaterial.py` copia solo una lista explícita. Quedan afuera a propósito: el TP (exposición de fotónica), las resoluciones y notas propias del recuperatorio, la foto del recuperatorio 2026 (tiene nombre, legajo y nota), los mails de la cátedra, las transcripciones de clases y de videos.
