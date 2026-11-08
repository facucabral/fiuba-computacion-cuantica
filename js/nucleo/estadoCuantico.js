/**
 * Simulador de vector de estado para pocos qubits (el curso usa hasta 3; soporta 6).
 *
 * Convención de la cátedra: en |q1 q2 q3⟩ el qubit 1 es el de más a la izquierda
 * (bit más significativo) y es la línea de arriba del circuito.
 */
import { complejo, suma, producto, escalar, conjugado, moduloCuadrado, esCero, complejoATex, realATex, modulo } from "./complejos.js";

const R = 1 / Math.SQRT2;
const c = (re, im = 0) => complejo(re, im);

/** Matrices 2×2 de las compuertas de 1 qubit: [[a, b], [c, d]]. */
export const compuertas = {
  I: [[c(1), c(0)], [c(0), c(1)]],
  X: [[c(0), c(1)], [c(1), c(0)]],
  Y: [[c(0), c(0, -1)], [c(0, 1), c(0)]],
  Z: [[c(1), c(0)], [c(0), c(-1)]],
  H: [[c(R), c(R)], [c(R), c(-R)]],
  S: [[c(1), c(0)], [c(0), c(0, 1)]],
  T: [[c(1), c(0)], [c(0), c(R, R)]],
  Sdg: [[c(1), c(0)], [c(0), c(0, -1)]],
};

/** Corrimiento de fase R(δ) de la guía 2: |1⟩ → e^{iδ}|1⟩. */
export const faseR = (delta) => [[c(1), c(0)], [c(0), c(Math.cos(delta), Math.sin(delta))]];

export class EstadoCuantico {
  /** @param {number} cantidadQubits @param {Array<{re:number,im:number}>} [amplitudes] */
  constructor(cantidadQubits, amplitudes) {
    this.cantidadQubits = cantidadQubits;
    this.dimension = 2 ** cantidadQubits;
    this.amplitudes = amplitudes ? amplitudes.map((a) => complejo(a.re, a.im)) : Array.from({ length: this.dimension }, (_, i) => c(i === 0 ? 1 : 0));
  }

  /** Producto tensorial de estados de 1 qubit: desdeQubits([[α,β], [1,0]]) = (α|0⟩+β|1⟩)⊗|0⟩ */
  static desdeQubits(listaDeQubits) {
    let amplitudes = [c(1)];
    for (const [alfa, beta] of listaDeQubits) {
      const nuevo = [];
      for (const a of amplitudes) nuevo.push(producto(a, alfa), producto(a, beta));
      amplitudes = nuevo;
    }
    return new EstadoCuantico(listaDeQubits.length, amplitudes);
  }

  /** Estado de la base computacional a partir de su etiqueta, p. ej. "101". */
  static desdeEtiqueta(etiqueta) {
    const estado = new EstadoCuantico(etiqueta.length);
    estado.amplitudes = estado.amplitudes.map((_, i) => c(i === parseInt(etiqueta, 2) ? 1 : 0));
    return estado;
  }

  clonar() {
    return new EstadoCuantico(this.cantidadQubits, this.amplitudes);
  }

  mascaraDe(qubit) {
    return 1 << (this.cantidadQubits - qubit);
  }

  /** Aplica una matriz 2×2 al qubit indicado (1 = el de arriba), opcionalmente controlada. */
  aplicar(matriz, qubit, controles = []) {
    const mascara = this.mascaraDe(qubit);
    const mascaraControles = controles.reduce((acumulado, q) => acumulado | this.mascaraDe(q), 0);
    for (let indice = 0; indice < this.dimension; indice += 1) {
      if (indice & mascara) continue; // se recorre cada par (…0…, …1…) una sola vez
      if ((indice & mascaraControles) !== mascaraControles) continue;
      const pareja = indice | mascara;
      const a0 = this.amplitudes[indice];
      const a1 = this.amplitudes[pareja];
      this.amplitudes[indice] = suma(producto(matriz[0][0], a0), producto(matriz[0][1], a1));
      this.amplitudes[pareja] = suma(producto(matriz[1][0], a0), producto(matriz[1][1], a1));
    }
    return this;
  }

  intercambiar(qubitA, qubitB) {
    const mascaraA = this.mascaraDe(qubitA);
    const mascaraB = this.mascaraDe(qubitB);
    for (let indice = 0; indice < this.dimension; indice += 1) {
      const bitA = indice & mascaraA ? 1 : 0;
      const bitB = indice & mascaraB ? 1 : 0;
      if (bitA === 1 && bitB === 0) {
        const otro = (indice & ~mascaraA) | mascaraB;
        [this.amplitudes[indice], this.amplitudes[otro]] = [this.amplitudes[otro], this.amplitudes[indice]];
      }
    }
    return this;
  }

  probabilidades() {
    return this.amplitudes.map(moduloCuadrado);
  }

  /** Probabilidad de obtener `valor` (0 o 1) al medir solo ese qubit. */
  probabilidadDeQubit(qubit, valor) {
    const mascara = this.mascaraDe(qubit);
    return this.amplitudes.reduce((total, a, i) => ((i & mascara ? 1 : 0) === valor ? total + moduloCuadrado(a) : total), 0);
  }

  /**
   * Postulado de colapso: proyecta con P = |valor⟩⟨valor| sobre ese qubit (⊗ I en el resto)
   * y normaliza. Devuelve { probabilidad, proyectado (sin normalizar), posterior }.
   */
  proyectarQubit(qubit, valor) {
    const mascara = this.mascaraDe(qubit);
    const proyectado = this.clonar();
    proyectado.amplitudes = proyectado.amplitudes.map((a, i) => ((i & mascara ? 1 : 0) === valor ? a : c(0)));
    const probabilidad = proyectado.probabilidades().reduce((x, y) => x + y, 0);
    const posterior = proyectado.clonar();
    if (probabilidad > 1e-12) posterior.amplitudes = posterior.amplitudes.map((a) => escalar(a, 1 / Math.sqrt(probabilidad)));
    return { probabilidad, proyectado, posterior };
  }

  /** Mide un qubit al azar según Born y colapsa el estado. Devuelve el resultado 0/1. */
  medirQubit(qubit, aleatorio = Math.random) {
    const probabilidadCero = this.probabilidadDeQubit(qubit, 0);
    const resultado = aleatorio() < probabilidadCero ? 0 : 1;
    this.amplitudes = this.proyectarQubit(qubit, resultado).posterior.amplitudes;
    return resultado;
  }

  /** Mide todos los qubits: devuelve la etiqueta obtenida ("01"…). No modifica el estado. */
  muestrear(aleatorio = Math.random) {
    let azar = aleatorio();
    const probabilidades = this.probabilidades();
    for (let i = 0; i < this.dimension; i += 1) {
      azar -= probabilidades[i];
      if (azar <= 0) return this.etiqueta(i);
    }
    return this.etiqueta(this.dimension - 1);
  }

  etiqueta(indice) {
    return indice.toString(2).padStart(this.cantidadQubits, "0");
  }

  /** ⟨φ|ψ⟩ — conjuga las amplitudes del bra (el error más marcado en los parciales). */
  productoInterno(otro) {
    return this.amplitudes.reduce((total, a, i) => suma(total, producto(conjugado(otro.amplitudes[i]), a)), c(0));
  }

  /** Vector de Bloch reducido de un qubit (traza parcial). Largo 1 = puro; menos de 1 = entrelazado con el resto. */
  vectorDeBloch(qubit = 1) {
    const mascara = this.mascaraDe(qubit);
    let rho00 = 0;
    let rho11 = 0;
    let rho01 = c(0);
    for (let i = 0; i < this.dimension; i += 1) {
      if (i & mascara) continue;
      const a0 = this.amplitudes[i];
      const a1 = this.amplitudes[i | mascara];
      rho00 += moduloCuadrado(a0);
      rho11 += moduloCuadrado(a1);
      rho01 = suma(rho01, producto(a0, conjugado(a1)));
    }
    return { x: 2 * rho01.re, y: -2 * rho01.im, z: rho00 - rho11 };
  }

  /** ¿Se puede escribir como producto de qubits individuales? (pureza de cada reducido) */
  esSeparable() {
    for (let q = 1; q <= this.cantidadQubits; q += 1) {
      const { x, y, z } = this.vectorDeBloch(q);
      if (Math.hypot(x, y, z) < 1 - 1e-6) return false;
    }
    return true;
  }

  /**
   * Notación de Dirac en TeX. Si todas las amplitudes no nulas tienen el mismo módulo,
   * lo saca de factor común: ½(|00⟩ − |01⟩ + i|11⟩), como se escribe en clase.
   */
  aTex({ simboloBase = (etiqueta) => `|${etiqueta}\\rangle` } = {}) {
    const terminos = this.amplitudes.map((a, i) => ({ a, etiqueta: this.etiqueta(i) })).filter(({ a }) => !esCero(a, 1e-9));
    if (!terminos.length) return "0";
    const modulos = terminos.map(({ a }) => modulo(a));
    const mismoModulo = terminos.length > 1 && modulos.every((m) => Math.abs(m - modulos[0]) < 1e-7);
    const factor = mismoModulo ? modulos[0] : 1;

    let texto = "";
    terminos.forEach(({ a, etiqueta }, posicion) => {
      const { signo, cuerpo, sinSignoExterno } = complejoATex(escalar(a, 1 / factor));
      const coeficiente = cuerpo === "1" ? "" : cuerpo;
      const conector = sinSignoExterno ? (posicion === 0 ? "" : " + ") : posicion === 0 ? (signo === "-" ? "-" : "") : ` ${signo} `;
      texto += `${conector}${coeficiente}${simboloBase(etiqueta)}`;
    });
    if (!mismoModulo) return texto;
    const factorTex = realATex(factor);
    return factorTex === "1" ? texto : `${factorTex}\\left(${texto}\\right)`;
  }

  /** Lista de amplitudes en TeX con su etiqueta (para tablas). */
  amplitudesTex() {
    return this.amplitudes.map((a, i) => {
      const { signo, cuerpo, sinSignoExterno } = complejoATex(a);
      return { etiqueta: this.etiqueta(i), tex: esCero(a) ? "0" : sinSignoExterno || signo === "+" ? cuerpo : `-${cuerpo}`, probabilidad: moduloCuadrado(a) };
    });
  }
}

/** Estado de 1 qubit a partir de ángulos de Bloch: cos(θ/2)|0⟩ + e^{iφ} sen(θ/2)|1⟩ */
export function qubitDesdeBloch(theta, phi) {
  return [c(Math.cos(theta / 2)), c(Math.sin(theta / 2) * Math.cos(phi), Math.sin(theta / 2) * Math.sin(phi))];
}

/** Ángulos de Bloch desde amplitudes (descarta la fase global). */
export function blochDesdeQubit(alfa, beta) {
  const theta = 2 * Math.acos(Math.min(1, modulo(alfa)));
  const phi = Math.atan2(beta.im, beta.re) - Math.atan2(alfa.im, alfa.re);
  return { theta, phi: ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) };
}

export const estadosNotables = {
  "0": [c(1), c(0)],
  "1": [c(0), c(1)],
  "+": [c(R), c(R)],
  "-": [c(R), c(-R)],
  "+i": [c(R), c(0, R)],
  "-i": [c(R), c(0, -R)],
};
