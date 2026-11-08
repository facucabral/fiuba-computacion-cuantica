/** Íconos de trazo (estilo lucide) dibujados inline para no depender de otra librería. */
const trazos = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  tema: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/>',
  cerrar: '<path d="M18 6 6 18M6 6l12 12"/>',
  mas: '<circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5"/>',
  menos: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-3.5-3.5"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  descargar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  reiniciar: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
  reproducir: '<path d="M7 4v16l13-8z"/>',
  siguiente: '<path d="m9 6 6 6-6 6"/>',
  anterior: '<path d="m15 6-6 6 6 6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
};

export function icono(nombre) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazos[nombre] || ""}</svg>`;
}

/** Reemplaza cada `[data-icono]` por su SVG. */
export function pintarIconos(raiz = document) {
  raiz.querySelectorAll("[data-icono]").forEach((elemento) => {
    elemento.innerHTML = icono(elemento.dataset.icono);
  });
}
