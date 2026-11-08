/** Circuitos de referencia: los de los parciales, autoevaluaciones y los clásicos del curso. */
import { complejo } from "../nucleo/complejos.js";

const raiz = Math.sqrt;

export const circuitosGuardados = {
  bell: {
    titulo: "Par de Bell |β₀₀⟩",
    qubits: 2, entradas: ["0", "0"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }]],
    medir: [1, 2],
  },
  ghz: {
    titulo: "Estado GHZ (3 qubits)",
    qubits: 3, entradas: ["0", "0", "0"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "CNOT", controles: [2], objetivo: 3 }]],
    medir: [1, 2, 3],
  },
  bell11: {
    titulo: "Guía 5, ej. 4: |β₁₁⟩ desde |11⟩",
    qubits: 2, entradas: ["1", "1"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }]],
    medir: [1, 2],
  },
  "recuperatorio-2024-ej1": {
    titulo: "Recuperatorio 2024 · ej. 1 (con α = 0,6 y β = 0,8)",
    qubits: 2, entradas: [[complejo(0.6), complejo(0.8)], "0"], rotulos: ["|Ψ⟩", "|0⟩"],
    columnas: [[{ tipo: "H", qubit: 1 }, { tipo: "X", qubit: 2 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "Z", qubit: 2 }]],
    marca: { columna: 3, texto: "(a)" },
    medir: [1, 2],
  },
  "parcial-2026-ej1": {
    titulo: "Parcial 11/06/2026 · ej. 1",
    qubits: 2, entradas: [[complejo(1 / raiz(5)), complejo(-2 / raiz(5))], "1"], rotulos: ["|Ψ⟩", "|1⟩"],
    columnas: [[{ tipo: "H", qubit: 1 }, { tipo: "X", qubit: 2 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "SWAP", a: 1, b: 2 }]],
    marca: { columna: 3, texto: "(a)" },
    medir: [2],
  },
  "parcial-2026-ej5": {
    titulo: "Parcial 11/06/2026 · ej. 5",
    qubits: 3, entradas: ["1", "0", "1"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "H", qubit: 2 }], [{ tipo: "CNOT", controles: [2], objetivo: 3 }]],
    marca: { columna: 4, texto: "(b)" },
    medir: [2],
  },
  "recuperatorio-ej5": {
    titulo: "Recuperatorios 2024 y 2026 · ej. 5",
    qubits: 2, entradas: ["1", "0"],
    columnas: [[{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "H", qubit: 1 }, { tipo: "X", qubit: 2 }], [{ tipo: "SWAP", a: 1, b: 2 }], [{ tipo: "Y", qubit: 1 }, { tipo: "X", qubit: 2 }]],
    medir: [1, 2],
  },
  autoevaluacion4: {
    titulo: "Autoevaluación 4 (desde el punto b)",
    qubits: 3, entradas: ["0", "0", "1"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "CNOT", controles: [1, 2], objetivo: 3 }]],
    medir: [],
  },
  "deutsch-balanceada": {
    titulo: "Deutsch con f(x) = x",
    qubits: 2, entradas: ["0", "1"],
    columnas: [[{ tipo: "H", qubit: 1 }, { tipo: "H", qubit: 2 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "H", qubit: 1 }]],
    medir: [1],
  },
  "swap-con-cnot": {
    titulo: "Guía 5, ej. 7: SWAP = 3 CNOT",
    qubits: 2, entradas: ["1", "0"],
    columnas: [[{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "CNOT", controles: [2], objetivo: 1 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }]],
    medir: [1, 2],
  },
  interferencia: {
    titulo: "H·H = I (interferencia)",
    qubits: 1, entradas: ["0"],
    columnas: [[{ tipo: "H", qubit: 1 }], [{ tipo: "H", qubit: 1 }]],
    medir: [1],
  },
};
