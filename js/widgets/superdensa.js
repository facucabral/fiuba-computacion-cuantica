/** Codificación superdensa: elegir dos bits, ver cómo viajan en un solo qubit y cómo Bob los recupera. */
import { crearMarcoWidget, crear, segmentado, boton, escribirTex } from "../nucleo/utilidades.js";
import { simularPorColumnas, dibujarCircuito } from "../nucleo/circuitos.js";

const BITS = ["00", "01", "10", "11"].map((b) => ({ valor: b, texto: b }));

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Superdensa", titulo: "Dos bits en un qubit" });
  let bits = "10";
  let paso = 0;

  const dibujo = crear("div", { clase: "circuito-svg" });
  const descripcion = crear("p", { clase: "chico" });
  const estado = crear("div", { clase: "lectura-estado" });
  const resultado = crear("div", { clase: "metricas" });
  const botonAnterior = boton("← Anterior", () => irA(paso - 1));
  const botonSiguiente = boton("Siguiente →", () => irA(paso + 1));

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Bits que Alice quiere enviar:" }), segmentado(BITS, bits, (v) => { bits = v; paso = 0; pintar(); }, "Bits")]),
    dibujo,
    crear("div", { clase: "fila-botones" }, [botonAnterior, botonSiguiente, boton("Hasta el final", () => irA(6))]),
    descripcion, estado, resultado,
  );

  const circuito = () => {
    const [b1, b2] = bits.split("").map(Number);
    return {
      qubits: 2, entradas: ["0", "0"],
      columnas: [
        [{ tipo: "H", qubit: 1 }],
        [{ tipo: "CNOT", controles: [1], objetivo: 2 }],
        b2 ? [{ tipo: "X", qubit: 1 }] : [],
        b1 ? [{ tipo: "Z", qubit: 1 }] : [],
        [{ tipo: "CNOT", controles: [1], objetivo: 2 }],
        [{ tipo: "H", qubit: 1 }],
      ],
      medir: [1, 2],
    };
  };

  const textos = (b1, b2) => [
    "Inicio: los dos qubits en |0⟩.",
    "Preparación del par de Bell (lo hace una fuente, antes de saber qué se quiere enviar).",
    "Alice y Bob comparten |β₀₀⟩. Cada uno se lleva su qubit.",
    b2 ? "Alice aplica X a su qubit porque el segundo bit es 1." : "El segundo bit es 0: Alice no aplica X.",
    b1 ? "Alice aplica Z porque el primer bit es 1. Ahora envía su qubit a Bob." : "El primer bit es 0: no aplica Z. Ahora envía su qubit a Bob.",
    "Bob, con los dos qubits, aplica CNOT₁,₂…",
    "…y H en el primero. El estado de Bell se convirtió en |b₁b₂⟩: midiendo, Bob lee los dos bits con certeza.",
  ];

  function irA(nuevo) { paso = Math.max(0, Math.min(6, nuevo)); pintar(); }

  function pintar() {
    const [b1, b2] = bits.split("").map(Number);
    const c = circuito();
    const estados = simularPorColumnas(c);
    dibujo.innerHTML = dibujarCircuito(c, { columnaResaltada: paso });
    descripcion.textContent = textos(b1, b2)[paso];
    escribirTex(estado, `|\\psi_${paso}\\rangle = ${estados[paso].aTex()}`, true);
    resultado.innerHTML = "";
    if (paso === 6) {
      const leido = estados[6].muestrear();
      resultado.append(
        crear("div", { clase: "metrica" }, [crear("small", { texto: "Qubits enviados" }), crear("strong", { texto: "1" })]),
        crear("div", { clase: "metrica exito" }, [crear("small", { texto: "Bob mide" }), crear("strong", { texto: leido })]),
      );
    }
    botonAnterior.disabled = paso === 0;
    botonSiguiente.disabled = paso === 6;
  }
  pintar();
}
