/**
 * Teleportación paso a paso con 3 qubits: la esfera de Bob muestra su vector de Bloch reducido.
 * Antes de las correcciones está en el centro o rotado; al final coincide con el |ψ⟩ de Alice.
 */
import { crearMarcoWidget, crear, deslizador, boton, escribirTex, alCambiarAspecto } from "../nucleo/utilidades.js";
import { EstadoCuantico, compuertas, qubitDesdeBloch, estadosNotables } from "../nucleo/estadoCuantico.js";
import { dibujarCircuito } from "../nucleo/circuitos.js";
import { crearDibujanteBloch } from "./esferaBloch.js";

const PASOS = [
  { titulo: "Estado inicial", texto: "Alice tiene |ψ⟩ en el qubit 1. Los qubits 2 (Alice) y 3 (Bob) arrancan en |0⟩." },
  { titulo: "H en el qubit 2", texto: "Primera mitad de la preparación del par de Bell." },
  { titulo: "CNOT₂,₃: par de Bell", texto: "Qubits 2 y 3 quedan en |β₀₀⟩. Bob se lleva el qubit 3. Su qubit, mirado solo, está en el centro de la esfera: no tiene estado propio." },
  { titulo: "CNOT₁,₂ (Alice)", texto: "Alice hace interactuar |ψ⟩ con su mitad del par." },
  { titulo: "H en el qubit 1 (Alice)", texto: "El estado se puede escribir como ½ Σ |m₁m₂⟩ ⊗ (versión rotada de |ψ⟩ en Bob)." },
  { titulo: "Alice mide los qubits 1 y 2", texto: "Obtiene dos bits al azar (cada combinación con probabilidad ¼). El qubit de Bob colapsa a una versión de |ψ⟩ que puede tener X, Z o ambas de más." },
  { titulo: "Bob corrige con X^m₂ y Z^m₁", texto: "Con los 2 bits que recibió por el canal clásico, Bob aplica las correcciones y obtiene |ψ⟩ exacto." },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Teleportación", titulo: "De Alice a Bob" });
  let theta = 1.1;
  let phi = 0.9;
  let paso = 0;
  let resultadoMedicion = null; // [m1, m2]

  const lienzoAlice = crear("canvas", { "aria-label": "Estado a teleportar" });
  const lienzoBob = crear("canvas", { "aria-label": "Estado del qubit de Bob" });
  const dibujanteAlice = crearDibujanteBloch(lienzoAlice, { altoRelativo: 0.9 });
  const dibujanteBob = crearDibujanteBloch(lienzoBob, { altoRelativo: 0.9 });
  const dibujo = crear("div", { clase: "circuito-svg" });
  const titulo = crear("h5", { clase: "subtitulo-widget" });
  const texto = crear("p", { clase: "chico" });
  const lectura = crear("div", { clase: "lectura-estado" });
  const bits = crear("div", { clase: "metricas" });
  const botonAnterior = boton("← Anterior", () => irA(paso - 1));
  const botonSiguiente = boton("Siguiente →", () => irA(paso + 1));
  const botonOtraVez = boton("Medir otra vez", () => { resultadoMedicion = null; irA(5); });

  const controlTheta = deslizador({ etiqueta: "θ de |ψ⟩", min: 0, max: 180, paso: 1, valor: Math.round((theta * 180) / Math.PI), formato: (v) => `${v}°`, alCambiar: (v) => { theta = (v * Math.PI) / 180; resultadoMedicion = null; pintar(); } });
  const controlPhi = deslizador({ etiqueta: "φ de |ψ⟩", min: 0, max: 360, paso: 1, valor: Math.round((phi * 180) / Math.PI), formato: (v) => `${v}°`, alCambiar: (v) => { phi = (v * Math.PI) / 180; resultadoMedicion = null; pintar(); } });

  const envolturaAlice = crear("div", { clase: "lienzo-envoltura" }, [lienzoAlice]);
  const envolturaBob = crear("div", { clase: "lienzo-envoltura" }, [lienzoBob]);
  cuerpo.append(
    crear("div", { clase: "widget-columnas" }, [
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "|ψ⟩ que Alice quiere enviar" }), envolturaAlice, controlTheta, controlPhi]),
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Qubit de Bob (qubit 3)" }), envolturaBob, bits]),
    ]),
    dibujo,
    crear("div", { clase: "fila-botones" }, [botonAnterior, botonSiguiente, botonOtraVez]),
    titulo, texto, lectura,
  );

  function circuito() {
    const columnas = [[{ tipo: "H", qubit: 2 }], [{ tipo: "CNOT", controles: [2], objetivo: 3 }], [{ tipo: "CNOT", controles: [1], objetivo: 2 }], [{ tipo: "H", qubit: 1 }]];
    if (paso >= 6 && resultadoMedicion) {
      const [m1, m2] = resultadoMedicion;
      if (m2) columnas.push([{ tipo: "X", qubit: 3 }]);
      if (m1) columnas.push([{ tipo: "Z", qubit: 3 }]);
    }
    return { qubits: 3, entradas: ["0", "0", "0"], rotulos: ["|ψ⟩", "|0⟩", "|0⟩"], columnas, medir: paso >= 5 ? [1, 2] : [] };
  }

  function estadoEnPaso() {
    const estado = EstadoCuantico.desdeQubits([qubitDesdeBloch(theta, phi), estadosNotables["0"], estadosNotables["0"]]);
    const operaciones = [
      () => estado.aplicar(compuertas.H, 2),
      () => estado.aplicar(compuertas.X, 3, [2]),
      () => estado.aplicar(compuertas.X, 2, [1]),
      () => estado.aplicar(compuertas.H, 1),
    ];
    operaciones.slice(0, Math.min(paso, 4)).forEach((operar) => operar());
    if (paso >= 5) {
      if (!resultadoMedicion) {
        const copia = estado.clonar();
        resultadoMedicion = [copia.medirQubit(1), copia.medirQubit(2)];
      }
      const [m1, m2] = resultadoMedicion;
      estado.amplitudes = estado.proyectarQubit(1, m1).posterior.amplitudes;
      estado.amplitudes = estado.proyectarQubit(2, m2).posterior.amplitudes;
      if (paso >= 6) {
        if (m2) estado.aplicar(compuertas.X, 3);
        if (m1) estado.aplicar(compuertas.Z, 3);
      }
    }
    return estado;
  }

  function irA(nuevo) {
    paso = Math.max(0, Math.min(PASOS.length - 1, nuevo));
    if (paso < 5) resultadoMedicion = null;
    pintar();
  }

  function pintar() {
    const estado = estadoEnPaso();
    const objetivo = [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
    const vectorBob = estado.vectorDeBloch(3);
    dibujanteAlice.dibujar({ vectores: [{ v: objetivo }] });
    dibujanteBob.dibujar({ vectores: [{ v: [vectorBob.x, vectorBob.y, vectorBob.z], color: paso === 6 ? "--exito" : "--dato-1" }, { v: objetivo, color: "--texto-3" }] });
    dibujo.innerHTML = dibujarCircuito(circuito(), { columnaResaltada: Math.min(paso, 4) });
    titulo.textContent = `Paso ${paso} · ${PASOS[paso].titulo}`;
    texto.textContent = PASOS[paso].texto;
    escribirTex(lectura, paso < 5 ? `|\\Psi_${paso}\\rangle = ${estado.aTex()}` : `|\\Psi_${paso}\\rangle = ${estado.aTex()} \\;=\\; |m_1 m_2\\rangle\\otimes|\\text{Bob}\\rangle`, true);
    bits.innerHTML = "";
    if (resultadoMedicion) {
      const [m1, m2] = resultadoMedicion;
      const correccion = `${m2 ? "X" : ""}${m2 && m1 ? " y luego " : ""}${m1 ? "Z" : ""}` || "nada";
      bits.append(
        crear("div", { clase: "metrica" }, [crear("small", { texto: "Bits de Alice (m₁m₂)" }), crear("strong", { texto: `${m1}${m2}` })]),
        crear("div", { clase: `metrica${paso === 6 ? " exito" : ""}` }, [crear("small", { texto: "Bob aplica" }), crear("strong", { texto: correccion })]),
      );
    } else {
      const largo = Math.hypot(vectorBob.x, vectorBob.y, vectorBob.z);
      bits.append(crear("div", { clase: "metrica" }, [crear("small", { texto: "Largo del vector de Bob" }), crear("strong", { texto: largo.toFixed(2) })]));
    }
    botonAnterior.disabled = paso === 0;
    botonSiguiente.disabled = paso === PASOS.length - 1;
    botonOtraVez.style.display = paso >= 5 ? "" : "none";
  }

  lienzoAlice.addEventListener("vista", pintar);
  lienzoBob.addEventListener("vista", pintar);
  alCambiarAspecto(envolturaAlice, pintar);
  pintar();
}
