/**
 * Interferencia con una Hadamard: cada amplitud de salida es la suma de dos contribuciones
 * que se refuerzan o se cancelan. Amplitudes reales para poder dibujarlas en una recta.
 */
import { crearMarcoWidget, crear, deslizador, escribirTex, prepararLienzo, colorDelTema, alCambiarAspecto, porcentaje, segmentado } from "../nucleo/utilidades.js";
import { realATex } from "../nucleo/complejos.js";

const PRESETS = [
  { valor: 45, texto: "|+⟩" }, { valor: -45, texto: "|−⟩" }, { valor: 0, texto: "|0⟩" }, { valor: 30, texto: "otro" },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Interferencia", titulo: "H(α|0⟩ + β|1⟩)" });
  let angulo = 45;
  const lienzo = crear("canvas", { "aria-label": "Suma de contribuciones de amplitud" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const lectura = crear("div", { clase: "lectura-estado" });
  const control = deslizador({ etiqueta: "Estado de entrada (α = cos t, β = sen t)", min: -180, max: 180, paso: 1, valor: angulo, formato: (v) => `t = ${v}°`, alCambiar: (v) => { angulo = v; selector.seleccionar(null); actualizar(); } });
  const selector = segmentado(PRESETS, 45, (v) => { angulo = v; control.fijar(v); actualizar(); }, "Estado de entrada");
  const metricas = crear("div", { clase: "metricas" });
  cuerpo.append(selector, control, lectura, envoltura, metricas);

  function valores() {
    const alfa = Math.cos((angulo * Math.PI) / 180);
    const beta = Math.sin((angulo * Math.PI) / 180);
    return { alfa, beta, salida0: (alfa + beta) / Math.SQRT2, salida1: (alfa - beta) / Math.SQRT2 };
  }

  function dibujar() {
    const { alfa, beta, salida0, salida1 } = valores();
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, 0.42);
    const centro = ancho / 2;
    const escala = ancho * 0.28;
    const filas = [
      { y: alto * 0.3, nombre: "|0⟩", aportes: [alfa / Math.SQRT2, beta / Math.SQRT2], total: salida0, signo: "+" },
      { y: alto * 0.72, nombre: "|1⟩", aportes: [alfa / Math.SQRT2, -beta / Math.SQRT2], total: salida1, signo: "−" },
    ];
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = colorDelTema("--borde-fuerte");
    ctx.beginPath(); ctx.moveTo(centro, 8); ctx.lineTo(centro, alto - 8); ctx.stroke();
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.fillText("0", centro, alto - 2);
    ctx.fillText("−1", centro - escala, alto - 2);
    ctx.fillText("+1", centro + escala, alto - 2);
    for (const fila of filas) {
      ctx.strokeStyle = colorDelTema("--borde");
      ctx.beginPath(); ctx.moveTo(centro - escala * 1.1, fila.y); ctx.lineTo(centro + escala * 1.1, fila.y); ctx.stroke();
      let x = centro;
      const colores = [colorDelTema("--dato-0"), colorDelTema("--dato-1")];
      fila.aportes.forEach((aporte, i) => {
        const desde = x;
        const hasta = x + aporte * escala;
        const yFlecha = fila.y - 12 + i * 8;
        ctx.strokeStyle = colores[i];
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(desde, yFlecha); ctx.lineTo(hasta, yFlecha); ctx.stroke();
        ctx.lineWidth = 1;
        if (Math.abs(hasta - desde) > 4) {
          const direccion = Math.sign(hasta - desde);
          ctx.fillStyle = colores[i];
          ctx.beginPath(); ctx.moveTo(hasta, yFlecha); ctx.lineTo(hasta - direccion * 7, yFlecha - 4); ctx.lineTo(hasta - direccion * 7, yFlecha + 4); ctx.fill();
        }
        x = hasta;
      });
      ctx.fillStyle = colorDelTema("--acento");
      ctx.beginPath(); ctx.arc(centro + fila.total * escala, fila.y + 10, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colorDelTema("--texto");
      ctx.textAlign = "left";
      ctx.fillText(fila.nombre, 6, fila.y + 4);
      const tipo = Math.abs(fila.total) > Math.max(...fila.aportes.map(Math.abs)) + 1e-6 ? "constructiva" : Math.abs(fila.total) < 1e-6 ? "se cancelan" : "destructiva";
      ctx.fillStyle = colorDelTema("--texto-3");
      ctx.textAlign = "right";
      ctx.fillText(tipo, ancho - 6, fila.y + 4);
      ctx.textAlign = "center";
    }
    ctx.textAlign = "left";
    ctx.fillStyle = colorDelTema("--dato-0");
    ctx.fillText("aporte de α", 6, 14);
    ctx.fillStyle = colorDelTema("--dato-1");
    ctx.fillText("aporte de β", 90, 14);
    ctx.fillStyle = colorDelTema("--acento");
    ctx.fillText("● amplitud final", 174, 14);
  }

  function actualizar() {
    const { alfa, beta, salida0, salida1 } = valores();
    const t = (v) => (Math.abs(v) < 1e-9 ? "0" : `${v < 0 ? "-" : ""}${realATex(Math.abs(v))}`);
    escribirTex(lectura, `H\\big(${t(alfa)}|0\\rangle ${beta < 0 ? "" : "+"} ${t(beta)}|1\\rangle\\big) = \\underbrace{\\tfrac{\\alpha+\\beta}{\\sqrt2}}_{${t(salida0)}}|0\\rangle + \\underbrace{\\tfrac{\\alpha-\\beta}{\\sqrt2}}_{${t(salida1)}}|1\\rangle`, true);
    metricas.innerHTML = "";
    [["Antes: p(0)", alfa * alfa], ["Antes: p(1)", beta * beta], ["Después: p(0)", salida0 * salida0], ["Después: p(1)", salida1 * salida1]]
      .forEach(([etiqueta, p]) => metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: etiqueta }), crear("strong", { texto: porcentaje(p) })])));
    dibujar();
  }

  alCambiarAspecto(envoltura, dibujar);
  actualizar();
}
