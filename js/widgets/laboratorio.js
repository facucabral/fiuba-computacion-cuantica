/**
 * Laboratorio de circuitos: armar (o recorrer) un circuito de hasta 3 qubits y ver,
 * columna por columna, el estado en Dirac, las probabilidades y la medición con proyectores.
 *
 * Atributos:
 *   data-preset="parcial-2026-ej1"   circuito inicial (js/datos/circuitos.js)
 *   data-modo="guiado"               solo lectura: sin paleta, para seguir una resolución
 */
import { crearMarcoWidget, crear, segmentado, escribirTex, porcentaje, boton } from "../nucleo/utilidades.js";
import { simularPorColumnas, dibujarCircuito, qubitsDe, columnaATex, algoritmoATex, compuertasDeUnQubit } from "../nucleo/circuitos.js";
import { circuitosGuardados } from "../datos/circuitos.js";
import { fase } from "../nucleo/complejos.js";

const MAXIMO_COLUMNAS = 10;
const HERRAMIENTAS = [...compuertasDeUnQubit, "CNOT", "CZ", "CCNOT", "SWAP", "Borrar"];
const clonarCircuito = (circuito) => ({ ...circuito, columnas: circuito.columnas.map((columna) => columna.map((op) => ({ ...op }))) });

export function montar(contenedor) {
  const modoGuiado = contenedor.dataset.modo === "guiado";
  const presetInicial = circuitosGuardados[contenedor.dataset.preset] || circuitosGuardados.bell;
  let circuito = clonarCircuito(presetInicial);
  let paso = modoGuiado ? 0 : circuito.columnas.length;
  let herramienta = "H";
  let pendiente = null; // { columna, qubits: [] } mientras se eligen controles/objetivo
  let qubitMedido = 0; // 0 = todos

  const { cuerpo } = crearMarcoWidget(contenedor, {
    rotulo: modoGuiado ? "Paso a paso" : "Laboratorio",
    titulo: modoGuiado ? presetInicial.titulo : "Armá tu circuito",
  });

  // ── Controles de edición ──
  const zonaEdicion = crear("div", { clase: "lab-edicion" });
  if (!modoGuiado) {
    const selectorPreset = crear("select", { "aria-label": "Cargar circuito" }, [
      crear("option", { value: "", texto: "Cargar un circuito…" }),
      ...Object.entries(circuitosGuardados).map(([id, c]) => crear("option", { value: id, texto: c.titulo })),
    ]);
    selectorPreset.addEventListener("change", () => {
      if (!selectorPreset.value) return;
      circuito = clonarCircuito(circuitosGuardados[selectorPreset.value]);
      paso = circuito.columnas.length;
      selectorQubits.seleccionar(circuito.qubits);
      actualizarTodo();
    });
    const selectorQubits = segmentado([1, 2, 3].map((n) => ({ valor: n, texto: `${n} qubit${n > 1 ? "s" : ""}` })), circuito.qubits, (n) => {
      circuito = { qubits: n, entradas: Array(n).fill("0"), columnas: [], medir: Array.from({ length: n }, (_, i) => i + 1) };
      paso = 0;
      actualizarTodo();
    }, "Cantidad de qubits");
    const paleta = crear("div", { clase: "lab-paleta", role: "toolbar", "aria-label": "Herramientas" });
    HERRAMIENTAS.forEach((nombre) => {
      paleta.append(crear("button", {
        type: "button", clase: `herramienta${nombre === herramienta ? " activa" : ""}`, texto: nombre === "Borrar" ? "⌫ Borrar" : nombre,
        "aria-pressed": String(nombre === herramienta),
        alclick: (evento) => {
          herramienta = nombre;
          pendiente = null;
          paleta.querySelectorAll("button").forEach((b) => { b.classList.toggle("activa", b === evento.currentTarget); b.setAttribute("aria-pressed", String(b === evento.currentTarget)); });
          actualizarAyuda();
        },
      }));
    });
    zonaEdicion.append(
      crear("div", { clase: "fila-botones" }, [selectorPreset, selectorQubits, boton("Vaciar", () => { circuito.columnas = []; paso = 0; actualizarTodo(); })]),
      paleta,
    );
  }
  const ayuda = crear("p", { clase: "chico texto-2 lab-ayuda" });
  const entradas = crear("div", { clase: "lab-entradas" });
  const lienzoCircuito = crear("div", { clase: "circuito-svg" });

  // ── Recorrido por pasos ──
  const botonAnterior = boton("← Paso anterior", () => irAPaso(paso - 1));
  const botonSiguiente = boton("Siguiente paso →", () => irAPaso(paso + 1));
  const indicadorPaso = crear("span", { clase: "chico texto-2" });
  const descripcionPaso = crear("div", { clase: "lab-descripcion" });

  // ── Estado y medición ──
  const estadoTex = crear("div", { clase: "lectura-estado" });
  const indicadorEntrelazado = crear("div", { clase: "chico" });
  const barras = crear("div", { clase: "barras" });
  const zonaMedicion = crear("div", { clase: "lab-medicion" });
  const selectorMedicion = crear("div", { clase: "fila-botones" });
  const algoritmo = crear("div", { clase: "lectura-estado" });

  cuerpo.append(
    zonaEdicion, ayuda, entradas, lienzoCircuito,
    crear("div", { clase: "fila-botones" }, [botonAnterior, botonSiguiente, indicadorPaso]),
    descripcionPaso,
    crear("div", { clase: "widget-columnas" }, [
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Estado del sistema" }), estadoTex, indicadorEntrelazado, crear("h5", { clase: "subtitulo-widget", texto: "Algoritmo (se lee de derecha a izquierda)" }), algoritmo]),
      crear("div", {}, [crear("h5", { clase: "subtitulo-widget", texto: "Amplitudes y probabilidades" }), barras, leyendaFases()]),
    ]),
    crear("h5", { clase: "subtitulo-widget", texto: "Medición con el formalismo" }),
    selectorMedicion, zonaMedicion,
  );

  function irAPaso(nuevo) {
    paso = Math.max(0, Math.min(circuito.columnas.length, nuevo));
    actualizarTodo();
  }

  function actualizarAyuda() {
    if (modoGuiado) { ayuda.textContent = ""; return; }
    const textos = {
      CNOT: pendiente ? "Ahora tocá el qubit objetivo (⊕) en la misma columna." : "Tocá primero el qubit de control (●).",
      CZ: pendiente ? "Tocá el segundo qubit en la misma columna." : "Tocá el qubit de control.",
      CCNOT: pendiente ? `Tocá ${pendiente.qubits.length === 1 ? "el segundo control" : "el objetivo"} en la misma columna.` : "Toffoli: dos controles y un objetivo (necesita 3 qubits).",
      SWAP: pendiente ? "Tocá el otro qubit a intercambiar." : "Tocá el primer qubit a intercambiar.",
      Borrar: "Tocá una compuerta para quitarla.",
    };
    ayuda.textContent = textos[herramienta] || `Tocá una celda del circuito para poner una compuerta ${herramienta}.`;
  }

  function quitarOperacionesEn(columna, qubit) {
    const lista = circuito.columnas[columna - 1];
    if (!lista) return;
    circuito.columnas[columna - 1] = lista.filter((op) => !qubitsDe(op).includes(qubit));
  }

  function limpiarColumnasVacias() {
    while (circuito.columnas.length && circuito.columnas.at(-1).length === 0) circuito.columnas.pop();
    circuito.columnas = circuito.columnas.map((columna) => columna || []);
  }

  function tocarCelda(columna, qubit) {
    while (circuito.columnas.length < columna) circuito.columnas.push([]);
    if (herramienta === "Borrar") {
      quitarOperacionesEn(columna, qubit);
    } else if (compuertasDeUnQubit.includes(herramienta)) {
      quitarOperacionesEn(columna, qubit);
      circuito.columnas[columna - 1].push({ tipo: herramienta, qubit });
    } else {
      const necesarios = herramienta === "CCNOT" ? 3 : 2;
      if (circuito.qubits < necesarios) { ayuda.textContent = `${herramienta} necesita al menos ${necesarios} qubits.`; return; }
      if (!pendiente || pendiente.columna !== columna) pendiente = { columna, qubits: [] };
      if (!pendiente.qubits.includes(qubit)) pendiente.qubits.push(qubit);
      if (pendiente.qubits.length === necesarios) {
        pendiente.qubits.forEach((q) => quitarOperacionesEn(columna, q));
        const [a, b, c] = pendiente.qubits;
        const operacion = herramienta === "SWAP" ? { tipo: "SWAP", a, b }
          : herramienta === "CCNOT" ? { tipo: "CNOT", controles: [a, b], objetivo: c }
          : { tipo: herramienta, controles: [a], objetivo: b };
        circuito.columnas[columna - 1].push(operacion);
        pendiente = null;
      }
    }
    limpiarColumnasVacias();
    paso = circuito.columnas.length;
    actualizarTodo();
  }

  function pintarEntradas() {
    entradas.innerHTML = "";
    if (modoGuiado) return;
    circuito.entradas.forEach((entrada, i) => {
      if (typeof entrada !== "string") return; // amplitudes propias de un preset: no se editan acá
      const selector = crear("select", { "aria-label": `Estado inicial del qubit ${i + 1}` },
        ["0", "1", "+", "-"].map((v) => crear("option", { value: v, texto: `q${i + 1} = |${v === "-" ? "−" : v}⟩`, selected: v === entrada })));
      selector.addEventListener("change", () => { circuito.entradas[i] = selector.value; circuito.rotulos = null; actualizarTodo(); });
      entradas.append(selector);
    });
  }

  function pintarCircuito() {
    lienzoCircuito.innerHTML = dibujarCircuito(circuito, {
      columnaResaltada: paso,
      interactivo: !modoGuiado,
      columnasMinimas: modoGuiado ? 0 : Math.min(MAXIMO_COLUMNAS, Math.max(5, circuito.columnas.length + 1)),
    });
    if (pendiente) {
      pendiente.qubits.forEach((q) => lienzoCircuito.querySelector(`.celda[data-columna="${pendiente.columna}"][data-qubit="${q}"]`)?.classList.add("pendiente"));
    }
    lienzoCircuito.querySelectorAll(".celda").forEach((celda) => {
      celda.addEventListener("click", () => tocarCelda(Number(celda.dataset.columna), Number(celda.dataset.qubit)));
    });
    lienzoCircuito.querySelectorAll(".operacion").forEach((grupo) => {
      grupo.addEventListener("click", () => irAPaso(Number(grupo.dataset.columna)));
    });
  }

  function pintarEstado(estados) {
    const estado = estados[paso];
    const nombre = paso === circuito.columnas.length && circuito.marca ? `\\Psi_{${circuito.marca.texto.replace(/[()]/g, "")}}` : `\\Psi_${paso}`;
    escribirTex(estadoTex, `|${nombre}\\rangle = ${estado.aTex()}`, true);
    const separable = estado.esSeparable();
    indicadorEntrelazado.innerHTML = circuito.qubits === 1 ? "" : separable
      ? '<span class="chico texto-2">Estado <strong>separable</strong>: se puede escribir como producto de qubits individuales.</span>'
      : '<span class="chip acento">Estado entrelazado</span> <span class="chico texto-2">no se puede factorizar como ψ₁ ⊗ ψ₂.</span>';

    barras.innerHTML = "";
    estado.amplitudesTex().forEach(({ etiqueta, tex, probabilidad }, i) => {
      const relleno = crear("div", { clase: "relleno" });
      relleno.style.width = `${probabilidad * 100}%`;
      relleno.style.background = colorDeFase(estado.amplitudes[i], probabilidad);
      const amplitud = crear("span", { clase: "amplitud-tex" });
      escribirTex(amplitud, tex);
      barras.append(crear("div", { clase: "barra-prob con-amplitud" }, [
        crear("span", { clase: "etiqueta", texto: `|${etiqueta}⟩` }),
        crear("div", { clase: "pista" }, [relleno]),
        crear("span", { clase: "porcentaje", texto: porcentaje(probabilidad) }),
        amplitud,
      ]));
    });

    escribirTex(algoritmo, circuito.columnas.length ? algoritmoATex(circuito, circuito.marca ? `\\Psi_{${circuito.marca.texto.replace(/[()]/g, "")}}` : "\\Psi_f") : "\\text{(agregá compuertas)}", true);
  }

  function pintarDescripcion() {
    if (paso === 0) {
      descripcionPaso.innerHTML = "";
      const tex = crear("div");
      escribirTex(tex, `\\text{Estado inicial: } |\\Psi_0\\rangle = ${circuito.entradas.map((e, i) => circuito.rotulos?.[i] ? circuito.rotulos[i].replace("Ψ", "\\Psi").replace("⟩", "\\rangle") : typeof e === "string" ? `|${e === "-" ? "-" : e}\\rangle` : "|\\psi\\rangle").join(" \\otimes ")}`);
      descripcionPaso.append(tex);
    } else {
      descripcionPaso.innerHTML = "";
      const tex = crear("div");
      escribirTex(tex, `\\text{Paso ${paso}: se aplica } ${columnaATex(circuito.columnas[paso - 1], circuito.qubits)} \\;\\Rightarrow\\; |\\Psi_${paso}\\rangle = \\left(${columnaATex(circuito.columnas[paso - 1], circuito.qubits)}\\right)|\\Psi_${paso - 1}\\rangle`);
      descripcionPaso.append(tex);
    }
    indicadorPaso.textContent = `Paso ${paso} de ${circuito.columnas.length}`;
    botonAnterior.disabled = paso === 0;
    botonSiguiente.disabled = paso === circuito.columnas.length;
  }

  function pintarSelectorMedicion() {
    selectorMedicion.innerHTML = "";
    if (qubitMedido > circuito.qubits) qubitMedido = 0;
    const opciones = [{ valor: 0, texto: "Todo el sistema" }, ...Array.from({ length: circuito.qubits }, (_, i) => ({ valor: i + 1, texto: `Solo q${i + 1}` }))];
    if (circuito.qubits > 1) selectorMedicion.append(segmentado(opciones, qubitMedido, (v) => { qubitMedido = v; actualizarTodo(); }, "Qué se mide"));
  }

  function pintarMedicion(estados) {
    const estado = estados[paso];
    zonaMedicion.innerHTML = "";
    if (qubitMedido === 0 || circuito.qubits === 1) {
      const qubit = circuito.qubits === 1 ? 1 : 0;
      if (qubit === 1) return pintarMedicionDeQubit(estado, 1);
      const probabilidades = estado.probabilidades();
      const posible = probabilidades.map((p, i) => ({ p, etiqueta: estado.etiqueta(i) })).filter(({ p }) => p > 1e-9);
      const tex = posible.map(({ etiqueta, p }) => `p(${etiqueta}) = |\\langle ${etiqueta}|\\Psi\\rangle|^2 = ${porcentajeTex(p)}`).join("\\qquad ");
      const bloque = crear("div", { clase: "lectura-estado" });
      escribirTex(bloque, `\\hat P_{k} = |k\\rangle\\langle k| \\;\\Rightarrow\\; ${tex}`, true);
      zonaMedicion.append(bloque, crear("p", { clase: "chico texto-2", texto: "Después de medir y obtener k, el sistema queda en |k⟩ (proyección normalizada)." }));
      zonaMedicion.append(crearSimuladorDeTiradas(estado));
      return;
    }
    pintarMedicionDeQubit(estado, qubitMedido);
  }

  function pintarMedicionDeQubit(estado, qubit) {
    const n = circuito.qubits;
    const proyector = (v) => Array.from({ length: n }, (_, i) => (i + 1 === qubit ? `|${v}\\rangle\\langle ${v}|` : "I")).join(" \\otimes ");
    [0, 1].forEach((valor) => {
      const { probabilidad, posterior } = estado.proyectarQubit(qubit, valor);
      const bloque = crear("div", { clase: "lectura-estado medicion-resultado" });
      const lineas = [
        `\\hat P_{${valor}} = ${proyector(valor)}`,
        `p_{${qubit}}(${valor}) = \\langle\\Psi|\\hat P_{${valor}}|\\Psi\\rangle = \\|\\hat P_{${valor}}|\\Psi\\rangle\\|^2 = ${porcentajeTex(probabilidad)}`,
      ];
      if (probabilidad > 1e-9) lineas.push(`|\\tilde\\Psi\\rangle = \\dfrac{\\hat P_{${valor}}|\\Psi\\rangle}{\\sqrt{p_{${qubit}}(${valor})}} = ${posterior.aTex()}`);
      else lineas.push("\\text{Resultado imposible: la proyección da el vector nulo.}");
      escribirTex(bloque, `\\begin{aligned}${lineas.map((linea) => `&${linea}`).join("\\\\[4pt]")}\\end{aligned}`, true);
      zonaMedicion.append(bloque);
    });
  }

  function actualizarTodo() {
    const estados = simularPorColumnas(circuito);
    paso = Math.min(paso, circuito.columnas.length);
    pintarEntradas();
    pintarCircuito();
    pintarDescripcion();
    pintarEstado(estados);
    pintarSelectorMedicion();
    pintarMedicion(estados);
    actualizarAyuda();
  }

  actualizarTodo();
}

function porcentajeTex(p) {
  const fracciones = [[1, 1], [1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 8], [3, 8], [5, 8], [7, 8], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [9, 10], [3, 10], [7, 10], [1, 16], [9, 16], [1, 6], [5, 6]];
  if (p < 1e-9) return "0";
  const exacta = fracciones.find(([a, b]) => Math.abs(p - a / b) < 1e-7);
  const decimal = `${(p * 100).toFixed(2).replace(/\.?0+$/, "")}\\%`;
  return exacta ? (exacta[1] === 1 ? `1 = 100\\%` : `\\tfrac{${exacta[0]}}{${exacta[1]}} = ${decimal}`) : decimal;
}

/** Color por fase de la amplitud: el signo/fase importa para la interferencia aunque no cambie la probabilidad. */
function colorDeFase(amplitud, probabilidad) {
  if (probabilidad < 1e-9) return "transparent";
  const angulo = (fase(amplitud) + 2 * Math.PI) % (2 * Math.PI);
  const cuarto = Math.round(angulo / (Math.PI / 2)) % 4;
  return ["var(--dato-0)", "var(--dato-2)", "var(--dato-3)", "var(--dato-1)"][cuarto];
}

function leyendaFases() {
  return crear("div", { clase: "leyenda", html: '<span><i style="background:var(--dato-0)"></i>fase +</span><span><i style="background:var(--dato-3)"></i>fase −</span><span><i style="background:var(--dato-2)"></i>fase +i</span><span><i style="background:var(--dato-1)"></i>fase −i</span>' });
}

/** Repite la medición muchas veces: así se "ve" la regla de Born en un histograma. */
function crearSimuladorDeTiradas(estado) {
  const resultado = crear("div", { clase: "barras tiradas" });
  const contenedor = crear("div", { clase: "lab-tiradas" });
  const tirar = (cantidad) => {
    const conteo = {};
    for (let i = 0; i < cantidad; i += 1) {
      const etiqueta = estado.muestrear();
      conteo[etiqueta] = (conteo[etiqueta] || 0) + 1;
    }
    resultado.innerHTML = "";
    Object.keys(conteo).sort().forEach((etiqueta) => {
      const relleno = crear("div", { clase: "relleno" });
      relleno.style.width = `${(conteo[etiqueta] / cantidad) * 100}%`;
      resultado.append(crear("div", { clase: "barra-prob" }, [
        crear("span", { clase: "etiqueta", texto: `|${etiqueta}⟩` }), crear("div", { clase: "pista" }, [relleno]),
        crear("span", { clase: "porcentaje", texto: `${conteo[etiqueta]}` }),
      ]));
    });
  };
  contenedor.append(
    crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Repetir el experimento:" }), boton("1 vez", () => tirar(1)), boton("100 veces", () => tirar(100)), boton("1000 veces", () => tirar(1000))]),
    resultado,
  );
  return contenedor;
}
