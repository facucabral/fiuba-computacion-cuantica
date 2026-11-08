/**
 * La "moneda cuántica": preparar α|0⟩ + β|1⟩, medir una vez o muchas, y ver cómo
 * la frecuencia converge a |α|² (regla de Born).
 */
import { crearMarcoWidget, crear, deslizador, escribirTex, boton, porcentaje, prepararLienzo, colorDelTema, alCambiarAspecto, reducirMovimiento } from "../nucleo/utilidades.js";
import { realATex } from "../nucleo/complejos.js";

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Medición", titulo: "Preparar, medir, repetir" });
  let probabilidadCero = 0.5;
  let conteo = { cero: 0, uno: 0 };
  let historial = []; // frecuencia acumulada de 0 tras cada tirada

  const estadoTex = crear("div", { clase: "lectura-estado" });
  const moneda = crear("div", { clase: "moneda", "aria-live": "polite", texto: "?" });
  const escena = crear("div", { clase: "moneda-escena" }, [moneda]);
  const resultado = crear("p", { clase: "chico texto-2", style: "text-align:center", texto: "Medí para colapsar el estado." });
  const metricas = crear("div", { clase: "metricas" });
  const lienzo = crear("canvas", { "aria-label": "Frecuencia de resultados 0 a medida que se repite la medición" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);

  const control = deslizador({
    etiqueta: "Probabilidad de medir 0, |α|²", min: 0, max: 100, paso: 1, valor: 50, formato: (v) => `${v}%`,
    alCambiar: (v) => { probabilidadCero = v / 100; reiniciar(); },
  });

  cuerpo.append(
    crear("div", { clase: "widget-columnas" }, [
      crear("div", {}, [escena, resultado]),
      crear("div", { clase: "bloch-controles" }, [estadoTex, control,
        crear("div", { clase: "fila-botones" }, [boton("Medir 1 vez", () => medir(1)), boton("Medir 100", () => medir(100)), boton("Medir 1000", () => medir(1000)), boton("Reiniciar", reiniciar)]),
      ]),
    ]),
    metricas, envoltura,
  );

  function escribirEstado() {
    const alfa = Math.sqrt(probabilidadCero);
    const beta = Math.sqrt(1 - probabilidadCero);
    const partes = [];
    if (alfa > 1e-9) partes.push(`${realATex(alfa) === "1" ? "" : realATex(alfa)}|0\\rangle`);
    if (beta > 1e-9) partes.push(`${realATex(beta) === "1" ? "" : realATex(beta)}|1\\rangle`);
    escribirTex(estadoTex, `|\\psi\\rangle = ${partes.join(" + ")}`, true);
  }

  function medir(veces) {
    let ultimo = 0;
    for (let i = 0; i < veces; i += 1) {
      ultimo = Math.random() < probabilidadCero ? 0 : 1;
      ultimo === 0 ? (conteo.cero += 1) : (conteo.uno += 1);
      historial.push(conteo.cero / (conteo.cero + conteo.uno));
    }
    if (historial.length > 3000) historial = historial.slice(-3000);
    moneda.classList.add("girando");
    moneda.textContent = "";
    setTimeout(() => {
      moneda.classList.remove("girando");
      moneda.textContent = `|${ultimo}⟩`;
      resultado.textContent = veces === 1 ? `Colapsó a |${ultimo}⟩. Si volvés a medir ya colapsado, da lo mismo: hay que preparar el estado otra vez.` : `Última medición: |${ultimo}⟩.`;
    }, reducirMovimiento() ? 0 : 450);
    pintarMetricas();
  }

  function pintarMetricas() {
    const total = conteo.cero + conteo.uno;
    metricas.innerHTML = "";
    [["Mediciones", `${total}`], ["Salió 0", total ? `${conteo.cero} (${porcentaje(conteo.cero / total)})` : "—"], ["Salió 1", total ? `${conteo.uno} (${porcentaje(conteo.uno / total)})` : "—"], ["Born predice p(0)", porcentaje(probabilidadCero)]]
      .forEach(([etiqueta, valor]) => metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: etiqueta }), crear("strong", { texto: valor })])));
    dibujar();
  }

  function dibujar() {
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, 0.3);
    const m = { izq: 34, der: 10, arr: 10, aba: 20 };
    const y = (p) => alto - m.aba - p * (alto - m.arr - m.aba);
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.strokeStyle = colorDelTema("--borde");
    for (const p of [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(m.izq, y(p)); ctx.lineTo(ancho - m.der, y(p)); ctx.stroke(); ctx.fillText(`${p * 100}%`, 2, y(p) + 4); }
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = colorDelTema("--alerta");
    ctx.beginPath(); ctx.moveTo(m.izq, y(probabilidadCero)); ctx.lineTo(ancho - m.der, y(probabilidadCero)); ctx.stroke();
    ctx.setLineDash([]);
    if (historial.length > 1) {
      ctx.beginPath();
      historial.forEach((p, i) => {
        const x = m.izq + (i / (historial.length - 1)) * (ancho - m.izq - m.der);
        i ? ctx.lineTo(x, y(p)) : ctx.moveTo(x, y(p));
      });
      ctx.strokeStyle = colorDelTema("--acento");
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.fillText("frecuencia de 0 a medida que repetís · línea punteada: |α|²", m.izq + 4, alto - 4);
  }

  function reiniciar() {
    conteo = { cero: 0, uno: 0 };
    historial = [];
    moneda.textContent = "?";
    resultado.textContent = "Medí para colapsar el estado.";
    escribirEstado();
    pintarMetricas();
  }

  alCambiarAspecto(envoltura, dibujar);
  reiniciar();
}
