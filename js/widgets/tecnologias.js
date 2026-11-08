/** Comparación cualitativa de plataformas de qubits por criterio (barras horizontales). */
import { crearMarcoWidget, crear, segmentado } from "../nucleo/utilidades.js";

// Puntajes 1–5 orientativos (consenso general a 2026), no mediciones.
const PLATAFORMAS = [
  { nombre: "Superconductores", puntajes: { coherencia: 2, velocidad: 5, escala: 4, temperatura: 1, fidelidad: 4 } },
  { nombre: "Iones atrapados", puntajes: { coherencia: 5, velocidad: 2, escala: 2, temperatura: 2, fidelidad: 5 } },
  { nombre: "Fotónica", puntajes: { coherencia: 5, velocidad: 4, escala: 3, temperatura: 4, fidelidad: 2 } },
  { nombre: "Átomos neutros", puntajes: { coherencia: 4, velocidad: 2, escala: 5, temperatura: 2, fidelidad: 3 } },
  { nombre: "RMN", puntajes: { coherencia: 3, velocidad: 2, escala: 1, temperatura: 5, fidelidad: 3 } },
  { nombre: "Topológicos", puntajes: { coherencia: 5, velocidad: 3, escala: 1, temperatura: 1, fidelidad: 1 } },
];

const CRITERIOS = [
  { valor: "coherencia", texto: "Coherencia", detalle: "Cuánto tiempo sobrevive la superposición frente al ruido del entorno." },
  { valor: "velocidad", texto: "Velocidad", detalle: "Qué tan rápido se ejecuta cada compuerta." },
  { valor: "escala", texto: "Escalabilidad", detalle: "Facilidad para sumar muchos qubits hoy. Topológicos: todavía experimental." },
  { valor: "temperatura", texto: "Temperatura", detalle: "Más alto = menos exigencia de frío (5 = temperatura ambiente)." },
  { valor: "fidelidad", texto: "Fidelidad 2 qubits", detalle: "Calidad de las compuertas entrelazantes como la CNOT." },
];

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Comparador", titulo: "Plataformas de qubits" });
  const detalle = crear("p", { clase: "chico texto-2" });
  const barras = crear("div", { clase: "barras" });
  cuerpo.append(segmentado(CRITERIOS, "coherencia", pintar, "Criterio"), detalle, barras);

  function pintar(criterio) {
    const datos = CRITERIOS.find((c) => c.valor === criterio);
    detalle.textContent = datos.detalle;
    barras.innerHTML = "";
    [...PLATAFORMAS].sort((a, b) => b.puntajes[criterio] - a.puntajes[criterio]).forEach((plataforma) => {
      const puntaje = plataforma.puntajes[criterio];
      barras.append(crear("div", { clase: "barra-prob", style: "grid-template-columns: 130px minmax(0,1fr) 34px" }, [
        crear("span", { clase: "etiqueta", texto: plataforma.nombre, style: "font-family: var(--fuente-sans)" }),
        crear("div", { clase: "pista" }, [crear("div", { clase: "relleno", style: `width:${puntaje * 20}%; background: var(--acento); opacity: ${0.35 + puntaje * 0.13}` })]),
        crear("span", { clase: "porcentaje", texto: `${puntaje}/5` }),
      ]));
    });
  }
  pintar("coherencia");
}
