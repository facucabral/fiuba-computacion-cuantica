/**
 * Generador de ejercicios tipo "ejercicio 1": circuito de 2 qubits al azar, pregunta de probabilidad,
 * corrección y resolución paso a paso. Cada ejercicio tiene un número (semilla) para poder repetirlo.
 */
import { crearMarcoWidget, crear, boton, escribirTex, crearAleatorio, renderizarMatematica, leerGuardado } from "../nucleo/utilidades.js";
import { guardarRachaPractica } from "../nucleo/progresoPractica.js";
import { simularPorColumnas, dibujarCircuito, columnaATex, algoritmoATex } from "../nucleo/circuitos.js";

const UN_QUBIT = ["H", "X", "Z", "Y"];

function generar(semilla) {
  const azar = crearAleatorio(semilla);
  const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
  const entradas = [elegir(["0", "1", "0", "1", "+"]), elegir(["0", "1", "0", "1", "-"])];
  const columnas = [];
  const cantidad = 2 + Math.floor(azar() * 2);
  for (let i = 0; i < cantidad; i += 1) {
    const tipo = azar();
    if (tipo < 0.35 && !columnas.some((c) => c.some((op) => op.tipo === "CNOT") && columnas.length === i - 1)) {
      const control = azar() < 0.7 ? 1 : 2;
      columnas.push([{ tipo: "CNOT", controles: [control], objetivo: 3 - control }]);
    } else if (tipo < 0.65) {
      columnas.push([{ tipo: elegir(UN_QUBIT), qubit: 1 }, { tipo: elegir(UN_QUBIT), qubit: 2 }]);
    } else {
      columnas.push([{ tipo: elegir(UN_QUBIT), qubit: azar() < 0.5 ? 1 : 2 }]);
    }
  }
  if (!columnas.some((c) => c.some((op) => op.tipo === "CNOT"))) columnas.splice(1, 0, [{ tipo: "CNOT", controles: [1], objetivo: 2 }]);
  const circuito = { qubits: 2, entradas, columnas, medir: [1, 2], marca: { columna: columnas.length, texto: "(a)" } };
  const estados = simularPorColumnas(circuito);
  const final = estados.at(-1);

  // Pregunta: probabilidad de un estado de la base o de un solo qubit.
  let pregunta;
  if (azar() < 0.6) {
    const probabilidades = final.probabilidades();
    const posibles = probabilidades.map((p, i) => i).filter((i) => probabilidades[i] > 1e-9);
    const indice = azar() < 0.85 ? elegir(posibles) : Math.floor(azar() * 4);
    const etiqueta = final.etiqueta(indice);
    pregunta = {
      enunciado: `Si se mide todo el sistema en la base computacional, ¿cuál es la probabilidad de obtener $|${etiqueta}\\rangle$?`,
      respuesta: probabilidades[indice],
      resolucion: () => {
        const amplitud = final.amplitudesTex()[indice].tex;
        return `\\hat P = |${etiqueta}\\rangle\\langle ${etiqueta}|,\\quad \\langle ${etiqueta}|\\Psi_a\\rangle = ${amplitud},\\quad p(${etiqueta}) = |${amplitud}|^2`;
      },
      posterior: probabilidades[indice] > 1e-9 ? `|${etiqueta}\\rangle` : null,
    };
  } else {
    const qubit = azar() < 0.5 ? 1 : 2;
    const valor = azar() < 0.5 ? 0 : 1;
    const { probabilidad, posterior } = final.proyectarQubit(qubit, valor);
    const proyector = qubit === 1 ? `|${valor}\\rangle\\langle ${valor}|\\otimes I` : `I\\otimes|${valor}\\rangle\\langle ${valor}|`;
    pregunta = {
      enunciado: `Si se mide <strong>solo el qubit ${qubit}</strong>, ¿cuál es la probabilidad de obtener ${valor}?`,
      respuesta: probabilidad,
      resolucion: () => `\\hat P = ${proyector},\\quad p_${qubit}(${valor}) = \\langle\\Psi_a|\\hat P|\\Psi_a\\rangle`,
      posterior: probabilidad > 1e-9 ? posterior.aTex() : null,
    };
  }
  return { circuito, estados, pregunta };
}

/** Interpreta "1/2", "0,5", "50%" o "1" como número entre 0 y 1. */
function interpretarRespuesta(texto) {
  const limpio = texto.trim().replace(",", ".").replace(/\s/g, "");
  if (!limpio) return null;
  if (limpio.endsWith("%")) return Number(limpio.slice(0, -1)) / 100;
  if (limpio.includes("/")) {
    const [a, b] = limpio.split("/").map(Number);
    return b ? a / b : null;
  }
  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

const fraccionTex = (p) => {
  for (let q = 1; q <= 16; q += 1) {
    const n = Math.round(p * q);
    if (Math.abs(p * q - n) < 1e-7) return q === 1 ? `${n}` : `\\tfrac{${n}}{${q}}`;
  }
  return p.toFixed(4);
};

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Práctica", titulo: "Ejercicio generado" });
  let ejercicio = null;
  let semilla = 0;
  let racha = leerGuardado("racha-practica", { bien: 0, total: 0 });

  const numero = crear("span", { clase: "chico texto-2" });
  const dibujo = crear("div", { clase: "circuito-svg" });
  const enunciado = crear("p");
  const entrada = crear("input", { type: "text", inputmode: "decimal", placeholder: "Ej.: 1/2 o 0.25", "aria-label": "Tu respuesta", style: "width:160px" });
  const retro = crear("div", { clase: "retro" });
  const resolucion = crear("div");
  const estadistica = crear("p", { clase: "chico texto-2" });

  const comprobar = () => {
    const valor = interpretarRespuesta(entrada.value);
    if (valor === null || valor < 0 || valor > 1) {
      retro.innerHTML = '<div class="aviso parcial"><span class="titulo-aviso">Revisá el formato</span><p>Escribí una probabilidad entre 0 y 1, como <code>1/4</code>, <code>0.25</code> o <code>25%</code>.</p></div>';
      return;
    }
    const acerto = Math.abs(valor - ejercicio.pregunta.respuesta) < 2e-3;
    racha = { bien: racha.bien + (acerto ? 1 : 0), total: racha.total + 1 };
    guardarRachaPractica(racha);
    retro.innerHTML = acerto
      ? `<div class="aviso ok"><span class="titulo-aviso">Correcto</span><p>La probabilidad es $${fraccionTex(ejercicio.pregunta.respuesta)}$.</p></div>`
      : `<div class="aviso error"><span class="titulo-aviso">No da</span><p>Tu respuesta fue ${valor.toFixed(3)}. Mirá la resolución para encontrar el paso que falló.</p></div>`;
    renderizarMatematica(retro);
    mostrarResolucion();
    pintarEstadistica();
  };
  entrada.addEventListener("keydown", (e) => { if (e.key === "Enter") comprobar(); });

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [boton("Nuevo ejercicio", nuevo, "boton primario"), numero]),
    dibujo, enunciado,
    crear("div", { clase: "respuesta-practica" }, [entrada, boton("Comprobar", comprobar), boton("Ver resolución", mostrarResolucion)]),
    retro, resolucion, estadistica,
  );

  function pintarEstadistica() {
    estadistica.textContent = racha.total ? `Llevás ${racha.bien} de ${racha.total} bien en este navegador.` : "";
  }

  function nuevo() {
    semilla = Math.floor(Math.random() * 1e6);
    ejercicio = generar(semilla);
    numero.textContent = `Ejercicio n.º ${semilla}`;
    const nombres = (e) => ({ "+": "|+\\rangle", "-": "|-\\rangle" }[e] || `|${e}\\rangle`);
    dibujo.innerHTML = dibujarCircuito(ejercicio.circuito);
    enunciado.innerHTML = `Estado inicial $|\\Psi_0\\rangle = ${nombres(ejercicio.circuito.entradas[0])}\\otimes${nombres(ejercicio.circuito.entradas[1])}$. Calculá $|\\Psi_a\\rangle$. ${ejercicio.pregunta.enunciado}`;
    renderizarMatematica(enunciado);
    entrada.value = "";
    retro.innerHTML = "";
    resolucion.innerHTML = "";
  }

  function mostrarResolucion() {
    const { circuito, estados, pregunta } = ejercicio;
    resolucion.innerHTML = "";
    const lista = crear("ol", { clase: "pasos" });
    estados.forEach((estado, i) => {
      const item = crear("li");
      const tex = i === 0
        ? `|\\Psi_0\\rangle = ${estado.aTex()}`
        : `\\xrightarrow{${columnaATex(circuito.columnas[i - 1], 2)}}\\; |\\Psi_${i === estados.length - 1 ? "a" : i}\\rangle = ${estado.aTex()}`;
      escribirTex(item, tex, true);
      lista.append(item);
    });
    const final = crear("li");
    escribirTex(final, `${pregunta.resolucion()} = ${fraccionTex(pregunta.respuesta)}`, true);
    lista.append(final);
    if (pregunta.posterior) {
      const posterior = crear("li");
      escribirTex(posterior, `\\text{Estado después de medir: } |\\tilde\\Psi\\rangle = ${pregunta.posterior}`, true);
      lista.append(posterior);
    }
    const algoritmo = crear("div", { clase: "lectura-estado" });
    escribirTex(algoritmo, algoritmoATex(circuito), true);
    resolucion.append(crear("h5", { clase: "subtitulo-widget", texto: "Resolución" }), algoritmo, lista);
  }

  nuevo();
  pintarEstadistica();
}
