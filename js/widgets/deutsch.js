/** Algoritmo de Deutsch con el oráculo U_f|x,y⟩ = |x, y⊕f(x)⟩ implementado con compuertas. */
import { crearMarcoWidget, crear, segmentado, boton, escribirTex, porcentaje } from "../nucleo/utilidades.js";
import { simularPorColumnas, dibujarCircuito } from "../nucleo/circuitos.js";

const FUNCIONES = [
  { valor: "f1", texto: "f(x) = 0", tipo: "constante", oraculo: [[], []], implementacion: "no hace nada" },
  { valor: "f2", texto: "f(x) = 1", tipo: "constante", oraculo: [[], [{ tipo: "X", qubit: 2 }]], implementacion: "una X en el auxiliar" },
  { valor: "f3", texto: "f(x) = x", tipo: "balanceada", oraculo: [[{ tipo: "CNOT", controles: [1], objetivo: 2 }], []], implementacion: "una CNOT" },
  { valor: "f4", texto: "f(x) = x̄", tipo: "balanceada", oraculo: [[{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "X", qubit: 2 }]], implementacion: "una CNOT y una X" },
];

const EXPLICACIONES = [
  "Preparación: el qubit de arriba en |0⟩ y el auxiliar en |1⟩.",
  "H ⊗ H: el de arriba queda en |+⟩ (evalúa x = 0 y x = 1 a la vez) y el auxiliar en |−⟩.",
  "Primera mitad del oráculo.",
  "Oráculo completo. Con el auxiliar en |−⟩, U_f deja un signo (−1)^f(x) en cada término: retroceso de fase.",
  "H en el qubit de arriba: la fase relativa se convierte en 0 o 1 (interferencia).",
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Deutsch", titulo: "¿Constante o balanceada?" });
  let funcion = FUNCIONES[2];
  let paso = 0;
  let oculto = true;

  const dibujo = crear("div", { clase: "circuito-svg" });
  const descripcion = crear("p", { clase: "chico texto-2" });
  const estado = crear("div", { clase: "lectura-estado" });
  const resultado = crear("div", { clase: "metricas" });
  const botonAnterior = boton("← Anterior", () => irA(paso - 1));
  const botonSiguiente = boton("Siguiente →", () => irA(paso + 1));
  const botonRevelar = boton("Mostrar el interior de U_f", () => { oculto = !oculto; botonRevelar.textContent = oculto ? "Mostrar el interior de U_f" : "Ocultar U_f (caja negra)"; pintar(); });

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [segmentado(FUNCIONES, funcion.valor, (v) => { funcion = FUNCIONES.find((f) => f.valor === v); paso = 0; pintar(); }, "Función"), botonRevelar]),
    dibujo,
    crear("div", { clase: "fila-botones" }, [botonAnterior, botonSiguiente, boton("Ejecutar todo", () => irA(4))]),
    descripcion, estado, resultado,
  );

  const circuito = () => ({
    qubits: 2, entradas: ["0", "1"],
    columnas: [[{ tipo: "H", qubit: 1 }, { tipo: "H", qubit: 2 }], ...funcion.oraculo, [{ tipo: "H", qubit: 1 }]],
    medir: [1],
  });

  function irA(nuevo) { paso = Math.max(0, Math.min(4, nuevo)); pintar(); }

  function pintar() {
    const c = circuito();
    const estados = simularPorColumnas(c);
    dibujo.innerHTML = dibujarCircuito(c, { columnaResaltada: paso });
    if (oculto) {
      // Tapa las dos columnas del oráculo con una caja negra rotulada U_f.
      const svg = dibujo.querySelector("svg");
      const caja = document.createElementNS("http://www.w3.org/2000/svg", "g");
      caja.innerHTML = `<rect x="${74 + 62 + 4}" y="12" width="${62 * 2 - 8}" height="${2 * 52 - 4}" rx="10" fill="var(--superficie-2)" stroke="var(--alerta)" stroke-width="1.5"/><text x="${74 + 62 * 2}" y="${18 + 52}" text-anchor="middle" dominant-baseline="central" fill="var(--alerta)" font-size="16" font-weight="600">U_f</text>`;
      svg.append(caja);
    }
    escribirTex(estado, `|\\psi_${paso}\\rangle = ${estados[paso].aTex()}`, true);
    descripcion.textContent = paso === 3 || paso === 2 ? `${EXPLICACIONES[paso]} Para ${funcion.texto}, U_f es ${funcion.implementacion}.` : EXPLICACIONES[paso];
    botonAnterior.disabled = paso === 0;
    botonSiguiente.disabled = paso === 4;
    resultado.innerHTML = "";
    if (paso === 4) {
      const pCero = estados[4].probabilidadDeQubit(1, 0);
      const sale = pCero > 0.5 ? 0 : 1;
      resultado.append(
        crear("div", { clase: "metrica" }, [crear("small", { texto: "Medición del qubit 1" }), crear("strong", { texto: `${sale} (${porcentaje(Math.max(pCero, 1 - pCero))})` })]),
        crear("div", { clase: `metrica exito` }, [crear("small", { texto: "Conclusión" }), crear("strong", { texto: sale === 0 ? "constante" : "balanceada" })]),
        crear("div", { clase: "metrica" }, [crear("small", { texto: "Consultas a f" }), crear("strong", { texto: "1" })]),
      );
    }
  }
  pintar();
}
