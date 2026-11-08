/**
 * Estado de la práctica del lector (en su navegador): ejercicios de parciales y autoevaluaciones
 * marcados como resueltos, récord del quiz y resultados de los ejercicios generados.
 * Cualquier cambio emite el evento "progreso-practica" para refrescar insignias y paneles.
 */
import { leerGuardado, guardar } from "./utilidades.js";

export const ejerciciosDeParciales = {
  r24: { titulo: "Recuperatorio 2024", ejercicios: ["r24-ej1", "r24-ej2", "r24-ej3", "r24-ej4", "r24-ej5"] },
  p26: { titulo: "Parcial 2026", ejercicios: ["p26-ej1", "p26-ej2", "p26-ej3", "p26-ej4", "p26-ej5"] },
  r26: { titulo: "Recuperatorio 2026", ejercicios: ["r26-ej1", "r26-ej2", "r26-ej3", "r26-ej4", "r26-ej5"] },
};
export const autoevaluaciones = ["a1", "a2", "a3", "a4"];
export const PREGUNTAS_POR_RONDA = 10;

const leerResueltos = () => new Set(leerGuardado("resueltos", []));
const avisar = () => window.dispatchEvent(new CustomEvent("progreso-practica"));

export const estaResuelto = (id) => leerResueltos().has(id);

export function alternarResuelto(id) {
  const resueltos = leerResueltos();
  resueltos.has(id) ? resueltos.delete(id) : resueltos.add(id);
  guardar("resueltos", [...resueltos]);
  avisar();
  return resueltos.has(id);
}

export function guardarRecordQuiz(conjunto, aciertos) {
  if (aciertos > leerGuardado(`record-${conjunto}`, 0)) guardar(`record-${conjunto}`, aciertos);
  avisar();
}

export function guardarRachaPractica(racha) {
  guardar("racha-practica", racha);
  avisar();
}

/** Resumen por sección de práctica: { hechos, total, detalle: [bool] } */
export function resumenPractica() {
  const resueltos = leerResueltos();
  const todosLosParciales = Object.values(ejerciciosDeParciales).flatMap((p) => p.ejercicios);
  const racha = leerGuardado("racha-practica", { bien: 0, total: 0 });
  return {
    parciales: { hechos: todosLosParciales.filter((id) => resueltos.has(id)).length, total: todosLosParciales.length, detalle: todosLosParciales.map((id) => resueltos.has(id)) },
    porParcial: Object.fromEntries(Object.entries(ejerciciosDeParciales).map(([clave, p]) => [clave, p.ejercicios.filter((id) => resueltos.has(id)).length])),
    autoevaluaciones: { hechos: autoevaluaciones.filter((id) => resueltos.has(id)).length, total: autoevaluaciones.length, detalle: autoevaluaciones.map((id) => resueltos.has(id)) },
    quiz: { hechos: leerGuardado("record-general", 0), total: PREGUNTAS_POR_RONDA },
    generados: racha,
  };
}

/** Texto corto para la insignia de cada página de práctica en la barra lateral. */
export function insigniaDePagina(id) {
  const r = resumenPractica();
  const fraccion = ({ hechos, total }) => ({ texto: `${hechos}/${total}`, completa: hechos === total && total > 0 });
  if (id === "parciales") return fraccion(r.parciales);
  if (id === "autoevaluaciones") return fraccion(r.autoevaluaciones);
  if (id === "quiz") return r.quiz.hechos ? fraccion(r.quiz) : null;
  if (id === "practica") return r.generados.total ? { texto: `${r.generados.bien}✓`, completa: false } : null;
  return null;
}
