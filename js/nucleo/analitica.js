/**
 * Google Analytics (misma propiedad que facucabral.me). Solo se activa en el sitio publicado,
 * así el repo clonado o abierto en local no envía datos.
 * Los parámetros utm_* de la URL de entrada (por ejemplo desde FIUBA Repos) los toma GA4 solo.
 */
const ID_MEDICION = "G-9J8FKQW5P3";
const dominioPublicado = location.hostname === "facucabral.me" || location.hostname === "www.facucabral.me";

export function iniciarAnalitica() {
  if (!dominioPublicado) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID_MEDICION}`;
  document.head.append(script);
  window.gtag("js", new Date());
  // La primera vista la envía registrarVista con la ruta interna.
  window.gtag("config", ID_MEDICION, { send_page_view: false });
}

/** Vista virtual por cada tema abierto: /fiuba/cuantica/#/bloch → page_path /fiuba/cuantica/bloch */
export function registrarVista(idPagina, titulo) {
  if (!dominioPublicado || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_title: `${titulo} · Cuántica FIUBA`,
    page_location: location.href,
    page_path: `${location.pathname.replace(/\/$/, "")}/${idPagina}`,
  });
}

export function registrarEvento(nombre, datos = {}) {
  if (!dominioPublicado || !window.gtag) return;
  window.gtag("event", nombre, datos);
}
