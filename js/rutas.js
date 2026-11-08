/**
 * Mapa de contenidos. Cada página es un fragmento HTML en `paginas/<id>.html`.
 * Agregar un tema = sumar una entrada acá y crear su fragmento; el índice, la búsqueda,
 * el progreso y la navegación anterior/siguiente salen de esta lista.
 *
 * `slides` y `guias` referencian ids de js/datos/material.js para mostrar el material relacionado.
 */

export const grupos = [
  { id: "comenzar", titulo: "Comenzar", color: "--acento" },
  { id: "practica", titulo: "Práctica para el parcial", color: "--u-practica" },
  { id: "fundamentos", titulo: "1 · Fundamentos", color: "--u-fundamentos" },
  { id: "matematica", titulo: "2 · Matemática", color: "--u-matematica" },
  { id: "mecanica", titulo: "3 · Mecánica cuántica", color: "--u-mecanica" },
  { id: "qubits", titulo: "4 · Qubits", color: "--u-qubits" },
  { id: "circuitos", titulo: "5 · Compuertas y circuitos", color: "--u-circuitos" },
  { id: "algoritmos", titulo: "6 · Algoritmos y protocolos", color: "--u-algoritmos" },
  { id: "material", titulo: "Material de la cátedra", color: "--u-material" },
];

export const paginas = [
  { id: "inicio", grupo: "comenzar", titulo: "Inicio", resumen: "Cómo usar estos apuntes, modelo del parcial y ruta de estudio.", claves: "parcial modelo plan ruta estudio" },
  { id: "laboratorio", grupo: "comenzar", titulo: "Laboratorio de circuitos", resumen: "Simulador libre de hasta 3 qubits con el estado en notación de Dirac.", claves: "simulador composer circuito qubits", amplia: true },

  { id: "por-que", grupo: "fundamentos", numero: "1.1", titulo: "¿Por qué computación cuántica?", resumen: "Feynman, el crecimiento exponencial y qué problemas sí acelera.", claves: "feynman exponencial historia moore motivacion", slides: ["s01"] },
  { id: "tecnologias", grupo: "fundamentos", numero: "1.2", titulo: "Tecnologías de qubits", resumen: "Superconductores, iones, fotones, átomos neutros, RMN y topológicos.", claves: "hardware superconductores fotonica iones topologicos rmn nisq decoherencia", slides: ["s01"] },

  { id: "complejos", grupo: "matematica", numero: "2.1", titulo: "Números complejos", resumen: "Módulo, fase, conjugado y por qué las amplitudes son complejas.", claves: "complejo modulo fase conjugado euler polar" },
  { id: "dirac", grupo: "matematica", numero: "2.2", titulo: "Notación de Dirac", resumen: "Kets, bras, producto interno, bases ortonormales y cambio de base.", claves: "bra ket braket producto interno base ortonormal normalizacion", slides: ["s02"], guias: ["g1"] },
  { id: "operadores", grupo: "matematica", numero: "2.3", titulo: "Operadores lineales", resumen: "Hermíticos, unitarios, proyectores, autovalores y clausura.", claves: "operador hermitico unitario proyector autovalor autovector adjunto clausura matriz", slides: ["s03"], guias: ["g2"] },

  { id: "postulados", grupo: "mecanica", numero: "3.1", titulo: "Los postulados", resumen: "Los 6 postulados de la cátedra: estado, observables, medición, Born, colapso y evolución.", claves: "postulado born colapso observable medicion evolucion unitaria hilbert", slides: ["s04"], guias: ["g3"] },
  { id: "stern-gerlach", grupo: "mecanica", numero: "3.2", titulo: "Experimento de Stern-Gerlach", resumen: "El spin está cuantizado: el experimento que inspira al qubit.", claves: "stern gerlach spin plata iman cuantizado", slides: ["s05"] },

  { id: "qubit", grupo: "qubits", numero: "4.1", titulo: "El qubit y la medición", resumen: "Superposición, amplitudes, regla de Born y repetición de mediciones.", claves: "qubit superposicion amplitud probabilidad medicion shots moneda", slides: ["s06"] },
  { id: "bloch", grupo: "qubits", numero: "4.2", titulo: "Esfera de Bloch", resumen: "Todos los estados de un qubit como puntos de una esfera.", claves: "bloch esfera theta phi fase global relativa", slides: ["s06", "s07"] },
  { id: "sistemas", grupo: "qubits", numero: "4.3", titulo: "Sistemas de qubits", resumen: "Producto tensorial, base de 2 y 3 qubits, medir un solo qubit.", claves: "producto tensorial kronecker dos qubits medicion parcial", slides: ["s07"], guias: ["g4"] },
  { id: "entrelazamiento", grupo: "qubits", numero: "4.4", titulo: "Entrelazamiento y estados de Bell", resumen: "Estados no separables, EPR y correlaciones entre Alice y Bob.", claves: "entrelazamiento bell epr alice bob separable correlacion", slides: ["s07"], guias: ["g4"] },
  { id: "fotones", grupo: "qubits", numero: "4.5", titulo: "Fotones y polarizadores", resumen: "Polarización H/V y D/A: el ejercicio 3 del parcial.", claves: "foton polarizador polarizacion horizontal vertical diagonal antidiagonal malus", slides: ["s07"] },

  { id: "compuertas", grupo: "circuitos", numero: "5.1", titulo: "Compuertas cuánticas", resumen: "X, Y, Z, H, S, T, CNOT, CZ, SWAP y Toffoli con su efecto en la esfera.", claves: "compuerta pauli hadamard cnot swap toffoli fase rotacion", slides: ["s08", "s09"], guias: ["g5"] },
  { id: "circuitos", grupo: "circuitos", numero: "5.2", titulo: "Circuitos cuánticos", resumen: "Cómo leer un circuito, escribir el algoritmo y medir con el formalismo.", claves: "circuito algoritmo lectura medicion proyector formalismo", slides: ["s10"], guias: ["g5", "g6"] },

  { id: "paralelismo", grupo: "algoritmos", numero: "6.1", titulo: "Paralelismo e interferencia", resumen: "Evaluar f(0) y f(1) a la vez y amplificar la respuesta buscada.", claves: "paralelismo interferencia constructiva destructiva oraculo uf", slides: ["s11", "s12"] },
  { id: "deutsch", grupo: "algoritmos", numero: "6.2", titulo: "Algoritmo de Deutsch", resumen: "¿Constante o balanceada? Una sola consulta al oráculo.", claves: "deutsch constante balanceada oraculo phase kickback" },
  { id: "no-clonacion", grupo: "algoritmos", numero: "6.3", titulo: "Teorema de no-clonación", resumen: "Por qué no existe el copiar y pegar cuántico.", claves: "no clonacion copia teorema" },
  { id: "teleportacion", grupo: "algoritmos", numero: "6.4", titulo: "Teleportación cuántica", resumen: "Enviar un qubit con un par de Bell y dos bits clásicos.", claves: "teleportacion protocolo alice bob bits clasicos" },
  { id: "superdensa", grupo: "algoritmos", numero: "6.5", titulo: "Codificación superdensa", resumen: "Enviar dos bits clásicos mandando un solo qubit.", claves: "superdensa superdense coding dos bits" },
  { id: "bb84", grupo: "algoritmos", numero: "6.6", titulo: "Criptografía BB84", resumen: "Distribución cuántica de claves y cómo se detecta a Eve.", claves: "bb84 criptografia qkd clave espia eve" },
  { id: "densidad", grupo: "algoritmos", numero: "6.7", titulo: "Matriz densidad (extra)", resumen: "Estados mixtos, pureza y la bola de Bloch.", claves: "matriz densidad mixto puro traza pureza" },

  { id: "mi-practica", grupo: "practica", titulo: "Tu práctica", resumen: "Todo lo que hay para practicar y cuánto llevás hecho.", claves: "practica progreso estado resueltos avance" },
  { id: "machete", grupo: "practica", titulo: "Machete del parcial", resumen: "Todo lo que hay que saber escrito en una página, y los errores que marca la cátedra.", claves: "machete resumen cheatsheet errores formulas" },
  { id: "parciales", grupo: "practica", titulo: "Parciales resueltos", resumen: "Recuperatorio 2024, parcial y recuperatorio 2026, paso a paso.", claves: "parcial recuperatorio examen resuelto ejercicio", amplia: true },
  { id: "autoevaluaciones", grupo: "practica", titulo: "Autoevaluaciones del campus", resumen: "Las 4 autoevaluaciones con resolución guiada.", claves: "autoevaluacion campus verdadero falso" },
  { id: "quiz", grupo: "practica", titulo: "Quiz por tema", resumen: "Preguntas rápidas con explicación para fijar conceptos.", claves: "quiz preguntas test multiple choice" },
  { id: "practica", grupo: "practica", titulo: "Ejercicios infinitos", resumen: "Circuitos generados al azar para practicar el ejercicio 1 y 5.", claves: "practica ejercicios generador aleatorio circuitos" },

  { id: "material", grupo: "material", titulo: "Biblioteca", resumen: "Slides, guías, autoevaluaciones y enunciados: ver, abrir o descargar.", claves: "pdf slides guias material descargar diapositivas" },
  { id: "acerca", grupo: "material", titulo: "Fuentes y créditos", resumen: "De dónde sale cada cosa y cómo colaborar.", claves: "creditos fuentes youtube qubit newton bibliografia" },
];

export const buscarGrupo = (id) => grupos.find((grupo) => grupo.id === id);

export const buscarPagina = (id) => paginas.find((pagina) => pagina.id === id);

export const indiceDePagina = (id) => paginas.findIndex((pagina) => pagina.id === id);
