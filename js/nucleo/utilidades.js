/** Herramientas compartidas por la aplicación y los widgets. */

// ── Almacenamiento local: solo comodidades del lector (tema, progreso, récords). ──
// Puede fallar en modo privado o con cookies bloqueadas; la página funciona igual.
export function leerGuardado(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(`fiuba-cuantica:${clave}`);
    return texto === null ? valorPorDefecto : JSON.parse(texto);
  } catch {
    return valorPorDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(`fiuba-cuantica:${clave}`, JSON.stringify(valor));
  } catch { /* sin almacenamiento disponible */ }
}

// ── DOM ──
export function crear(etiqueta, atributos = {}, hijos = []) {
  const elemento = document.createElement(etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (nombre === "clase") elemento.className = valor;
    else if (nombre === "texto") elemento.textContent = valor;
    else if (nombre === "html") elemento.innerHTML = valor; // solo con contenido propio, nunca de usuarios
    else if (nombre.startsWith("al")) elemento.addEventListener(nombre.slice(2).toLowerCase(), valor);
    else elemento.setAttribute(nombre, valor === true ? "" : valor);
  }
  for (const hijo of [].concat(hijos)) if (hijo != null) elemento.append(hijo);
  return elemento;
}

/** Marco común de todos los widgets: rótulo, título, cuerpo y pie opcional. */
export function crearMarcoWidget(contenedor, { rotulo = "Interactivo", titulo = "", acciones = [] } = {}) {
  contenedor.classList.add("widget");
  contenedor.innerHTML = "";
  const cabecera = crear("div", { clase: "widget-cabecera" }, [
    crear("span", { clase: "rotulo", texto: rotulo }),
    titulo ? crear("h4", { texto: titulo }) : null,
    acciones.length ? crear("div", { clase: "derecha" }, acciones) : null,
  ]);
  const cuerpo = crear("div", { clase: "widget-cuerpo" });
  contenedor.append(cabecera, cuerpo);
  return { cabecera, cuerpo };
}

export function boton(texto, alHacerClic, clase = "boton chico") {
  return crear("button", { clase, type: "button", alclick: alHacerClic, html: texto });
}

/** Control segmentado accesible. `opciones`: [{ valor, texto }]. */
export function segmentado(opciones, valorInicial, alCambiar, etiqueta = "Opciones") {
  const grupo = crear("div", { clase: "segmentado", role: "group", "aria-label": etiqueta });
  const botones = opciones.map((opcion) =>
    crear("button", {
      type: "button",
      html: opcion.texto,
      "aria-pressed": String(opcion.valor === valorInicial),
      alclick: () => {
        botones.forEach((b) => b.setAttribute("aria-pressed", "false"));
        botonDe(opcion.valor).setAttribute("aria-pressed", "true");
        alCambiar(opcion.valor);
      },
    }),
  );
  const botonDe = (valor) => botones[opciones.findIndex((o) => o.valor === valor)];
  grupo.append(...botones);
  grupo.seleccionar = (valor) => {
    botones.forEach((b) => b.setAttribute("aria-pressed", "false"));
    botonDe(valor)?.setAttribute("aria-pressed", "true");
  };
  return grupo;
}

export function deslizador({ etiqueta, min, max, paso, valor, formato = (v) => v, alCambiar }) {
  const salida = crear("span", { clase: "valor", texto: formato(valor) });
  const entrada = crear("input", { type: "range", min, max, step: paso, value: valor, "aria-label": etiqueta });
  entrada.addEventListener("input", () => {
    const numero = Number(entrada.value);
    salida.textContent = formato(numero);
    alCambiar(numero);
  });
  const control = crear("label", { clase: "control" }, [crear("span", { clase: "control-fila" }, [crear("span", { texto: etiqueta }), salida]), entrada]);
  control.fijar = (numero) => {
    entrada.value = numero;
    salida.textContent = formato(numero);
  };
  return control;
}

// ── Matemática ──

/**
 * Código de colores de Dirac: envuelve kets, bras, brakets y proyectores en \htmlClass
 * para que el CSS los pinte. Así una ecuación larga se lee por partes:
 *   |ψ⟩ estado (ket) · ⟨ψ| bra · ⟨φ|ψ⟩ número · |v⟩⟨v| proyector.
 * Primero se reemplazan los brakets por marcadores (para no colorear el ket de adentro).
 */
const PATRONES_DIRAC = [
  { expresion: /\\langle([^|]*?)\|([^|]*?)\|([^|]*?)\\rangle/g, clase: "q-braket" },
  { expresion: /\\langle([^|]*?)\|([^|]*?)\\rangle/g, clase: "q-braket" },
  { expresion: /(?<!\\)\|([^|]*?)\\rangle\s*(?:\\!\s*)?\\langle([^|]*?)\|/g, clase: "q-proyector" },
  { expresion: /(?<!\\)\|([^|]*?)\\rangle/g, clase: "q-ket" },
  { expresion: /\\langle([^|]*?)\|/g, clase: "q-bra" },
];
const llavesBalanceadas = (texto) => {
  let nivel = 0;
  for (const caracter of texto) {
    if (caracter === "{") nivel += 1;
    if (caracter === "}") nivel -= 1;
    if (nivel < 0) return false;
  }
  return nivel === 0;
};

export function colorearDirac(tex) {
  if (!tex.includes("\\rangle") && !tex.includes("\\langle")) return tex;
  const guardados = [];
  let resultado = tex;
  for (const { expresion, clase } of PATRONES_DIRAC) {
    resultado = resultado.replace(expresion, (coincidencia) => {
      const cantidad = (marca) => coincidencia.split(marca).length - 1;
      // Si "cruza" un operador (=, +, \left…), no es una sola pieza de Dirac: se deja como está.
      const cruzaOperador = /=|\\left|\\right|\\q?quad|&|\\\\|\s[+-]\s/.test(coincidencia);
      if (cruzaOperador || !llavesBalanceadas(coincidencia) || coincidencia.includes("\u0000") || cantidad("\\rangle") > 1 || cantidad("\\langle") > 1) return coincidencia;
      guardados.push(`\\htmlClass{${clase}}{${coincidencia}}`);
      return `\u0000${guardados.length - 1}\u0000`;
    });
  }
  return resultado.replace(/\u0000(\d+)\u0000/g, (_, indice) => guardados[Number(indice)]);
}

export const opcionesKatex = {
  preProcess: colorearDirac,
  trust: (contexto) => contexto.command === "\\htmlClass",
  strict: "ignore",
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false },
  ],
  throwOnError: false,
  ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  macros: {
    "\\ket": "\\left|#1\\right\\rangle",
    "\\bra": "\\left\\langle#1\\right|",
    "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
    "\\proy": "\\left|#1\\right\\rangle\\!\\left\\langle#1\\right|",
  },
};

/** Espera a que KaTeX (cargado con defer) esté disponible. */
export function katexListo() {
  if (window.katex && window.renderMathInElement) return Promise.resolve();
  return new Promise((resolver) => {
    const intervalo = setInterval(() => {
      if (window.katex && window.renderMathInElement) {
        clearInterval(intervalo);
        resolver();
      }
    }, 30);
  });
}

export function renderizarMatematica(elemento) {
  if (window.renderMathInElement) window.renderMathInElement(elemento, opcionesKatex);
}

/** Escribe una expresión TeX dentro de un elemento (para salidas dinámicas de widgets). */
export function escribirTex(elemento, tex, enBloque = false) {
  if (!window.katex) {
    elemento.textContent = tex;
    return;
  }
  window.katex.render(colorearDirac(tex), elemento, { displayMode: enBloque, throwOnError: false, macros: opcionesKatex.macros, trust: opcionesKatex.trust, strict: "ignore" });
}

export const porcentaje = (valor, decimales = 1) => `${(valor * 100).toFixed(decimales).replace(/\.0+$/, "")}%`;

export const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lee una variable CSS del tema actual (para dibujar en canvas con los mismos tokens). */
export function colorDelTema(variable, elemento = document.documentElement) {
  return getComputedStyle(elemento).getPropertyValue(variable).trim() || "#888";
}

/** Ajusta un canvas a su tamaño en pantalla con la densidad del dispositivo. */
export function prepararLienzo(lienzo, altoRelativo = 0.75) {
  const densidad = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = lienzo.parentElement.clientWidth || 320;
  const alto = Math.round(ancho * altoRelativo);
  lienzo.width = Math.round(ancho * densidad);
  lienzo.height = Math.round(alto * densidad);
  lienzo.style.height = `${alto}px`;
  const contexto = lienzo.getContext("2d");
  contexto.setTransform(densidad, 0, 0, densidad, 0, 0);
  return { contexto, ancho, alto };
}

/** Observa cambios de tema y de tamaño para redibujar. Devuelve una función para dejar de observar. */
export function alCambiarAspecto(elemento, redibujar) {
  const observadorTamano = new ResizeObserver(() => redibujar());
  observadorTamano.observe(elemento);
  const observadorTema = new MutationObserver(() => redibujar());
  observadorTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const consulta = window.matchMedia("(prefers-color-scheme: light)");
  consulta.addEventListener("change", redibujar);
  return () => {
    observadorTamano.disconnect();
    observadorTema.disconnect();
    consulta.removeEventListener("change", redibujar);
  };
}

/** Número aleatorio con semilla opcional (para ejercicios reproducibles). */
export function crearAleatorio(semilla = Date.now()) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
