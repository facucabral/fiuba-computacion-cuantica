/** Cuánta memoria necesita una computadora clásica para guardar el estado de n qubits. */
import { crearMarcoWidget, crear, deslizador, prepararLienzo, colorDelTema, alCambiarAspecto } from "../nucleo/utilidades.js";

const BYTES_POR_AMPLITUD = 16; // un complejo en doble precisión
const REFERENCIAS = [
  { bytes: 8e9, texto: "la RAM de una notebook (8 GB)" },
  { bytes: 1e15, texto: "una supercomputadora grande (~1 PB)" },
  { bytes: 1e24, texto: "todos los datos digitales del planeta (cientos de ZB)" },
  { bytes: 1e80, texto: "más bytes que átomos en el universo observable (~10⁸⁰)" },
];

function formatearBytes(bytes) {
  const unidades = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let indice = 0;
  let valor = bytes;
  while (valor >= 1000 && indice < unidades.length - 1) { valor /= 1000; indice += 1; }
  if (valor >= 1000) return `10^${Math.round(Math.log10(bytes))} B`;
  return `${valor.toFixed(valor < 10 ? 1 : 0)} ${unidades[indice]}`;
}

const potenciaDeDos = (n) => (n <= 52 ? (2 ** n).toLocaleString("es-AR") : `≈ 10^${Math.round(n * Math.log10(2))}`);

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Crecimiento exponencial", titulo: "n qubits → 2ⁿ amplitudes" });
  let qubits = 10;
  const metricas = crear("div", { clase: "metricas" });
  const comparacion = crear("p", { clase: "chico texto-2" });
  const lienzo = crear("canvas", { "aria-label": "Gráfico logarítmico de la memoria necesaria según la cantidad de qubits" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const control = deslizador({ etiqueta: "Cantidad de qubits", min: 1, max: 300, paso: 1, valor: qubits, alCambiar: (v) => { qubits = v; actualizar(); } });
  cuerpo.append(control, metricas, comparacion, envoltura);

  function dibujar() {
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, 0.38);
    const margen = { izq: 46, der: 12, arr: 12, aba: 26 };
    const maxN = 300;
    const maxLog = Math.log10(BYTES_POR_AMPLITUD) + maxN * Math.log10(2);
    const x = (n) => margen.izq + ((n - 1) / (maxN - 1)) * (ancho - margen.izq - margen.der);
    const y = (log) => alto - margen.aba - (log / maxLog) * (alto - margen.arr - margen.aba);
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.strokeStyle = colorDelTema("--borde");
    for (const log of [0, 20, 40, 60, 80]) {
      ctx.beginPath(); ctx.moveTo(margen.izq, y(log)); ctx.lineTo(ancho - margen.der, y(log)); ctx.stroke();
      ctx.fillText(`10^${log}`, 4, y(log) + 4);
    }
    // Línea de "átomos del universo"
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colorDelTema("--alerta");
    ctx.beginPath(); ctx.moveTo(margen.izq, y(80)); ctx.lineTo(ancho - margen.der, y(80)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colorDelTema("--alerta");
    ctx.fillText("átomos del universo", ancho - margen.der - 118, y(80) - 6);
    // Curva
    ctx.beginPath();
    for (let n = 1; n <= maxN; n += 1) {
      const log = Math.log10(BYTES_POR_AMPLITUD) + n * Math.log10(2);
      n === 1 ? ctx.moveTo(x(n), y(Math.min(log, maxLog))) : ctx.lineTo(x(n), y(Math.min(log, maxLog)));
    }
    ctx.strokeStyle = colorDelTema("--acento");
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
    const logActual = Math.log10(BYTES_POR_AMPLITUD) + qubits * Math.log10(2);
    ctx.beginPath();
    ctx.arc(x(qubits), y(logActual), 5, 0, Math.PI * 2);
    ctx.fillStyle = colorDelTema("--acento");
    ctx.fill();
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.fillText("qubits →", ancho - margen.der - 52, alto - 8);
    ctx.fillText("bytes (escala log)", margen.izq + 4, margen.arr + 10);
  }

  function actualizar() {
    const logBytes = Math.log10(BYTES_POR_AMPLITUD) + qubits * Math.log10(2);
    const bytes = 10 ** logBytes;
    metricas.innerHTML = "";
    [["Bits clásicos", `${qubits}`], ["Amplitudes complejas", potenciaDeDos(qubits)], ["Memoria para simularlo", Number.isFinite(bytes) && logBytes < 27 ? formatearBytes(bytes) : `≈ 10^${Math.round(logBytes)} B`]]
      .forEach(([etiqueta, valor]) => metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: etiqueta }), crear("strong", { texto: valor })])));
    const superada = REFERENCIAS.filter((r) => Math.log10(r.bytes) <= logBytes).at(-1);
    comparacion.textContent = superada ? `Ya supera ${superada.texto}.` : "Todavía entra en una computadora común.";
    dibujar();
  }

  alCambiarAspecto(envoltura, dibujar);
  actualizar();
}
