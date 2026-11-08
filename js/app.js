/**
 * Arranque y navegación de la guía.
 * Recorrido: hash (#/tema) → cargar fragmento HTML → renderizar fórmulas → montar widgets.
 */
import { grupos, paginas, buscarPagina, buscarGrupo, indiceDePagina } from "./rutas.js";
import { insigniaDePagina, estaResuelto, alternarResuelto } from "./nucleo/progresoPractica.js";
import { pintarIconos, icono } from "./nucleo/iconos.js";
import { leerGuardado, guardar, katexListo, renderizarMatematica, crear } from "./nucleo/utilidades.js";
import { iniciarAnalitica, registrarVista } from "./nucleo/analitica.js";
import { abrirMaterial, abrirImagen, cerrarVisor, visorAbierto } from "./nucleo/visor.js";

const contenido = document.getElementById("contenido");
const navegacion = document.getElementById("navegacion");
const fragmentosEnCache = new Map();
let paginaActual = null;

// ── Progreso de lectura (por lector, en su navegador) ──
const leerVistos = () => new Set(leerGuardado("vistos", []));
function alternarVisto(id) {
  const vistos = leerVistos();
  vistos.has(id) ? vistos.delete(id) : vistos.add(id);
  guardar("vistos", [...vistos]);
  pintarProgreso();
  return vistos.has(id);
}

function pintarNavegacion() {
  const vistos = leerVistos();
  const gruposCerrados = new Set(leerGuardado("gruposCerrados", []));
  navegacion.innerHTML = "";
  for (const grupo of grupos) {
    const paginasDelGrupo = paginas.filter((p) => p.grupo === grupo.id);
    const detalle = crear("details", { clase: `grupo-nav ${grupo.id}`, open: !gruposCerrados.has(grupo.id), style: `--color-grupo: var(${grupo.color})` }, [
      crear("summary", {}, [crear("span", { clase: "punto-unidad" }), crear("span", { texto: grupo.titulo })]),
    ]);
    detalle.addEventListener("toggle", () => {
      const cerrados = new Set(leerGuardado("gruposCerrados", []));
      detalle.open ? cerrados.delete(grupo.id) : cerrados.add(grupo.id);
      guardar("gruposCerrados", [...cerrados]);
    });
    for (const pagina of paginasDelGrupo) {
      detalle.append(
        crear("a", { clase: "enlace-nav", href: `#/${pagina.id}`, "data-id": pagina.id }, [
          crear("span", { clase: "numero", texto: pagina.numero || "" }),
          crear("span", { clase: "texto", texto: pagina.titulo }),
          crear("span", { clase: "insignia", hidden: true }),
          crear("span", { clase: `visto${vistos.has(pagina.id) ? " si" : ""}`, title: vistos.has(pagina.id) ? "Visto" : "" }),
        ]),
      );
    }
    navegacion.append(detalle);
  }
}

function pintarProgreso() {
  const vistos = leerVistos();
  const total = paginas.length;
  const hechos = paginas.filter((p) => vistos.has(p.id)).length;
  document.getElementById("progresoGeneral").innerHTML =
    `<div class="etiqueta"><span>Tu progreso</span><span>${hechos}/${total}</span></div><div class="barra"><span style="width:${(hechos / total) * 100}%"></span></div>`;
  navegacion.querySelectorAll(".enlace-nav").forEach((enlace) => {
    enlace.querySelector(".visto").classList.toggle("si", vistos.has(enlace.dataset.id));
    const insignia = insigniaDePagina(enlace.dataset.id);
    const elemento = enlace.querySelector(".insignia");
    elemento.hidden = !insignia;
    if (insignia) {
      elemento.textContent = insignia.texto;
      elemento.classList.toggle("completa", insignia.completa);
    }
  });
}

function marcarEnlaceActual(id) {
  navegacion.querySelectorAll(".enlace-nav").forEach((enlace) => {
    if (enlace.dataset.id === id) {
      enlace.setAttribute("aria-current", "page");
      enlace.closest("details").open = true;
    } else enlace.removeAttribute("aria-current");
  });
}

// ── Lectura del hash: #/id?clave=valor ──
function leerRuta() {
  const [ruta, consulta = ""] = location.hash.replace(/^#\/?/, "").split("?");
  return { id: ruta || "inicio", parametros: new URLSearchParams(consulta) };
}

async function cargarFragmento(id) {
  if (fragmentosEnCache.has(id)) return fragmentosEnCache.get(id);
  const respuesta = await fetch(`paginas/${id}.html`);
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${id} (${respuesta.status})`);
  const html = await respuesta.text();
  fragmentosEnCache.set(id, html);
  return html;
}

/** Cada `[data-widget="nombre"]` se monta con js/widgets/nombre.js (carga diferida). */
async function montarWidgets(raiz) {
  const elementos = [...raiz.querySelectorAll("[data-widget]")];
  await Promise.all(
    elementos.map(async (elemento) => {
      const nombre = elemento.dataset.widget;
      // Los widgets de contenido (pestañas, secuencias) traen su HTML adentro: no se borra.
      if (!elemento.children.length) elemento.innerHTML = '<div class="widget-cargando">Cargando interactivo…</div>';
      try {
        const modulo = await import(`./widgets/${nombre}.js`);
        await modulo.montar(elemento);
        renderizarMatematica(elemento);
      } catch (error) {
        console.error(`Widget ${nombre}:`, error);
        elemento.innerHTML = `<div class="widget-cargando">No se pudo cargar este interactivo. Probá recargar la página.</div>`;
      }
    }),
  );
}

/** Mejoras comunes de los fragmentos: tablas desplazables, enlaces a material, fotos ampliables, pasos. */
function mejorarContenido(raiz) {
  raiz.querySelectorAll("table").forEach((tabla) => {
    if (!tabla.parentElement.classList.contains("tabla-envoltura")) {
      const envoltura = crear("div", { clase: "tabla-envoltura" });
      tabla.replaceWith(envoltura);
      envoltura.append(tabla);
    }
  });
  raiz.querySelectorAll("[data-material]").forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      abrirMaterial(enlace.dataset.material, Number(enlace.dataset.pagina) || 1);
    });
  });
  raiz.querySelectorAll("figure img").forEach((imagen) => {
    imagen.addEventListener("click", () => abrirImagen(imagen.currentSrc || imagen.src, imagen.alt));
  });
  raiz.querySelectorAll("ol.pasos[data-revelar]").forEach(prepararPasosRevelables);
  raiz.querySelectorAll("[data-ejercicio]").forEach(agregarMarcaResuelto);
  raiz.querySelectorAll("[data-imprimir]").forEach((boton) => boton.addEventListener("click", () => window.print()));
}

/** Botón "Lo resolví" para llevar la cuenta de ejercicios de parciales y autoevaluaciones. */
function agregarMarcaResuelto(cabecera) {
  const id = cabecera.dataset.ejercicio;
  const botonMarca = crear("button", { type: "button", clase: "marca-resuelto" });
  const pintar = () => {
    const resuelto = estaResuelto(id);
    botonMarca.setAttribute("aria-pressed", String(resuelto));
    botonMarca.innerHTML = `${icono("check")}<span>${resuelto ? "Resuelto" : "Marcar como resuelto"}</span>`;
    botonMarca.querySelector("svg").style.width = "14px";
  };
  botonMarca.addEventListener("click", () => { alternarResuelto(id); pintar(); });
  cabecera.append(botonMarca);
  pintar();
}

/** "Intentalo vos": muestra la resolución de a un paso para practicar antes de leerla entera. */
function prepararPasosRevelables(lista) {
  const pasos = [...lista.children];
  let visibles = 1;
  pasos.forEach((paso, i) => paso.classList.toggle("oculto", i >= visibles));
  const botonSiguiente = crear("button", { clase: "boton chico revelar-paso", type: "button", texto: "Ver siguiente paso" });
  const botonTodo = crear("button", { clase: "boton chico", type: "button", texto: "Ver todo" });
  const fila = crear("div", { clase: "fila-botones" }, [botonSiguiente, botonTodo]);
  const actualizar = () => {
    pasos.forEach((paso, i) => paso.classList.toggle("oculto", i >= visibles));
    if (visibles >= pasos.length) fila.remove();
  };
  botonSiguiente.addEventListener("click", () => { visibles += 1; actualizar(); });
  botonTodo.addEventListener("click", () => { visibles = pasos.length; actualizar(); });
  lista.after(fila);
}

function pintarPieDePagina(pagina) {
  const indice = indiceDePagina(pagina.id);
  const anterior = paginas[indice - 1];
  const siguiente = paginas[indice + 1];
  const visto = leerVistos().has(pagina.id);

  const botonVisto = crear("button", { clase: "marcar-visto", type: "button", "aria-pressed": String(visto) });
  const textoVisto = (marcado) => `${icono("check")}<span>${marcado ? "Tema marcado como visto" : "Marcar este tema como visto"}</span>`;
  botonVisto.innerHTML = textoVisto(visto);
  botonVisto.querySelector("svg").style.width = "16px";
  botonVisto.addEventListener("click", () => {
    const marcado = alternarVisto(pagina.id);
    botonVisto.setAttribute("aria-pressed", String(marcado));
    botonVisto.innerHTML = textoVisto(marcado);
    botonVisto.querySelector("svg").style.width = "16px";
  });

  const navegacionPie = crear("nav", { clase: "navegacion-pie", "aria-label": "Temas contiguos" }, [
    anterior ? crear("a", { href: `#/${anterior.id}` }, [crear("small", { texto: "← Anterior" }), crear("span", { texto: anterior.titulo })]) : null,
    siguiente ? crear("a", { clase: "siguiente", href: `#/${siguiente.id}` }, [crear("small", { texto: "Siguiente →" }), crear("span", { texto: siguiente.titulo })]) : null,
  ]);
  contenido.append(botonVisto, navegacionPie);
}

async function mostrarPagina() {
  const { id, parametros } = leerRuta();
  const pagina = buscarPagina(id) || buscarPagina("inicio");

  if (paginaActual !== pagina.id) {
    paginaActual = pagina.id;
    cerrarMenu();
    contenido.innerHTML = '<div class="estado-carga"><span class="punto"></span></div>';
    try {
      const [html] = await Promise.all([cargarFragmento(pagina.id), katexListo()]);
      if (paginaActual !== pagina.id) return; // el lector ya navegó a otro tema
      const grupo = buscarGrupo(pagina.grupo);
      contenido.innerHTML = `<article class="pagina${pagina.amplia ? " amplia" : ""}" style="--color-unidad: var(${grupo?.color || "--acento"})">${html}</article>`;
      const articulo = contenido.firstElementChild;
      renderizarMatematica(articulo);
      mejorarContenido(articulo);
      pintarPieDePagina(pagina);
      pintarIconos(contenido);
      montarWidgets(articulo).then(() => irAlDestino(parametros.get("ir")));
    } catch (error) {
      console.error(error);
      contenido.innerHTML = `<article class="pagina"><div class="aviso error"><span class="titulo-aviso">No se pudo abrir el tema</span><p>Revisá tu conexión y recargá. Si abriste el archivo directo desde la computadora, serví la carpeta con un servidor local (ver README).</p></div></article>`;
    }
    document.title = `${pagina.titulo} · Computación Cuántica FIUBA`;
    document.getElementById("migaActual").textContent = pagina.titulo;
    marcarEnlaceActual(pagina.id);
    registrarVista(pagina.id, pagina.titulo);
    if (!parametros.get("ir")) window.scrollTo({ top: 0 });
  } else {
    irAlDestino(parametros.get("ir"));
  }

  // Material abierto por URL (enlace compartible): #/material?ver=s04&p=3
  const material = parametros.get("ver");
  if (material) abrirMaterial(material, Number(parametros.get("p")) || 1, { actualizarUrl: false });
  else if (visorAbierto()) cerrarVisor({ actualizarUrl: false });
}

/** Lleva a un ancla (?ir=…). Si está dentro de una pestaña oculta, la abre primero. */
function irAlDestino(id) {
  if (!id) return;
  const destino = document.getElementById(id);
  if (!destino) return;
  destino.closest(".panel-pestana")?.dispatchEvent(new CustomEvent("mostrar-pestana", { bubbles: true }));
  requestAnimationFrame(() => destino.scrollIntoView());
}

// ── Menú móvil ──
function abrirMenu() {
  document.body.classList.add("menu-abierto");
  document.getElementById("abrirMenu").setAttribute("aria-expanded", "true");
}
function cerrarMenu() {
  document.body.classList.remove("menu-abierto");
  document.getElementById("abrirMenu").setAttribute("aria-expanded", "false");
}

// ── Tema claro/oscuro ──
function alternarTema() {
  const raiz = document.documentElement;
  const actual = raiz.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const nuevo = actual === "dark" ? "light" : "dark";
  raiz.setAttribute("data-theme", nuevo);
  try { localStorage.setItem("fiuba-tema", nuevo); } catch { /* sin almacenamiento */ }
}

// ── Paleta de búsqueda ──
const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let resultadoElegido = 0;

function abrirPaleta() {
  const paleta = document.getElementById("paleta");
  paleta.classList.add("abierta");
  const entrada = document.getElementById("paletaEntrada");
  entrada.value = "";
  filtrarPaleta("");
  setTimeout(() => entrada.focus(), 10);
}
function cerrarPaleta() {
  document.getElementById("paleta").classList.remove("abierta");
}
function filtrarPaleta(consulta) {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  const coincidencias = paginas.filter((pagina) => {
    const texto = normalizar(`${pagina.titulo} ${pagina.resumen} ${pagina.claves || ""} ${pagina.numero || ""}`);
    return terminos.every((termino) => texto.includes(termino));
  });
  resultadoElegido = 0;
  const lista = document.getElementById("paletaResultados");
  lista.innerHTML = "";
  if (!coincidencias.length) {
    lista.append(crear("div", { clase: "paleta-vacia", texto: "Sin resultados. Probá con otra palabra." }));
    return;
  }
  coincidencias.forEach((pagina, i) => {
    const enlace = crear("a", { href: `#/${pagina.id}`, role: "option", "aria-selected": String(i === 0), alclick: cerrarPaleta }, [
      crear("span", { texto: `${pagina.numero ? pagina.numero + " · " : ""}${pagina.titulo}` }),
      crear("small", { texto: pagina.resumen }),
    ]);
    lista.append(enlace);
  });
}
function moverSeleccionPaleta(delta) {
  const opciones = [...document.querySelectorAll("#paletaResultados a")];
  if (!opciones.length) return;
  resultadoElegido = (resultadoElegido + delta + opciones.length) % opciones.length;
  opciones.forEach((opcion, i) => opcion.setAttribute("aria-selected", String(i === resultadoElegido)));
  opciones[resultadoElegido].scrollIntoView({ block: "nearest" });
}

function conectarEventos() {
  window.addEventListener("hashchange", mostrarPagina);
  window.addEventListener("progreso-practica", pintarProgreso);
  document.getElementById("abrirMenu").addEventListener("click", abrirMenu);
  document.getElementById("velo").addEventListener("click", cerrarMenu);
  document.getElementById("cambiarTema").addEventListener("click", alternarTema);
  document.getElementById("abrirBusqueda").addEventListener("click", abrirPaleta);
  document.getElementById("buscarLateral").addEventListener("click", abrirPaleta);
  document.getElementById("paleta").addEventListener("click", (evento) => { if (evento.target.id === "paleta") cerrarPaleta(); });
  const entrada = document.getElementById("paletaEntrada");
  entrada.addEventListener("input", () => filtrarPaleta(entrada.value));
  entrada.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowDown") { evento.preventDefault(); moverSeleccionPaleta(1); }
    if (evento.key === "ArrowUp") { evento.preventDefault(); moverSeleccionPaleta(-1); }
    if (evento.key === "Enter") {
      const elegido = document.querySelectorAll("#paletaResultados a")[resultadoElegido];
      if (elegido) { location.hash = elegido.getAttribute("href"); cerrarPaleta(); }
    }
  });
  document.addEventListener("keydown", (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") { evento.preventDefault(); abrirPaleta(); }
    if (evento.key === "Escape") { cerrarPaleta(); cerrarMenu(); if (visorAbierto()) cerrarVisor(); }
  });
}

pintarIconos();
pintarNavegacion();
pintarProgreso();
conectarEventos();
iniciarAnalitica();
mostrarPagina();
