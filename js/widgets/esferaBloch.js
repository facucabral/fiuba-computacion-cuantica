/**
 * Esfera de Bloch interactiva: arrastrar para girar la vista, deslizadores θ/φ,
 * estados notables y compuertas animadas como rotaciones.
 *
 * Atributos: data-compuertas="no" oculta los botones de compuertas.
 */
import { crearMarcoWidget, crear, deslizador, escribirTex, prepararLienzo, colorDelTema, alCambiarAspecto, reducirMovimiento, boton, porcentaje } from "../nucleo/utilidades.js";
import { realATex } from "../nucleo/complejos.js";

const ROTACIONES = {
  X: { eje: [1, 0, 0], angulo: Math.PI, texto: "rota 180° alrededor de X" },
  Y: { eje: [0, 1, 0], angulo: Math.PI, texto: "rota 180° alrededor de Y" },
  Z: { eje: [0, 0, 1], angulo: Math.PI, texto: "rota 180° alrededor de Z" },
  H: { eje: [Math.SQRT1_2, 0, Math.SQRT1_2], angulo: Math.PI, texto: "rota 180° alrededor del eje (X+Z)/√2" },
  S: { eje: [0, 0, 1], angulo: Math.PI / 2, texto: "rota 90° alrededor de Z" },
  T: { eje: [0, 0, 1], angulo: Math.PI / 4, texto: "rota 45° alrededor de Z" },
};

const ESTADOS = [
  { nombre: "|0⟩", theta: 0, phi: 0 },
  { nombre: "|1⟩", theta: Math.PI, phi: 0 },
  { nombre: "|+⟩", theta: Math.PI / 2, phi: 0 },
  { nombre: "|−⟩", theta: Math.PI / 2, phi: Math.PI },
  { nombre: "|+i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
  { nombre: "|−i⟩", theta: Math.PI / 2, phi: (3 * Math.PI) / 2 },
];

// ── Geometría ──
const vectorDesdeAngulos = (theta, phi) => [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
function angulosDesdeVector([x, y, z]) {
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  let phi = Math.abs(Math.sin(theta)) < 1e-6 ? 0 : Math.atan2(y, x);
  if (phi < 0) phi += 2 * Math.PI;
  return { theta, phi };
}
/** Rotación de Rodrigues de v alrededor del eje unitario n. */
function rotar(v, n, angulo) {
  const [c, s] = [Math.cos(angulo), Math.sin(angulo)];
  const productoPunto = v[0] * n[0] + v[1] * n[1] + v[2] * n[2];
  const cruz = [n[1] * v[2] - n[2] * v[1], n[2] * v[0] - n[0] * v[2], n[0] * v[1] - n[1] * v[0]];
  return [0, 1, 2].map((i) => v[i] * c + cruz[i] * s + n[i] * productoPunto * (1 - c));
}

/** Dibuja una esfera de Bloch en un canvas. Reutilizable por otros widgets (teleportación, densidad). */
export function crearDibujanteBloch(lienzo, { altoRelativo = 0.92 } = {}) {
  let azimut = 0.45;
  let elevacion = 0.32;

  function base() {
    const camara = [Math.cos(elevacion) * Math.cos(azimut), Math.cos(elevacion) * Math.sin(azimut), Math.sin(elevacion)];
    const derecha = [-Math.sin(azimut), Math.cos(azimut), 0];
    const arriba = [camara[1] * derecha[2] - camara[2] * derecha[1], camara[2] * derecha[0] - camara[0] * derecha[2], camara[0] * derecha[1] - camara[1] * derecha[0]];
    return { camara, derecha, arriba };
  }

  function dibujar({ vectores = [], estela = [] }) {
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, altoRelativo);
    const radio = Math.min(ancho, alto) * 0.36;
    const centro = [ancho / 2, alto / 2 + 4];
    const { camara, derecha, arriba } = base();
    const proyectar = (v) => ({
      x: centro[0] + radio * (v[0] * derecha[0] + v[1] * derecha[1] + v[2] * derecha[2]),
      y: centro[1] - radio * (v[0] * arriba[0] + v[1] * arriba[1] + v[2] * arriba[2]),
      profundidad: v[0] * camara[0] + v[1] * camara[1] + v[2] * camara[2],
    });
    const colorTexto = colorDelTema("--texto");
    const colorBorde = colorDelTema("--borde-fuerte");
    const colorTenue = colorDelTema("--texto-3");

    // Silueta
    ctx.beginPath();
    ctx.arc(centro[0], centro[1], radio, 0, Math.PI * 2);
    const degradado = ctx.createRadialGradient(centro[0] - radio * 0.35, centro[1] - radio * 0.4, radio * 0.1, centro[0], centro[1], radio);
    degradado.addColorStop(0, colorDelTema("--vidrio-hover"));
    degradado.addColorStop(1, "transparent");
    ctx.fillStyle = degradado;
    ctx.fill();
    ctx.strokeStyle = colorBorde;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Círculos máximos: adelante continuos, atrás punteados
    const circulo = (puntoEn) => {
      for (const adelante of [false, true]) {
        ctx.beginPath();
        let abierto = false;
        for (let i = 0; i <= 96; i += 1) {
          const p = proyectar(puntoEn((i / 96) * Math.PI * 2));
          if ((p.profundidad >= 0) === adelante) {
            abierto ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
            abierto = true;
          } else abierto = false;
        }
        ctx.setLineDash(adelante ? [] : [3, 4]);
        ctx.strokeStyle = adelante ? colorBorde : colorTenue;
        ctx.globalAlpha = adelante ? 1 : 0.5;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };
    circulo((t) => [Math.cos(t), Math.sin(t), 0]);
    circulo((t) => [Math.sin(t), 0, Math.cos(t)]);
    circulo((t) => [0, Math.sin(t), Math.cos(t)]);

    // Ejes y estados notables
    const ejes = [
      { v: [0, 0, 1], rotulo: "|0⟩", color: "--dato-0" }, { v: [0, 0, -1], rotulo: "|1⟩", color: "--dato-1" },
      { v: [1, 0, 0], rotulo: "|+⟩", color: "--dato-2" }, { v: [-1, 0, 0], rotulo: "|−⟩", color: "--dato-2" },
      { v: [0, 1, 0], rotulo: "|+i⟩", color: "--dato-3" }, { v: [0, -1, 0], rotulo: "|−i⟩", color: "--dato-3" },
    ];
    ctx.font = `500 12px ${colorDelTema("--fuente-mono") || "monospace"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const eje of ejes) {
      const extremo = proyectar(eje.v.map((c) => c * 1.0));
      const origen = proyectar([0, 0, 0]);
      ctx.beginPath();
      ctx.moveTo(origen.x, origen.y);
      ctx.lineTo(extremo.x, extremo.y);
      ctx.strokeStyle = colorTenue;
      ctx.globalAlpha = extremo.profundidad < -0.2 ? 0.35 : 0.8;
      ctx.stroke();
      const rotulo = proyectar(eje.v.map((c) => c * 1.2));
      ctx.fillStyle = colorDelTema(eje.color);
      ctx.fillText(eje.rotulo, rotulo.x, rotulo.y);
      ctx.globalAlpha = 1;
    }

    // Estela de la última rotación
    if (estela.length > 1) {
      ctx.beginPath();
      estela.forEach((v, i) => { const p = proyectar(v); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      ctx.strokeStyle = colorDelTema("--acento");
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.2;
    }

    // Vectores de estado
    for (const { v, color = "--acento", rotulo } of vectores) {
      const origen = proyectar([0, 0, 0]);
      const punta = proyectar(v);
      const largo = Math.hypot(...v);
      const colorVector = colorDelTema(color);
      // sombra proyectada sobre el ecuador: ayuda a leer φ
      const sombra = proyectar([v[0], v[1], 0]);
      ctx.beginPath();
      ctx.moveTo(origen.x, origen.y);
      ctx.lineTo(sombra.x, sombra.y);
      ctx.lineTo(punta.x, punta.y);
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = colorVector;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(origen.x, origen.y);
      ctx.lineTo(punta.x, punta.y);
      ctx.strokeStyle = colorVector;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(punta.x, punta.y, largo > 0.05 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = colorVector;
      ctx.shadowColor = colorVector;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      if (rotulo) {
        ctx.fillStyle = colorTexto;
        ctx.fillText(rotulo, punta.x + 16, punta.y - 12);
      }
    }
  }

  // Arrastre para girar la vista
  let arrastre = null;
  lienzo.addEventListener("pointerdown", (evento) => { arrastre = { x: evento.clientX, y: evento.clientY, azimut, elevacion }; lienzo.setPointerCapture(evento.pointerId); });
  lienzo.addEventListener("pointermove", (evento) => {
    if (!arrastre) return;
    azimut = arrastre.azimut - (evento.clientX - arrastre.x) * 0.01;
    elevacion = Math.max(-1.2, Math.min(1.2, arrastre.elevacion + (evento.clientY - arrastre.y) * 0.01));
    lienzo.dispatchEvent(new CustomEvent("vista"));
  });
  const soltar = () => { arrastre = null; };
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);
  return { dibujar };
}

export function montar(contenedor) {
  const conCompuertas = contenedor.dataset.compuertas !== "no";
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Esfera de Bloch", titulo: "Mové la flechita" });
  let vector = [0, 0, 1];
  let estela = [];
  let animacion = null;

  const lienzo = crear("canvas", { "aria-label": "Esfera de Bloch. Arrastrá para girar la vista." });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const dibujante = crearDibujanteBloch(lienzo);
  const formula = crear("div", { clase: "lectura-estado" });
  const probabilidades = crear("div", { clase: "barras" });
  const explicacion = crear("p", { clase: "chico texto-2", texto: "Arrastrá la esfera para verla desde otro ángulo." });

  const controlTheta = deslizador({ etiqueta: "θ (polar)", min: 0, max: 180, paso: 1, valor: 0, formato: (v) => `${v}°`, alCambiar: () => fijarDesdeDeslizadores() });
  const controlPhi = deslizador({ etiqueta: "φ (fase relativa)", min: 0, max: 360, paso: 1, valor: 0, formato: (v) => `${v}°`, alCambiar: () => fijarDesdeDeslizadores() });

  const botonesEstados = crear("div", { clase: "bloch-botones" }, ESTADOS.map((e) => boton(e.nombre, () => animarHacia(vectorDesdeAngulos(e.theta, e.phi), `Estado ${e.nombre}`))));
  const botonesCompuertas = crear("div", { clase: "bloch-botones" }, Object.keys(ROTACIONES).map((nombre) => boton(nombre, () => aplicarCompuerta(nombre), "boton chico compuerta")));

  cuerpo.append(crear("div", { clase: "widget-columnas" }, [
    crear("div", {}, [envoltura, crear("p", { clase: "bloch-pista", texto: "↔ arrastrá para girar la vista" })]),
    crear("div", { clase: "bloch-controles" }, [
      formula, probabilidades, controlTheta, controlPhi,
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Estados notables" }), botonesEstados]),
      conCompuertas ? crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Aplicar compuerta" }), botonesCompuertas]) : null,
      explicacion,
    ]),
  ]));

  function fijarDesdeDeslizadores() {
    if (animacion) cancelAnimationFrame(animacion);
    const theta = (Number(controlTheta.querySelector("input").value) * Math.PI) / 180;
    const phi = (Number(controlPhi.querySelector("input").value) * Math.PI) / 180;
    vector = vectorDesdeAngulos(theta, phi);
    estela = [];
    actualizar(false);
  }

  function aplicarCompuerta(nombre) {
    const { eje, angulo, texto } = ROTACIONES[nombre];
    const inicio = [...vector];
    explicacion.innerHTML = `<strong>${nombre}</strong> ${texto}.`;
    animar(1, (t) => rotar(inicio, eje, angulo * t));
  }

  function animarHacia(destino, texto) {
    const inicio = [...vector];
    explicacion.textContent = texto;
    // interpolación esférica entre el estado actual y el destino
    const coseno = Math.max(-1, Math.min(1, inicio[0] * destino[0] + inicio[1] * destino[1] + inicio[2] * destino[2]));
    const omega = Math.acos(coseno);
    if (omega < 1e-4) return;
    const eje = Math.abs(Math.PI - omega) < 1e-3 ? (Math.abs(inicio[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]) : null;
    animar(1, (t) => {
      if (eje) return rotar(inicio, normalizar(cruz(inicio, eje)), omega * t);
      const a = Math.sin((1 - t) * omega) / Math.sin(omega);
      const b = Math.sin(t * omega) / Math.sin(omega);
      return [0, 1, 2].map((i) => a * inicio[i] + b * destino[i]);
    });
  }

  function animar(duracionRelativa, posicionEn) {
    if (animacion) cancelAnimationFrame(animacion);
    estela = [];
    const duracion = reducirMovimiento() ? 1 : 700 * duracionRelativa;
    const comienzo = performance.now();
    const cuadro = (ahora) => {
      const t = Math.min(1, (ahora - comienzo) / duracion);
      const suave = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      vector = posicionEn(suave);
      estela.push([...vector]);
      actualizar(t >= 1);
      if (t < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
  }

  function actualizar(sincronizarDeslizadores = true) {
    const { theta, phi } = angulosDesdeVector(vector);
    if (sincronizarDeslizadores) {
      controlTheta.fijar(Math.round((theta * 180) / Math.PI));
      controlPhi.fijar(Math.round((phi * 180) / Math.PI) % 360);
    }
    dibujante.dibujar({ vectores: [{ v: vector }], estela });
    const alfa = Math.cos(theta / 2);
    const beta = Math.sin(theta / 2);
    const faseTex = faseATex(phi);
    const negativo = faseTex === "-" || faseTex === "-i";
    const faseSinSigno = negativo ? faseTex.slice(1) : faseTex;
    const conector = alfa < 1e-6 ? (negativo ? "-" : "") : negativo ? " - " : " + ";
    const terminoBeta = beta < 1e-6 ? "" : `${conector}${faseSinSigno}${realATex(beta) === "1" ? "" : realATex(beta)}|1\\rangle`;
    const terminoAlfa = alfa < 1e-6 ? "" : `${realATex(alfa) === "1" ? "" : realATex(alfa)}|0\\rangle`;
    escribirTex(formula, `|\\psi\\rangle = \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle = ${terminoAlfa}${terminoBeta}`, true);
    probabilidades.innerHTML = "";
    [["|0⟩", alfa * alfa, "--dato-0"], ["|1⟩", beta * beta, "--dato-1"]].forEach(([etiqueta, p, color]) => {
      probabilidades.append(crear("div", { clase: "barra-prob" }, [
        crear("span", { clase: "etiqueta", texto: `P(${etiqueta})` }),
        crear("div", { clase: "pista" }, [crear("div", { clase: "relleno", style: `width:${p * 100}%;background:var(${color})` })]),
        crear("span", { clase: "porcentaje", texto: porcentaje(p) }),
      ]));
    });
  }

  lienzo.addEventListener("vista", () => dibujante.dibujar({ vectores: [{ v: vector }], estela }));
  alCambiarAspecto(envoltura, () => dibujante.dibujar({ vectores: [{ v: vector }], estela }));
  actualizar();
}

const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalizar = (v) => { const n = Math.hypot(...v) || 1; return v.map((c) => c / n); };

/** Fase e^{iφ} en su forma más legible: 1, −1, i, −i, e^{iπ/4}… */
function faseATex(phi) {
  const cuartos = phi / (Math.PI / 4);
  if (Math.abs(cuartos - Math.round(cuartos)) < 0.02) {
    const k = ((Math.round(cuartos) % 8) + 8) % 8;
    return ["", "e^{i\\pi/4}", "i", "e^{i3\\pi/4}", "-", "e^{i5\\pi/4}", "-i", "e^{i7\\pi/4}"][k];
  }
  return `e^{i\\,${Math.round((phi * 180) / Math.PI)}^\\circ}`;
}
