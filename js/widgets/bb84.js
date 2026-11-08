/** Simulación de BB84 con y sin espía, tabla de las primeras posiciones y tasa de error medida. */
import { crearMarcoWidget, crear, segmentado, boton, porcentaje, deslizador } from "../nucleo/utilidades.js";

const SIMBOLO = { "+": { 0: "→", 1: "↑" }, "×": { 0: "↗", 1: "↖" } };
const azar = () => (Math.random() < 0.5 ? 0 : 1);
const baseAlAzar = () => (Math.random() < 0.5 ? "+" : "×");

/** Medir un fotón preparado en (base, bit) con otra base: misma base = mismo bit; si no, 50/50. */
const medirFoton = (foton, base) => (foton.base === base ? foton.bit : azar());

function simular(cantidad, conEspia) {
  const filas = [];
  for (let i = 0; i < cantidad; i += 1) {
    const bitAlice = azar();
    const baseAlice = baseAlAzar();
    let foton = { base: baseAlice, bit: bitAlice };
    let baseEve = null;
    if (conEspia) {
      baseEve = baseAlAzar();
      foton = { base: baseEve, bit: medirFoton(foton, baseEve) }; // Eve reenvía lo que midió
    }
    const baseBob = baseAlAzar();
    const bitBob = medirFoton(foton, baseBob);
    filas.push({ bitAlice, baseAlice, baseEve, baseBob, bitBob, coincide: baseAlice === baseBob });
  }
  return filas;
}

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "BB84", titulo: "Alice, Bob y (quizás) Eve" });
  let conEspia = false;
  let cantidad = 200;
  let filas = [];

  const metricas = crear("div", { clase: "metricas" });
  const veredicto = crear("div");
  const tabla = crear("div");

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [
      segmentado([{ valor: false, texto: "Sin espía" }, { valor: true, texto: "Eve intercepta todo" }], conEspia, (v) => { conEspia = v; correr(); }, "Espía"),
      boton("Enviar otra tanda", correr),
    ]),
    deslizador({ etiqueta: "Fotones enviados", min: 20, max: 2000, paso: 20, valor: cantidad, alCambiar: (v) => { cantidad = v; correr(); } }),
    metricas, veredicto,
    crear("h5", { clase: "subtitulo-widget", texto: "Primeros 16 fotones" }),
    tabla,
  );

  function correr() {
    filas = simular(cantidad, conEspia);
    const clave = filas.filter((f) => f.coincide);
    const errores = clave.filter((f) => f.bitAlice !== f.bitBob).length;
    const tasa = clave.length ? errores / clave.length : 0;
    metricas.innerHTML = "";
    [["Fotones", filas.length, ""], ["Clave bruta (misma base)", clave.length, ` (${porcentaje(clave.length / filas.length, 0)})`], ["Bits distintos", errores, ""], ["Tasa de error (QBER)", porcentaje(tasa), ""]]
      .forEach(([etiqueta, valor, extra], i) => metricas.append(crear("div", { clase: `metrica${i === 3 ? (tasa > 0.11 ? " error" : " exito") : ""}` }, [crear("small", { texto: etiqueta }), crear("strong", { texto: `${valor}${extra}` })])));
    veredicto.innerHTML = tasa > 0.11
      ? '<div class="aviso error"><span class="titulo-aviso">Espía detectado</span><p>La tasa de error ronda el 25 %: alguien midió los fotones en el camino. Alice y Bob descartan la clave.</p></div>'
      : '<div class="aviso ok"><span class="titulo-aviso">Canal seguro</span><p>Sin errores en la clave comparada: pueden usar el resto como clave secreta.</p></div>';
    pintarTabla();
  }

  function pintarTabla() {
    const muestra = filas.slice(0, 16);
    const fila = (titulo, celda) => `<tr><th>${titulo}</th>${muestra.map((f) => `<td class="${f.coincide ? "" : "descartado"}">${celda(f)}</td>`).join("")}</tr>`;
    tabla.innerHTML = `<div class="tabla-envoltura"><table class="tabla-bb84"><tbody>
      ${fila("Bit Alice", (f) => f.bitAlice)}
      ${fila("Base Alice", (f) => f.baseAlice)}
      ${fila("Fotón", (f) => SIMBOLO[f.baseAlice][f.bitAlice])}
      ${conEspia ? fila("Base Eve", (f) => `<span style="color:var(--dato-3)">${f.baseEve}</span>`) : ""}
      ${fila("Base Bob", (f) => f.baseBob)}
      ${fila("Bit Bob", (f) => (f.coincide ? `<span class="${f.bitBob === f.bitAlice ? "ok-bit" : "error-bit"}">${f.bitBob}</span>` : f.bitBob))}
    </tbody></table></div><p class="chico texto-2">Las columnas atenuadas se descartan en el <em>sifting</em> porque Alice y Bob usaron bases distintas. En rojo, errores en la clave.</p>`;
  }
  correr();
}
