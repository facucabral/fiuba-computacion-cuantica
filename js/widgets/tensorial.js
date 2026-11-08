/** Producto tensorial de dos qubits y test de separabilidad c00·c11 − c01·c10. */
import { crearMarcoWidget, crear, escribirTex, segmentado } from "../nucleo/utilidades.js";
import { EstadoCuantico, estadosNotables } from "../nucleo/estadoCuantico.js";
import { complejo, producto, resta, esCero, coeficienteATex } from "../nucleo/complejos.js";

const OPCIONES = ["0", "1", "+", "-", "+i", "-i"].map((v) => ({ valor: v, texto: `|${v.replace("-", "−")}⟩` }));
const R = 1 / Math.SQRT2;
const c = (re, im = 0) => complejo(re, im);

const EJEMPLOS = [
  { nombre: "Bell |β₀₀⟩", amplitudes: [c(R), c(0), c(0), c(R)] },
  { nombre: "Bell |β₁₁⟩", amplitudes: [c(0), c(R), c(-R), c(0)] },
  { nombre: "Guía 4, ej. 4: ½(|00⟩−|01⟩+|10⟩−|11⟩)", amplitudes: [c(0.5), c(-0.5), c(0.5), c(-0.5)] },
  { nombre: "Recup. 2026, ej. 5: i/√2 (|11⟩−|10⟩)", amplitudes: [c(0), c(0), c(0, -R), c(0, R)] },
  { nombre: "Parcial 2026, ej. 1: (−|00⟩+3|11⟩)/√10", amplitudes: [c(-1 / Math.sqrt(10)), c(0), c(0), c(3 / Math.sqrt(10))] },
  { nombre: "½(|00⟩+|01⟩+|10⟩−|11⟩)", amplitudes: [c(0.5), c(0.5), c(0.5), c(-0.5)] },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Producto tensorial", titulo: "Armar y desarmar estados de 2 qubits" });
  let primero = "+";
  let segundo = "0";

  const salidaProducto = crear("div", { clase: "lectura-estado" });
  const selectorEjemplo = crear("select", { "aria-label": "Estado a analizar" }, EJEMPLOS.map((e, i) => crear("option", { value: i, texto: e.nombre })));
  const salidaTest = crear("div", { clase: "lectura-estado" });
  const veredicto = crear("p", { clase: "chico" });

  cuerpo.append(
    crear("h5", { clase: "subtitulo-widget", texto: "1 · Armá un estado producto" }),
    crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Qubit 1:" }), segmentado(OPCIONES, primero, (v) => { primero = v; pintarProducto(); }, "Qubit 1")]),
    crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Qubit 2:" }), segmentado(OPCIONES, segundo, (v) => { segundo = v; pintarProducto(); }, "Qubit 2")]),
    salidaProducto,
    crear("h5", { clase: "subtitulo-widget", texto: "2 · ¿Separable o entrelazado?" }),
    selectorEjemplo, salidaTest, veredicto,
  );
  selectorEjemplo.addEventListener("change", pintarTest);

  function vectorTex(amplitudes) {
    return `\\begin{pmatrix}${amplitudes.map((a) => (esCero(a) ? "0" : coeficienteATex(a))).join("\\\\")}\\end{pmatrix}`;
  }

  function pintarProducto() {
    const a = estadosNotables[primero];
    const b = estadosNotables[segundo];
    const estado = EstadoCuantico.desdeQubits([a, b]);
    const nombre = (v) => `|${v === "-" ? "-" : v === "-i" ? "-i" : v}\\rangle`;
    escribirTex(salidaProducto, `${nombre(primero)}\\otimes${nombre(segundo)} = ${vectorTex(a)}\\otimes${vectorTex(b)} = ${vectorTex(estado.amplitudes)} = ${estado.aTex()}`, true);
  }

  function pintarTest() {
    const { amplitudes } = EJEMPLOS[Number(selectorEjemplo.value)];
    const estado = new EstadoCuantico(2, amplitudes);
    const [c00, c01, c10, c11] = amplitudes;
    const determinante = resta(producto(c00, c11), producto(c01, c10));
    const tex = (v) => (esCero(v) ? "0" : coeficienteATex(v));
    escribirTex(salidaTest, `\\begin{aligned}|\\psi\\rangle &= ${estado.aTex()}\\\\ c_{00}c_{11} - c_{01}c_{10} &= (${tex(c00)})(${tex(c11)}) - (${tex(c01)})(${tex(c10)}) = ${tex(determinante)}\\end{aligned}`, true);
    veredicto.innerHTML = esCero(determinante, 1e-9)
      ? '<span class="chip exito">Separable</span> Se puede escribir como |ψ₁⟩ ⊗ |ψ₂⟩.'
      : '<span class="chip acento">Entrelazado</span> No existe ninguna factorización |ψ₁⟩ ⊗ |ψ₂⟩.';
  }

  pintarProducto();
  pintarTest();
}
