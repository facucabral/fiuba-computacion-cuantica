/**
 * Circuitos como datos: se simulan con EstadoCuantico y se dibujan en SVG.
 *
 * Formato:
 * {
 *   qubits: 2,
 *   entradas: [[α,β] | "0"|"1"|"+"|"-"],     // estado inicial de cada qubit
 *   rotulos: ["|\\Psi\\rangle", "|0\\rangle"], // opcional: texto que se dibuja a la izquierda
 *   columnas: [[{ tipo: "H", qubit: 1 }, { tipo: "X", qubit: 2 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }]],
 *   medir: [2],                               // qubits con medidor al final
 *   marca: { columna: 3, texto: "(a)" }        // línea punteada después de esa columna
 * }
 * Tipos: H X Y Z S T (1 qubit) · CNOT/CZ { controles, objetivo } · SWAP { a, b }
 */
import { EstadoCuantico, compuertas, estadosNotables } from "./estadoCuantico.js";

export const compuertasDeUnQubit = ["H", "X", "Y", "Z", "S", "T"];

export function estadoInicial(circuito) {
  const qubits = circuito.entradas.map((entrada) => (typeof entrada === "string" ? estadosNotables[entrada] : entrada));
  return EstadoCuantico.desdeQubits(qubits);
}

export function aplicarOperacion(estado, operacion) {
  switch (operacion.tipo) {
    case "CNOT": return estado.aplicar(compuertas.X, operacion.objetivo, operacion.controles);
    case "CZ": return estado.aplicar(compuertas.Z, operacion.objetivo, operacion.controles);
    case "SWAP": return estado.intercambiar(operacion.a, operacion.b);
    default: return estado.aplicar(compuertas[operacion.tipo], operacion.qubit);
  }
}

/** Estados después de cada columna: [inicial, tras col 1, tras col 2, …]. */
export function simularPorColumnas(circuito) {
  const estados = [estadoInicial(circuito)];
  for (const columna of circuito.columnas) {
    const siguiente = estados.at(-1).clonar();
    for (const operacion of columna) aplicarOperacion(siguiente, operacion);
    estados.push(siguiente);
  }
  return estados;
}

/** Qubits que toca una operación (para validar que no se pisen en la misma columna). */
export function qubitsDe(operacion) {
  if (operacion.tipo === "SWAP") return [operacion.a, operacion.b];
  if (operacion.controles) return [...operacion.controles, operacion.objetivo];
  return [operacion.qubit];
}

/** Matriz de la columna escrita como en el parcial: (H ⊗ X), CNOT₁,₂, SWAP… */
export function columnaATex(columna, cantidadQubits) {
  const multi = columna.find((op) => op.controles || op.tipo === "SWAP");
  if (multi) {
    if (multi.tipo === "SWAP") return "\\mathrm{SWAP}";
    const nombre = multi.controles.length === 2 ? "\\mathrm{CCNOT}" : `\\mathrm{${multi.tipo}}`;
    return `${nombre}_{${[...multi.controles, multi.objetivo].join(",")}}`;
  }
  const factores = Array.from({ length: cantidadQubits }, (_, i) => columna.find((op) => op.qubit === i + 1)?.tipo || "I");
  return factores.join(" \\otimes ");
}

/** "Algoritmo cuántico" como pide el enunciado: U_n ⋯ U_1 |Ψ₀⟩ (se escribe de derecha a izquierda). */
export function algoritmoATex(circuito, nombreFinal = "\\Psi_a") {
  const factores = circuito.columnas.map((columna) => `\\left(${columnaATex(columna, circuito.qubits)}\\right)`).reverse();
  return `|${nombreFinal}\\rangle = ${factores.join("")}\\,|\\Psi_0\\rangle`;
}

// ── Dibujo ──
const PASO_X = 62;
const PASO_Y = 52;
const MARGEN_IZQ = 74;
const LADO = 34;

const textoSvg = (x, y, contenido, clase = "", ancla = "middle") =>
  `<text x="${x}" y="${y}" class="${clase}" text-anchor="${ancla}" dominant-baseline="central">${contenido}</text>`;

const rotuloPlano = (entrada) => {
  if (typeof entrada !== "string") return "|ψ⟩";
  return { "+": "|+⟩", "-": "|−⟩" }[entrada] || `|${entrada}⟩`;
};

/**
 * @param {object} circuito
 * @param {{ columnaResaltada?: number, interactivo?: boolean }} opciones
 *        columnaResaltada: índice 1..n de la columna recién aplicada (0 = estado inicial)
 */
export function dibujarCircuito(circuito, { columnaResaltada = -1, interactivo = false, columnasMinimas = 0 } = {}) {
  const totalColumnas = Math.max(circuito.columnas.length, columnasMinimas);
  const ancho = MARGEN_IZQ + totalColumnas * PASO_X + (circuito.medir?.length ? 70 : 30);
  const alto = circuito.qubits * PASO_Y + 18;
  const yDe = (qubit) => 18 + (qubit - 0.5) * PASO_Y;
  const xDe = (columna) => MARGEN_IZQ + (columna - 0.5) * PASO_X;
  const partes = [];

  if (columnaResaltada > 0) partes.push(`<rect class="resalte" x="${xDe(columnaResaltada) - PASO_X / 2 + 4}" y="2" width="${PASO_X - 8}" height="${alto - 4}" rx="10"/>`);

  for (let q = 1; q <= circuito.qubits; q += 1) {
    const rotulo = circuito.rotulos?.[q - 1] ?? rotuloPlano(circuito.entradas[q - 1]);
    partes.push(textoSvg(MARGEN_IZQ - 16, yDe(q), rotulo, "rotulo-qubit", "end"));
    partes.push(`<line class="cable" x1="${MARGEN_IZQ - 8}" y1="${yDe(q)}" x2="${ancho - (circuito.medir?.includes(q) ? 40 : 14)}" y2="${yDe(q)}"/>`);
  }

  if (interactivo) {
    for (let col = 1; col <= totalColumnas; col += 1) {
      for (let q = 1; q <= circuito.qubits; q += 1) {
        partes.push(`<rect class="celda" data-columna="${col}" data-qubit="${q}" x="${xDe(col) - PASO_X / 2 + 3}" y="${yDe(q) - PASO_Y / 2 + 3}" width="${PASO_X - 6}" height="${PASO_Y - 6}" rx="9"/>`);
      }
    }
  }

  circuito.columnas.forEach((columna, indice) => {
    const x = xDe(indice + 1);
    for (const operacion of columna) partes.push(dibujarOperacion(operacion, x, yDe, indice + 1));
  });

  if (circuito.marca) {
    const x = xDe(circuito.marca.columna) + PASO_X / 2;
    partes.push(`<line class="marca" x1="${x}" y1="6" x2="${x}" y2="${alto - 14}"/>`);
    partes.push(textoSvg(x, alto - 5, circuito.marca.texto, "texto-marca"));
  }

  for (const q of circuito.medir || []) {
    const x = ancho - 40;
    const y = yDe(q);
    partes.push(`<g class="medidor"><rect x="${x}" y="${y - 14}" width="30" height="28" rx="5"/><path d="M${x + 5} ${y + 7} A 11 11 0 0 1 ${x + 25} ${y + 7}"/><line x1="${x + 15}" y1="${y + 8}" x2="${x + 23}" y2="${y - 8}"/></g>`);
  }

  return `<svg class="circuito" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" role="img" aria-label="Circuito cuántico de ${circuito.qubits} qubits">${partes.join("")}</svg>`;
}

function dibujarOperacion(operacion, x, yDe, columna) {
  const datos = `data-columna="${columna}"`;
  if (operacion.tipo === "SWAP") {
    const [ya, yb] = [yDe(operacion.a), yDe(operacion.b)];
    const cruz = (y) => `<path class="trazo" d="M${x - 7} ${y - 7} L${x + 7} ${y + 7} M${x + 7} ${y - 7} L${x - 7} ${y + 7}"/>`;
    return `<g class="operacion" ${datos}><line class="trazo" x1="${x}" y1="${ya}" x2="${x}" y2="${yb}"/>${cruz(ya)}${cruz(yb)}</g>`;
  }
  if (operacion.controles) {
    const ys = [...operacion.controles, operacion.objetivo].map(yDe);
    const yObjetivo = yDe(operacion.objetivo);
    const puntos = operacion.controles.map((q) => `<circle class="control" cx="${x}" cy="${yDe(q)}" r="5.5"/>`).join("");
    const objetivo = operacion.tipo === "CZ"
      ? `<circle class="control" cx="${x}" cy="${yObjetivo}" r="5.5"/>`
      : `<circle class="objetivo" cx="${x}" cy="${yObjetivo}" r="12"/><path class="trazo" d="M${x - 12} ${yObjetivo} H${x + 12} M${x} ${yObjetivo - 12} V${yObjetivo + 12}"/>`;
    return `<g class="operacion" ${datos}><line class="trazo" x1="${x}" y1="${Math.min(...ys)}" x2="${x}" y2="${Math.max(...ys)}"/>${puntos}${objetivo}</g>`;
  }
  const y = yDe(operacion.qubit);
  return `<g class="operacion compuerta-${operacion.tipo}" ${datos}><rect class="caja" x="${x - LADO / 2}" y="${y - LADO / 2}" width="${LADO}" height="${LADO}" rx="7"/>${textoSvg(x, y + 1, operacion.tipo, "texto-compuerta")}</g>`;
}
