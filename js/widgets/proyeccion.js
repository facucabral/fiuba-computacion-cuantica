/**
 * Producto interno como proyección (amplitudes reales): el estado es una flecha en el plano
 * |0⟩–|1⟩ y la base de medición es un par de ejes perpendiculares que se puede girar.
 */
import { crearMarcoWidget, crear, deslizador, segmentado, escribirTex, prepararLienzo, colorDelTema, alCambiarAspecto, porcentaje } from "../nucleo/utilidades.js";
import { realATex } from "../nucleo/complejos.js";

const BASES = [
  { valor: 0, texto: "B<sub>z</sub> {|0⟩,|1⟩}", nombres: ["0", "1"] },
  { valor: 45, texto: "B<sub>x</sub> {|+⟩,|−⟩}", nombres: ["+", "-"] },
  { valor: "libre", texto: "Otra base", nombres: ["u", "u_\\perp"] },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Producto interno", titulo: "La sombra de un vector sobre otro" });
  let anguloEstado = 30; // grados entre |ψ⟩ y |0⟩ en el plano real
  let anguloBase = 0;
  let base = BASES[0];

  const lienzo = crear("canvas", { "aria-label": "Proyección del estado sobre la base de medición" });
  const envoltura = crear("div", { clase: "lienzo-envoltura cuadrado" }, [lienzo]);
  const lectura = crear("div", { clase: "lectura-estado" });
  const barras = crear("div", { clase: "barras" });
  const controlBaseLibre = deslizador({ etiqueta: "Girar la base", min: 0, max: 90, paso: 1, valor: 20, formato: (v) => `${v}°`, alCambiar: (v) => { anguloBase = v; actualizar(); } });
  controlBaseLibre.style.display = "none";
  const controlEstado = deslizador({ etiqueta: "Ángulo del estado |ψ⟩ (en este plano)", min: -90, max: 180, paso: 1, valor: anguloEstado, formato: (v) => `${v}°`, alCambiar: (v) => { anguloEstado = v; actualizar(); } });
  const selectorBase = segmentado(BASES, 0, (valor) => {
    base = BASES.find((b) => b.valor === valor);
    controlBaseLibre.style.display = valor === "libre" ? "" : "none";
    anguloBase = valor === "libre" ? Number(controlBaseLibre.querySelector("input").value) : valor;
    actualizar();
  }, "Base de medición");
  const nota = crear("p", { clase: "chico texto-2", texto: "En este plano los ángulos son los del espacio de Hilbert: |0⟩ y |1⟩ forman 90°. Estados ortogonales = proyección nula." });

  cuerpo.append(crear("div", { clase: "widget-columnas" }, [
    envoltura,
    crear("div", { clase: "bloch-controles" }, [selectorBase, controlBaseLibre, controlEstado, lectura, barras, nota]),
  ]));

  const rad = (g) => (g * Math.PI) / 180;

  function dibujar() {
    const { contexto: ctx, ancho } = prepararLienzo(lienzo, 1);
    const c = ancho / 2;
    const r = ancho * 0.38;
    const punto = (angulo, largo = 1) => [c + Math.cos(rad(angulo)) * r * largo, c - Math.sin(rad(angulo)) * r * largo];
    ctx.strokeStyle = colorDelTema("--borde");
    ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.stroke();
    ctx.font = "12px JetBrains Mono, monospace";
    // base computacional de referencia
    ctx.strokeStyle = colorDelTema("--borde-fuerte");
    for (const [a, rotulo] of [[0, "|0⟩"], [90, "|1⟩"]]) {
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(...punto(a, 1.08)); ctx.stroke();
      ctx.fillStyle = colorDelTema("--texto-3");
      ctx.fillText(rotulo, ...punto(a, 1.16).map((v, i) => v - (i === 0 ? 10 : -4)));
    }
    // ejes de la base de medición (se dibujan completos, en ambos sentidos)
    const ejes = [[anguloBase, colorDelTema("--dato-2"), base.nombres[0]], [anguloBase + 90, colorDelTema("--dato-3"), base.nombres[1]]];
    for (const [a, color, nombre] of ejes) {
      ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(...punto(a + 180, 1.1)); ctx.lineTo(...punto(a, 1.1)); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillText(`|${nombre.replace("_\\perp", "⊥").replace("-", "−")}⟩`, ...punto(a, 1.24).map((v) => v - 10));
    }
    // proyecciones
    const [ex, ey] = punto(anguloEstado);
    for (const [a, color] of ejes) {
      const largo = Math.cos(rad(anguloEstado - a));
      const [px, py] = punto(a, largo);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(px, py); ctx.stroke();
      ctx.lineWidth = 1; ctx.globalAlpha = 0.6; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(px, py); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    // estado
    ctx.strokeStyle = colorDelTema("--acento"); ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = colorDelTema("--acento");
    ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillText("|ψ⟩", ex + 10, ey - 10);
  }

  function actualizar() {
    const alfa = Math.cos(rad(anguloEstado));
    const beta = Math.sin(rad(anguloEstado));
    const amp1 = Math.cos(rad(anguloEstado - anguloBase));
    const amp2 = Math.cos(rad(anguloEstado - anguloBase - 90));
    const t = (v) => (Math.abs(v) < 1e-9 ? "0" : `${v < 0 ? "-" : ""}${realATex(Math.abs(v))}`);
    const [n1, n2] = base.nombres;
    const coefBeta = Math.abs(beta) < 1e-9 ? "" : `${beta < 0 ? " - " : " + "}${realATex(Math.abs(beta)) === "1" ? "" : realATex(Math.abs(beta))}|1\\rangle`;
    const coefAlfa = Math.abs(alfa) < 1e-9 ? "" : `${t(alfa) === "1" ? "" : t(alfa) === "-1" ? "-" : t(alfa)}|0\\rangle`;
    escribirTex(lectura, `\\begin{aligned}|\\psi\\rangle &= ${coefAlfa}${coefBeta}\\\\ \\langle ${n1}|\\psi\\rangle &= ${t(amp1)} \\\\ \\langle ${n2}|\\psi\\rangle &= ${t(amp2)}\\end{aligned}`, true);
    barras.innerHTML = "";
    [[n1, amp1 * amp1, "--dato-2"], [n2, amp2 * amp2, "--dato-3"]].forEach(([nombre, p, color]) => {
      barras.append(crear("div", { clase: "barra-prob" }, [
        crear("span", { clase: "etiqueta", texto: `p(${nombre.replace("_\\perp", "⊥").replace("-", "−")})` }),
        crear("div", { clase: "pista" }, [crear("div", { clase: "relleno", style: `width:${p * 100}%;background:var(${color})` })]),
        crear("span", { clase: "porcentaje", texto: porcentaje(p) }),
      ]));
    });
    dibujar();
  }

  alCambiarAspecto(envoltura, dibujar);
  actualizar();
}
