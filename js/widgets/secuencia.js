/**
 * Proceso paso a paso: muestra de a un `.paso-visual` por vez, con su efecto y una explicación breve.
 * Uso:
 *   <div data-widget="secuencia" data-titulo="Armar un bra">
 *     <div class="paso-visual" data-titulo="Partimos del ket">…</div>
 *     …
 *   </div>
 * Dentro de las fórmulas, \htmlClass{q-cambio}{…} resalta lo que cambia en ese paso.
 */
import { crear, boton, reducirMovimiento } from "../nucleo/utilidades.js";

export function montar(contenedor) {
  const pasos = [...contenedor.querySelectorAll(":scope > .paso-visual")];
  if (!pasos.length) return;
  let actual = 0;
  let reproduccion = null;
  const vistos = new Set([0]);

  const escenario = crear("div", { clase: "secuencia-escenario" });
  pasos.forEach((paso, i) => {
    const rotulo = crear("div", { clase: "rotulo-paso", html: `<b>${i + 1}</b>${paso.dataset.titulo || `Paso ${i + 1}`}` });
    paso.prepend(rotulo);
    escenario.append(paso);
  });

  const puntos = crear("div", { clase: "puntos-secuencia", role: "tablist", "aria-label": "Pasos" });
  const botonesPuntos = pasos.map((_, i) => crear("button", { type: "button", "aria-label": `Ir al paso ${i + 1}`, alclick: () => { detener(); ir(i); } }));
  puntos.append(...botonesPuntos);
  const anterior = boton("← Anterior", () => { detener(); ir(actual - 1); });
  const siguiente = boton("Siguiente →", () => { detener(); ir(actual + 1); }, "boton chico primario");
  const reproducir = boton("▶ Reproducir", alternarReproduccion);
  const contador = crear("span", { clase: "contador" });

  contenedor.classList.add("widget");
  contenedor.innerHTML = "";
  const cabecera = crear("div", { clase: "widget-cabecera" }, [crear("span", { clase: "rotulo", texto: "Paso a paso" }), crear("h4", { texto: contenedor.dataset.titulo || "" })]);
  const cuerpo = crear("div", { clase: "widget-cuerpo" }, [puntos, escenario, crear("div", { clase: "controles-secuencia" }, [anterior, siguiente, reproducir, contador])]);
  contenedor.append(cabecera, cuerpo);

  function ir(indice) {
    actual = Math.max(0, Math.min(pasos.length - 1, indice));
    vistos.add(actual);
    pasos.forEach((paso, i) => paso.classList.toggle("activo", i === actual));
    botonesPuntos.forEach((b, i) => {
      b.toggleAttribute("aria-current", false);
      if (i === actual) b.setAttribute("aria-current", "step");
      b.classList.toggle("visto", vistos.has(i) && i !== actual);
    });
    anterior.disabled = actual === 0;
    siguiente.disabled = actual === pasos.length - 1;
    contador.textContent = `${actual + 1} / ${pasos.length}`;
  }

  function alternarReproduccion() {
    if (reproduccion) return detener();
    if (actual === pasos.length - 1) ir(0);
    reproducir.innerHTML = "❚❚ Pausa";
    reproduccion = setInterval(() => {
      if (actual >= pasos.length - 1) return detener();
      ir(actual + 1);
    }, reducirMovimiento() ? 4000 : 2800);
  }

  function detener() {
    clearInterval(reproduccion);
    reproduccion = null;
    reproducir.innerHTML = "▶ Reproducir";
  }

  ir(0);
}
