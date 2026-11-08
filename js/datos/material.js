/**
 * Material de la cátedra publicado en `material/`. Lo genera herramientas/prepararMaterial.py.
 * `tipo`: pdf | imagen. `paginas` es informativo (se muestra en la biblioteca).
 */
export const categorias = [
  { id: "apuntes", titulo: "Resúmenes de estos apuntes", descripcion: "Para tener a mano sin conexión." },
  { id: "slides", titulo: "Slides de clase", descripcion: "Las presentaciones de la cátedra, en el orden en que se dieron." },
  { id: "guias", titulo: "Guías de ejercicios", descripcion: "Seminarios con ejercicios para practicar (algunos se resuelven en clase)." },
  { id: "autoevaluaciones", titulo: "Autoevaluaciones", descripcion: "Las del campus con su respuesta oficial. Resueltas paso a paso en Práctica." },
  { id: "parciales", titulo: "Enunciados de parciales", descripcion: "Fotos de los enunciados. Las resoluciones están en Parciales resueltos." },
];

export const material = [
  { id: "machete", categoria: "apuntes", titulo: "Machete del parcial (PDF)", archivo: "machete.pdf", tema: "machete" },
  { id: "s01", categoria: "slides", titulo: "1 · Presentación de la materia", archivo: "slides/01-presentacion-de-la-materia.pdf", paginas: 46, tema: "por-que" },
  { id: "s02", categoria: "slides", titulo: "2 · Notación de Dirac", archivo: "slides/02-notacion-de-dirac.pdf", paginas: 13, tema: "dirac" },
  { id: "s03", categoria: "slides", titulo: "3 · Operadores lineales", archivo: "slides/03-operadores-lineales.pdf", paginas: 12, tema: "operadores" },
  { id: "s04", categoria: "slides", titulo: "4 · Postulados de la mecánica cuántica", archivo: "slides/04-postulados.pdf", paginas: 25, tema: "postulados" },
  { id: "s05", categoria: "slides", titulo: "5 · Experimento de Stern-Gerlach", archivo: "slides/05-stern-gerlach.pdf", paginas: 16, tema: "stern-gerlach" },
  { id: "s06", categoria: "slides", titulo: "6 · Qubit (parte 1)", archivo: "slides/06-qubit-parte-1.pdf", paginas: 25, tema: "qubit" },
  { id: "s07", categoria: "slides", titulo: "7 · Qubit (parte 2)", archivo: "slides/07-qubit-parte-2.pdf", paginas: 34, tema: "sistemas" },
  { id: "s08", categoria: "slides", titulo: "8 · Compuertas cuánticas (parte 1)", archivo: "slides/08-compuertas-parte-1.pdf", paginas: 24, tema: "compuertas" },
  { id: "s09", categoria: "slides", titulo: "9 · Compuertas cuánticas (parte 2)", archivo: "slides/09-compuertas-parte-2.pdf", paginas: 27, tema: "compuertas" },
  { id: "s10", categoria: "slides", titulo: "10 · Circuitos cuánticos", archivo: "slides/10-circuitos-cuanticos.pdf", paginas: 10, tema: "circuitos" },
  { id: "s11", categoria: "slides", titulo: "11 · Paralelismo cuántico", archivo: "slides/11-paralelismo-cuantico.pdf", paginas: 10, tema: "paralelismo" },
  { id: "s12", categoria: "slides", titulo: "12 · Interferencia cuántica", archivo: "slides/12-interferencia-cuantica.pdf", paginas: 4, tema: "paralelismo" },

  { id: "g1", categoria: "guias", titulo: "Guía 1 · Notación de Dirac", archivo: "guias/guia-1-notacion-de-dirac.pdf", paginas: 4, tema: "dirac" },
  { id: "g2", categoria: "guias", titulo: "Guía 2 · Operadores hermíticos, unitarios y proyectores", archivo: "guias/guia-2-operadores-lineales.pdf", paginas: 3, tema: "operadores" },
  { id: "g3", categoria: "guias", titulo: "Guía 3 · Postulados de la mecánica cuántica", archivo: "guias/guia-3-postulados.pdf", paginas: 3, tema: "postulados" },
  { id: "g4", categoria: "guias", titulo: "Guía 4 · Mediciones sobre qubits y estados entrelazados", archivo: "guias/guia-4-mediciones-y-entrelazados.pdf", paginas: 3, tema: "entrelazamiento" },
  { id: "g5", categoria: "guias", titulo: "Guía 5 · Compuertas elementales y circuitos", archivo: "guias/guia-5-compuertas-y-circuitos.pdf", paginas: 3, tema: "compuertas" },
  { id: "g6", categoria: "guias", titulo: "Guía 6 · Circuitos cuánticos (13 circuitos)", archivo: "guias/guia-6-circuitos-cuanticos.pdf", paginas: 4, tema: "circuitos" },

  { id: "a1", categoria: "autoevaluaciones", tipo: "imagen", titulo: "Autoevaluación 1 · Notación de Dirac (enunciado)", archivo: "autoevaluaciones/1-notacion-de-dirac.webp", tema: "autoevaluaciones" },
  { id: "a2", categoria: "autoevaluaciones", tipo: "imagen", titulo: "Autoevaluación 2 · Postulados (enunciado)", archivo: "autoevaluaciones/2-postulados.webp", tema: "autoevaluaciones" },
  { id: "a2r", categoria: "autoevaluaciones", titulo: "Autoevaluación 2 · Postulados (respuesta)", archivo: "autoevaluaciones/2-postulados-respuesta.pdf", paginas: 2, tema: "autoevaluaciones" },
  { id: "a3", categoria: "autoevaluaciones", tipo: "imagen", titulo: "Autoevaluación 3 · Sistemas de qubits (enunciado)", archivo: "autoevaluaciones/3-sistemas-de-qubits.webp", tema: "autoevaluaciones" },
  { id: "a3r", categoria: "autoevaluaciones", titulo: "Autoevaluación 3 · Sistemas de qubits (respuesta)", archivo: "autoevaluaciones/3-sistemas-de-qubits-respuesta.pdf", paginas: 2, tema: "autoevaluaciones" },
  { id: "a4", categoria: "autoevaluaciones", tipo: "imagen", titulo: "Autoevaluación 4 · Circuitos cuánticos (enunciado)", archivo: "autoevaluaciones/4-circuitos.webp", tema: "autoevaluaciones" },
  { id: "a4r", categoria: "autoevaluaciones", titulo: "Autoevaluación 4 · Circuitos cuánticos (respuesta)", archivo: "autoevaluaciones/4-circuitos-respuesta.pdf", paginas: 2, tema: "autoevaluaciones" },

  { id: "p2024", categoria: "parciales", tipo: "imagen", titulo: "Primer recuperatorio · 19/06/2024", archivo: "parciales/recuperatorio-2024-06-19.webp", tema: "parciales" },
  { id: "p2026", categoria: "parciales", tipo: "imagen", titulo: "Parcial · 11/06/2026", archivo: "parciales/parcial-2026-06-11.webp", tema: "parciales" },
];

export const buscarMaterial = (id) => material.find((item) => item.id === id);
export const rutaMaterial = (item) => `material/${item.archivo}`;
