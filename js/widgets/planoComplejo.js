/** Plano complejo: arrastrar z, ver módulo, fase, conjugado y el efecto de multiplicar por e^{iθ}. */
import { crearMarcoWidget, crear, deslizador, escribirTex, prepararLienzo, colorDelTema, alCambiarAspecto } from "../nucleo/utilidades.js";

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Plano complejo", titulo: "Arrastrá el punto z" });
  let z = { re: 0.6, im: 0.8 };
  let giro = 0;

  const lienzo = crear("canvas", { "aria-label": "Plano complejo. Arrastrá para mover z." });
  const envoltura = crear("div", { clase: "lienzo-envoltura cuadrado" }, [lienzo]);
  const lectura = crear("div", { clase: "lectura-estado" });
  const controlGiro = deslizador({ etiqueta: "Multiplicar por e^{iθ}: θ", min: 0, max: 360, paso: 5, valor: 0, formato: (v) => `${v}°`, alCambiar: (v) => { giro = (v * Math.PI) / 180; actualizar(); } });
  const nota = crear("p", { clase: "chico texto-2", texto: "Multiplicar por e^{iθ} gira la flecha sin cambiar su largo: el módulo (y por lo tanto la probabilidad) no cambia." });
  cuerpo.append(crear("div", { clase: "widget-columnas" }, [envoltura, crear("div", { clase: "bloch-controles" }, [lectura, controlGiro, nota])]));

  let escala = 1;
  let centro = 0;
  const girado = () => ({ re: z.re * Math.cos(giro) - z.im * Math.sin(giro), im: z.re * Math.sin(giro) + z.im * Math.cos(giro) });

  function dibujar() {
    const { contexto: ctx, ancho } = prepararLienzo(lienzo, 1);
    centro = ancho / 2;
    escala = ancho * 0.38;
    const aPantalla = (p) => [centro + p.re * escala, centro - p.im * escala];
    ctx.strokeStyle = colorDelTema("--borde");
    for (let i = -1; i <= 1; i += 0.5) {
      ctx.beginPath(); ctx.moveTo(...aPantalla({ re: i, im: -1.2 })); ctx.lineTo(...aPantalla({ re: i, im: 1.2 })); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(...aPantalla({ re: -1.2, im: i })); ctx.lineTo(...aPantalla({ re: 1.2, im: i })); ctx.stroke();
    }
    ctx.strokeStyle = colorDelTema("--borde-fuerte");
    ctx.beginPath(); ctx.arc(centro, centro, escala, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Re", ancho - 22, centro - 6);
    ctx.fillText("Im", centro + 6, 14);
    ctx.fillText("|z| = 1", centro + escala * 0.72, centro - escala * 0.74);

    const flecha = (p, color, rotulo, punteada = false) => {
      const [x, y] = aPantalla(p);
      ctx.setLineDash(punteada ? [4, 4] : []);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(centro, centro); ctx.lineTo(x, y); ctx.stroke();
      ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, punteada ? 4 : 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(rotulo, x + 9, y - 9);
    };
    // arco de la fase
    const fase = Math.atan2(z.im, z.re);
    ctx.strokeStyle = colorDelTema("--texto-3");
    ctx.beginPath(); ctx.arc(centro, centro, 26, 0, -fase, fase > 0); ctx.stroke();
    flecha({ re: z.re, im: -z.im }, colorDelTema("--texto-3"), "z*", true);
    if (giro !== 0) flecha(girado(), colorDelTema("--dato-2"), "z·e^{iθ}");
    flecha(z, colorDelTema("--acento"), "z");
  }

  function actualizar() {
    const modulo = Math.hypot(z.re, z.im);
    const fase = (Math.atan2(z.im, z.re) * 180) / Math.PI;
    const r = (v) => Number(v.toFixed(2));
    const g = girado();
    escribirTex(lectura, `\\begin{aligned} z &= ${r(z.re)} ${z.im < 0 ? "-" : "+"} ${Math.abs(r(z.im))}\\,i \\\\ z^* &= ${r(z.re)} ${z.im < 0 ? "+" : "-"} ${Math.abs(r(z.im))}\\,i \\\\ |z| &= ${r(modulo)}, \\quad \\arg z = ${r(fase)}^\\circ \\\\ |z|^2 &= z\\,z^* = ${r(modulo * modulo)} \\\\ z\\,e^{i\\theta} &= ${r(g.re)} ${g.im < 0 ? "-" : "+"} ${Math.abs(r(g.im))}\\,i \\end{aligned}`, true);
    dibujar();
  }

  let arrastrando = false;
  const mover = (evento) => {
    const caja = lienzo.getBoundingClientRect();
    const re = (evento.clientX - caja.left - centro) / escala;
    const im = -(evento.clientY - caja.top - centro) / escala;
    z = { re: Math.max(-1.2, Math.min(1.2, re)), im: Math.max(-1.2, Math.min(1.2, im)) };
    actualizar();
  };
  lienzo.addEventListener("pointerdown", (e) => { arrastrando = true; lienzo.setPointerCapture(e.pointerId); mover(e); });
  lienzo.addEventListener("pointermove", (e) => arrastrando && mover(e));
  lienzo.addEventListener("pointerup", () => { arrastrando = false; });
  alCambiarAspecto(envoltura, dibujar);
  actualizar();
}
