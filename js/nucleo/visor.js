/**
 * Visor de documentos dentro de la página: PDF (con PDF.js) e imágenes.
 * Siempre ofrece abrir el archivo en otra pestaña y descargarlo.
 * La URL refleja lo abierto (#/tema?ver=s04&p=3) para poder compartirlo, y el botón
 * "atrás" del celular cierra el visor en lugar de salir de la guía.
 */
import { buscarMaterial, rutaMaterial } from "../datos/material.js";
import { registrarEvento } from "./analitica.js";

const VERSION_PDFJS = "3.11.174";
const URL_PDFJS = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION_PDFJS}/pdf.min.js`;
const URL_TRABAJADOR = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION_PDFJS}/pdf.worker.min.js`;
const ESCALAS = [0.6, 0.8, 1, 1.25, 1.5, 2];

const elementos = {
  visor: document.getElementById("visor"),
  titulo: document.getElementById("visorTitulo"),
  paginas: document.getElementById("visorPaginas"),
  lienzo: document.getElementById("visorLienzo"),
  pestana: document.getElementById("visorPestana"),
  descargar: document.getElementById("visorDescargar"),
};

let promesaPdfjs = null;
let documentoActual = null;
let observadorPaginas = null;
let observadorVisibles = null;
let indiceEscala = 2;
let entradaEnHistorial = false;
let elementoConFoco = null;
let idAbierto = null;

function cargarPdfjs() {
  if (!promesaPdfjs) {
    promesaPdfjs = new Promise((resolver, rechazar) => {
      const script = document.createElement("script");
      script.src = URL_PDFJS;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL_TRABAJADOR;
        resolver(window.pdfjsLib);
      };
      script.onerror = () => {
        promesaPdfjs = null;
        rechazar(new Error("No se pudo cargar PDF.js"));
      };
      document.head.append(script);
    });
  }
  return promesaPdfjs;
}

export const visorAbierto = () => elementos.visor.classList.contains("abierto");

function prepararVisor(titulo, url, nombreArchivo) {
  elementoConFoco = document.activeElement;
  elementos.titulo.textContent = titulo;
  elementos.paginas.textContent = "";
  elementos.pestana.href = url;
  elementos.descargar.href = url;
  elementos.descargar.setAttribute("download", nombreArchivo);
  elementos.lienzo.innerHTML = '<p class="visor-mensaje">Abriendo…</p>';
  elementos.visor.classList.add("abierto");
  document.body.style.overflow = "hidden";
  document.getElementById("visorCerrar").focus();
}

function anotarEnUrl(id, pagina) {
  const [ruta, consulta = ""] = location.hash.split("?");
  const parametros = new URLSearchParams(consulta);
  parametros.set("ver", id);
  if (pagina > 1) parametros.set("p", pagina);
  else parametros.delete("p");
  const nuevoHash = `${ruta || "#/material"}?${parametros}`;
  if (entradaEnHistorial) history.replaceState(null, "", nuevoHash);
  else {
    history.pushState(null, "", nuevoHash);
    entradaEnHistorial = true;
  }
}

export async function abrirMaterial(id, paginaInicial = 1, { actualizarUrl = true } = {}) {
  const item = buscarMaterial(id);
  if (!item) return;
  if (idAbierto === id && visorAbierto()) return;
  idAbierto = id;
  const url = rutaMaterial(item);
  prepararVisor(item.titulo, url, item.archivo.split("/").pop());
  if (actualizarUrl) anotarEnUrl(id, paginaInicial);
  registrarEvento("abrir_material", { material: id });

  if (item.tipo === "imagen") {
    mostrarImagen(url, item.titulo);
    return;
  }
  try {
    const pdfjs = await cargarPdfjs();
    documentoActual?.destroy();
    documentoActual = await pdfjs.getDocument({ url }).promise;
    if (idAbierto !== id) return;
    await dibujarHojasVacias(documentoActual, paginaInicial);
  } catch (error) {
    console.error(error);
    elementos.lienzo.innerHTML = `<div class="visor-mensaje"><p>No se pudo mostrar el PDF acá.</p><p><a class="boton" href="${url}" target="_blank" rel="noopener">Abrirlo en otra pestaña</a></p></div>`;
  }
}

export function abrirImagen(url, titulo = "Imagen") {
  idAbierto = url;
  prepararVisor(titulo, url, url.split("/").pop());
  mostrarImagen(url, titulo);
}

function mostrarImagen(url, titulo) {
  elementos.lienzo.innerHTML = "";
  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.style.maxWidth = "1000px";
  const imagen = new Image();
  imagen.src = url;
  imagen.alt = titulo;
  hoja.append(imagen);
  elementos.lienzo.append(hoja);
}

/** Reserva el lugar de cada hoja y solo dibuja las que entran en pantalla (PDF de 46 hojas en celular). */
async function dibujarHojasVacias(documento, paginaInicial) {
  observadorPaginas?.disconnect();
  observadorVisibles?.disconnect();
  elementos.lienzo.innerHTML = "";
  const primera = await documento.getPage(1);
  const vistaBase = primera.getViewport({ scale: 1 });
  const anchoDisponible = Math.min(elementos.lienzo.clientWidth - 24, 1000 * ESCALAS[indiceEscala]);
  const hojas = [];

  for (let numero = 1; numero <= documento.numPages; numero += 1) {
    const hoja = document.createElement("div");
    hoja.className = "hoja";
    hoja.dataset.numero = numero;
    hoja.style.width = `${anchoDisponible}px`;
    hoja.style.aspectRatio = `${vistaBase.width} / ${vistaBase.height}`;
    elementos.lienzo.append(hoja);
    hojas.push(hoja);
  }

  observadorPaginas = new IntersectionObserver(
    (entradas) => entradas.forEach((entrada) => entrada.isIntersecting && dibujarHoja(documento, entrada.target)),
    { root: elementos.lienzo, rootMargin: "600px 0px" },
  );
  observadorVisibles = new IntersectionObserver(
    (entradas) => {
      const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const numero = Number(visible.target.dataset.numero);
      elementos.paginas.textContent = `${numero} / ${documento.numPages}`;
      if (idAbierto) anotarEnUrl(idAbierto, numero);
    },
    { root: elementos.lienzo, threshold: [0.3, 0.6] },
  );
  hojas.forEach((hoja) => { observadorPaginas.observe(hoja); observadorVisibles.observe(hoja); });
  elementos.paginas.textContent = `${paginaInicial} / ${documento.numPages}`;
  if (paginaInicial > 1) hojas[Math.min(paginaInicial, hojas.length) - 1].scrollIntoView();
}

async function dibujarHoja(documento, hoja) {
  if (hoja.dataset.dibujada) return;
  hoja.dataset.dibujada = "1";
  const pagina = await documento.getPage(Number(hoja.dataset.numero));
  const densidad = Math.min(window.devicePixelRatio || 1, 2);
  const escala = (hoja.clientWidth / pagina.getViewport({ scale: 1 }).width) * densidad;
  const vista = pagina.getViewport({ scale: escala });
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.floor(vista.width);
  lienzo.height = Math.floor(vista.height);
  hoja.append(lienzo);
  await pagina.render({ canvasContext: lienzo.getContext("2d"), viewport: vista }).promise;
}

function cambiarEscala(delta) {
  if (!documentoActual) return;
  indiceEscala = Math.max(0, Math.min(ESCALAS.length - 1, indiceEscala + delta));
  const actual = Number((elementos.paginas.textContent.split(" / ")[0]) || 1);
  dibujarHojasVacias(documentoActual, actual);
}

export function cerrarVisor({ actualizarUrl = true } = {}) {
  elementos.visor.classList.remove("abierto");
  document.body.style.overflow = "";
  observadorPaginas?.disconnect();
  observadorVisibles?.disconnect();
  elementos.lienzo.innerHTML = "";
  idAbierto = null;
  if (actualizarUrl && entradaEnHistorial) {
    entradaEnHistorial = false;
    history.back();
  } else if (actualizarUrl) {
    history.replaceState(null, "", location.hash.split("?")[0]);
  }
  entradaEnHistorial = false;
  elementoConFoco?.focus?.();
}

document.getElementById("visorCerrar").addEventListener("click", () => cerrarVisor());
document.getElementById("visorAcercar").addEventListener("click", () => cambiarEscala(1));
document.getElementById("visorAlejar").addEventListener("click", () => cambiarEscala(-1));
window.addEventListener("popstate", () => {
  // Atrás del navegador con el visor abierto: lo cierra sin volver a tocar el historial.
  if (visorAbierto() && !location.hash.includes("ver=")) {
    entradaEnHistorial = false;
    cerrarVisor({ actualizarUrl: false });
  }
});
