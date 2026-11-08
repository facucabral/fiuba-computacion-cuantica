/** Dibujo estático de un circuito guardado (para enunciados): <div data-widget="circuito" data-preset="…"> */
import { dibujarCircuito } from "../nucleo/circuitos.js";
import { circuitosGuardados } from "../datos/circuitos.js";

export function montar(contenedor) {
  const circuito = circuitosGuardados[contenedor.dataset.preset];
  if (!circuito) return;
  contenedor.className = "circuito-svg circuito-enunciado";
  contenedor.innerHTML = dibujarCircuito(circuito);
}
