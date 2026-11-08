/** Tablero de práctica: qué hay para practicar y cuánto lleva hecho el lector. */
import { crear } from "../nucleo/utilidades.js";
import { resumenPractica } from "../nucleo/progresoPractica.js";

const TARJETAS = [
  { id: "parciales", tipo: "Parciales reales", titulo: "Parciales resueltos", texto: "3 exámenes completos, ejercicio por ejercicio.", tinte: "--u-practica", dato: (r) => r.parciales, unidad: "ejercicios resueltos" },
  { id: "practica", tipo: "Generador", titulo: "Ejercicios infinitos", texto: "Circuitos al azar que se corrigen solos.", tinte: "--u-circuitos", dato: (r) => ({ hechos: r.generados.bien, total: r.generados.total }), unidad: "bien" },
  { id: "quiz", tipo: "Conceptos", titulo: "Quiz por tema", texto: "Preguntas rápidas con explicación.", tinte: "--u-algoritmos", dato: (r) => r.quiz, unidad: "mejor ronda" },
  { id: "autoevaluaciones", tipo: "Campus", titulo: "Autoevaluaciones", texto: "Las 4 del campus resueltas.", tinte: "--u-matematica", dato: (r) => r.autoevaluaciones, unidad: "hechas" },
  { id: "machete", tipo: "Repaso", titulo: "Machete", texto: "Todo en una hoja, también en PDF.", tinte: "--u-mecanica", dato: null, unidad: "" },
];

export function montar(contenedor) {
  contenedor.className = "panel-practica";
  const pintar = () => {
    const resumen = resumenPractica();
    contenedor.replaceChildren(...TARJETAS.map((t) => {
      const dato = t.dato?.(resumen);
      const progreso = dato && dato.total ? dato.hechos / dato.total : 0;
      const tarjeta = crear("a", { clase: "tarjeta-practica", href: `#/${t.id}`, style: `--tinte: var(${t.tinte})` }, [
        crear("span", { clase: "tipo", texto: t.tipo }),
        crear("h4", { texto: t.titulo }),
        crear("p", { texto: t.texto }),
      ]);
      if (dato) {
        const valor = t.id === "practica" ? (dato.total ? `${dato.hechos}/${dato.total}` : "—") : `${dato.hechos}/${dato.total}`;
        tarjeta.append(crear("div", { clase: "estado" }, [crear("strong", { texto: valor }), crear("span", { texto: t.unidad })]));
        tarjeta.append(crear("div", { clase: "barra" }, [crear("span", { style: `width:${Math.round(progreso * 100)}%` })]));
        if (t.id === "parciales") tarjeta.append(crear("div", { clase: "detalle", "aria-hidden": "true" }, resumen.parciales.detalle.map((si) => crear("i", { clase: si ? "si" : "" }))));
      } else {
        tarjeta.append(crear("div", { clase: "estado" }, [crear("strong", { texto: "PDF" }), crear("span", { texto: "para tener sin conexión" })]));
      }
      return tarjeta;
    }));
  };
  pintar();
  window.addEventListener("progreso-practica", pintar);
}
