/**
 * Correlaciones de un par de Bell: Alice y Bob eligen base (Z o X), se repite la medición
 * muchas veces y se arma la tabla de resultados conjuntos.
 */
import { crearMarcoWidget, crear, segmentado, boton, porcentaje } from "../nucleo/utilidades.js";
import { EstadoCuantico, compuertas } from "../nucleo/estadoCuantico.js";

const ESTADOS = [
  { valor: "b00", texto: "|β₀₀⟩", preparar: [] },
  { valor: "b01", texto: "|β₀₁⟩", preparar: ["X2"] },
  { valor: "b10", texto: "|β₁₀⟩", preparar: ["X1"] },
  { valor: "b11", texto: "|β₁₁⟩", preparar: ["X1", "X2"] },
];
const BASES = [{ valor: "z", texto: "Base Z {0,1}" }, { valor: "x", texto: "Base X {+,−}" }];

function prepararBell(valor) {
  const estado = new EstadoCuantico(2);
  const { preparar } = ESTADOS.find((e) => e.valor === valor);
  for (const paso of preparar) estado.aplicar(compuertas.X, paso === "X1" ? 1 : 2);
  return estado.aplicar(compuertas.H, 1).aplicar(compuertas.X, 2, [1]);
}

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Entrelazamiento", titulo: "Alice y Bob miden" });
  let estadoElegido = "b00";
  let baseAlice = "z";
  let baseBob = "z";
  let conteo = {};
  let total = 0;

  const tabla = crear("div");
  const marginal = crear("p", { clase: "chico texto-2" });
  const conclusion = crear("div", { clase: "aviso intuicion", style: "margin-top:14px" });

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Par:" }), segmentado(ESTADOS, estadoElegido, (v) => { estadoElegido = v; reiniciar(); }, "Estado de Bell")]),
    crear("div", { clase: "widget-columnas" }, [
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Alice mide en" }), segmentado(BASES, baseAlice, (v) => { baseAlice = v; reiniciar(); }, "Base de Alice")]),
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Bob mide en" }), segmentado(BASES, baseBob, (v) => { baseBob = v; reiniciar(); }, "Base de Bob")]),
    ]),
    crear("div", { clase: "fila-botones" }, [boton("Medir 1 par", () => medir(1)), boton("Medir 500 pares", () => medir(500)), boton("Reiniciar", reiniciar)]),
    tabla, marginal, conclusion,
  );

  const simbolo = (base, bit) => (base === "z" ? String(bit) : bit === 0 ? "+" : "−");

  function medir(veces) {
    for (let i = 0; i < veces; i += 1) {
      const estado = prepararBell(estadoElegido);
      // Medir en X = aplicar H y medir en Z.
      if (baseAlice === "x") estado.aplicar(compuertas.H, 1);
      if (baseBob === "x") estado.aplicar(compuertas.H, 2);
      const etiqueta = estado.muestrear();
      const clave = `${simbolo(baseAlice, Number(etiqueta[0]))}${simbolo(baseBob, Number(etiqueta[1]))}`;
      conteo[clave] = (conteo[clave] || 0) + 1;
      total += 1;
    }
    pintar();
  }

  function pintar() {
    const resultadosA = [simbolo(baseAlice, 0), simbolo(baseAlice, 1)];
    const resultadosB = [simbolo(baseBob, 0), simbolo(baseBob, 1)];
    const filas = resultadosA.map((a) => `<tr><th>Alice ${a}</th>${resultadosB.map((b) => {
      const n = conteo[`${a}${b}`] || 0;
      const fraccion = total ? n / total : 0;
      return `<td style="background: color-mix(in srgb, var(--acento) ${Math.round(fraccion * 70)}%, transparent)">${n} <span class="texto-2 chico">${total ? porcentaje(fraccion) : ""}</span></td>`;
    }).join("")}</tr>`).join("");
    tabla.innerHTML = `<div class="tabla-envoltura"><table><thead><tr><th></th>${resultadosB.map((b) => `<th>Bob ${b}</th>`).join("")}</tr></thead><tbody>${filas}</tbody></table></div>`;
    const bob0 = resultadosA.reduce((s, a) => s + (conteo[`${a}${resultadosB[0]}`] || 0), 0);
    marginal.textContent = total ? `Mirando solo a Bob: ${resultadosB[0]} salió ${porcentaje(bob0 / total)} de las veces. Sin la información de Alice, Bob ve una moneda al azar.` : "Medí algunos pares.";
    const mismaBase = baseAlice === baseBob;
    const textos = {
      true: "Misma base: los resultados están perfectamente correlacionados (o anticorrelacionados). Si Alice sabe lo suyo, sabe lo de Bob.",
      false: "Bases distintas: los cuatro resultados aparecen por igual. Medir en otra base destruye la correlación.",
    };
    conclusion.innerHTML = `<span class="titulo-aviso">Qué observar</span><p>${textos[mismaBase]}</p>`;
  }

  function reiniciar() {
    conteo = {};
    total = 0;
    pintar();
  }
  reiniciar();
}
