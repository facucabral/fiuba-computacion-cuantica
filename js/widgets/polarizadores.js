/**
 * Cadena de polarizadores. Cada filtro mide la polarización en su eje:
 * p(pasa) = cos²(θ_fotón − θ_filtro) y, si pasa, el fotón queda polarizado como el filtro.
 */
import { crearMarcoWidget, crear, segmentado, deslizador, boton, prepararLienzo, colorDelTema, alCambiarAspecto, porcentaje, escribirTex } from "../nucleo/utilidades.js";

const ANGULO_PARCIAL = (Math.atan2(2, 1) * 180) / Math.PI; // 1/√5 |H⟩ + 2/√5 |V⟩ ≈ 63,43°
const NOMBRES = { 0: "H", 45: "D", 90: "V", 135: "A", 180: "H" };

const PRESETS = [
  { valor: "cruzados", texto: "V · H", fuente: "natural", filtros: [90, 0] },
  { valor: "tres", texto: "V · D · H", fuente: "natural", filtros: [90, 45, 0] },
  { valor: "parcialA", texto: "Parcial: filtro A", fuente: "parcial", filtros: [135] },
  { valor: "parcialD", texto: "Recup. 2026: filtro D", fuente: "parcial", filtros: [45] },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Polarizadores", titulo: "Fotones a través de filtros" });
  let config = structuredClone(PRESETS[1]);
  let resultadoTiradas = null;

  const lienzo = crear("canvas", { "aria-label": "Haz de luz atravesando polarizadores" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const controles = crear("div", { clase: "bloch-controles" });
  const lectura = crear("div", { clase: "lectura-estado" });
  const metricas = crear("div", { clase: "metricas" });
  const selector = segmentado(PRESETS, config.valor, (v) => { config = structuredClone(PRESETS.find((p) => p.valor === v)); resultadoTiradas = null; pintarControles(); actualizar(); }, "Ejemplos");

  cuerpo.append(selector, envoltura, crear("div", { clase: "widget-columnas" }, [controles, crear("div", {}, [lectura, metricas])]));

  const nombreAngulo = (a) => NOMBRES[Math.round(a)] ? `${Math.round(a)}° (${NOMBRES[Math.round(a)]})` : `${Math.round(a)}°`;

  function pintarControles() {
    controles.innerHTML = "";
    config.filtros.forEach((angulo, i) => {
      controles.append(deslizador({ etiqueta: `Filtro ${i + 1}`, min: 0, max: 180, paso: 5, valor: angulo, formato: nombreAngulo, alCambiar: (v) => { config.filtros[i] = v; resultadoTiradas = null; actualizar(); } }));
    });
    controles.append(crear("div", { clase: "fila-botones" }, [
      config.filtros.length < 3 ? boton("+ Filtro", () => { config.filtros.push(45); pintarControles(); actualizar(); }) : null,
      config.filtros.length > 1 ? boton("− Filtro", () => { config.filtros.pop(); pintarControles(); actualizar(); }) : null,
      boton("Enviar 1000 fotones", enviarFotones),
    ].filter(Boolean)));
  }

  /** Intensidad (probabilidad acumulada) después de cada filtro. */
  function intensidades() {
    const resultado = [];
    let intensidad = 1;
    let angulo = config.fuente === "parcial" ? ANGULO_PARCIAL : null;
    for (const filtro of config.filtros) {
      intensidad *= angulo === null ? 0.5 : Math.cos(((angulo - filtro) * Math.PI) / 180) ** 2;
      angulo = filtro;
      resultado.push(intensidad);
    }
    return resultado;
  }

  function enviarFotones() {
    let pasaron = 0;
    for (let n = 0; n < 1000; n += 1) {
      let angulo = config.fuente === "parcial" ? ANGULO_PARCIAL : Math.random() * 180;
      let vivo = true;
      for (const filtro of config.filtros) {
        if (Math.random() < Math.cos(((angulo - filtro) * Math.PI) / 180) ** 2) angulo = filtro;
        else { vivo = false; break; }
      }
      if (vivo) pasaron += 1;
    }
    resultadoTiradas = pasaron;
    actualizar();
  }

  function dibujar() {
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, 0.32);
    const valores = intensidades();
    const centro = alto / 2;
    const n = config.filtros.length;
    const xFiltro = (i) => 70 + ((ancho - 140) * (i + 0.5)) / n;
    const colorHaz = colorDelTema("--alerta");
    // Haz
    let xAnterior = 10;
    let intensidadAnterior = 1;
    [...config.filtros, null].forEach((filtro, i) => {
      const xFin = filtro === null ? ancho - 10 : xFiltro(i);
      ctx.fillStyle = colorHaz;
      ctx.globalAlpha = 0.12 + 0.6 * intensidadAnterior;
      const grosor = 4 + 20 * intensidadAnterior;
      ctx.fillRect(xAnterior, centro - grosor / 2, xFin - xAnterior, grosor);
      ctx.globalAlpha = 1;
      if (filtro !== null) intensidadAnterior = valores[i];
      xAnterior = xFin;
    });
    // Filtros
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center";
    config.filtros.forEach((filtro, i) => {
      const x = xFiltro(i);
      ctx.strokeStyle = colorDelTema("--borde-fuerte");
      ctx.fillStyle = colorDelTema("--superficie-2");
      ctx.beginPath(); ctx.ellipse(x, centro, 12, alto * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // eje de transmisión (perspectiva simple: se dibuja girado en el plano del disco)
      const rad = (filtro * Math.PI) / 180;
      ctx.strokeStyle = colorDelTema("--texto");
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - Math.cos(rad) * 10, centro + Math.sin(rad) * alto * 0.32); ctx.lineTo(x + Math.cos(rad) * 10, centro - Math.sin(rad) * alto * 0.32); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = colorDelTema("--texto-2");
      ctx.fillText(nombreAngulo(filtro), x, alto - 4);
      ctx.fillStyle = colorDelTema("--texto");
      ctx.fillText(porcentaje(valores[i]), x + (ancho - 140) / n / 2, centro - 18);
    });
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.textAlign = "left";
    ctx.fillText(config.fuente === "parcial" ? "fotón ψ" : "luz natural", 6, 14);
  }

  function actualizar() {
    const valores = intensidades();
    const final = valores.at(-1);
    if (config.fuente === "parcial" && config.filtros.length === 1) {
      const filtro = config.filtros[0];
      const nombre = NOMBRES[filtro] || `\\theta`;
      escribirTex(lectura, `|\\Psi\\rangle = \\tfrac{1}{\\sqrt5}|H\\rangle + \\tfrac{2}{\\sqrt5}|V\\rangle \\;\\Rightarrow\\; p(${nombre}) = |\\langle ${nombre}|\\Psi\\rangle|^2 = ${porcentaje(final).replace("%", "\\%")}`, true);
    } else {
      const pasos = config.filtros.map((f, i) => (i === 0 && config.fuente === "natural" ? "\\tfrac12" : `\\cos^2(${Math.abs(Math.round((i === 0 ? ANGULO_PARCIAL : config.filtros[i - 1]) - f))}^\\circ)`));
      escribirTex(lectura, `I_{\\text{final}} = ${pasos.join("\\cdot")} = ${porcentaje(final).replace("%", "\\%")}`, true);
    }
    metricas.innerHTML = "";
    metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: "Probabilidad de atravesar todo" }), crear("strong", { texto: porcentaje(final) })]));
    if (resultadoTiradas !== null) metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: "Simulación: llegaron" }), crear("strong", { texto: `${resultadoTiradas} / 1000` })]));
    dibujar();
  }

  alCambiarAspecto(envoltura, dibujar);
  pintarControles();
  actualizar();
}
