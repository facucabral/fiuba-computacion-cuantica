/**
 * Pestañas accesibles a partir de secciones hijas:
 *   <div data-widget="pestanas"><section data-pestana="Parcial 2026" data-detalle="11/06" id="p26">…</section></div>
 * La pestaña elegida queda en la URL (?ir=<id>) para poder compartirla.
 */
import { crear } from "../nucleo/utilidades.js";
import { resumenPractica } from "../nucleo/progresoPractica.js";

export function montar(contenedor) {
  const paneles = [...contenedor.querySelectorAll(":scope > section[data-pestana]")];
  if (!paneles.length) return;
  const lista = crear("div", { clase: "pestanas-lista", role: "tablist" });
  const botones = paneles.map((panel, i) => {
    panel.classList.add("panel-pestana");
    panel.setAttribute("role", "tabpanel");
    const boton = crear("button", { type: "button", role: "tab", id: `pestana-${panel.id || i}`, "aria-controls": panel.id }, [
      crear("span", { texto: panel.dataset.pestana }),
      crear("small", { clase: "detalle-pestana" }),
    ]);
    boton.addEventListener("click", () => { mostrar(i); anotarEnUrl(panel.id); });
    panel.addEventListener("mostrar-pestana", () => mostrar(i));
    return boton;
  });
  lista.append(...botones);
  contenedor.prepend(lista);

  function pintarDetalles() {
    const porParcial = resumenPractica().porParcial;
    paneles.forEach((panel, i) => {
      const hechos = porParcial[panel.id];
      botones[i].querySelector(".detalle-pestana").textContent = [panel.dataset.detalle, hechos !== undefined ? `${hechos}/5 resueltos` : null].filter(Boolean).join(" · ");
    });
  }

  function mostrar(indice) {
    paneles.forEach((panel, i) => { panel.hidden = i !== indice; });
    botones.forEach((boton, i) => boton.setAttribute("aria-selected", String(i === indice)));
  }

  function anotarEnUrl(id) {
    if (!id) return;
    const [ruta, consulta = ""] = location.hash.split("?");
    const parametros = new URLSearchParams(consulta);
    parametros.set("ir", id);
    history.replaceState(null, "", `${ruta}?${parametros}`);
  }

  // Abre la pestaña pedida en la URL (directa o que contiene el ancla), o la primera.
  const pedido = new URLSearchParams(location.hash.split("?")[1] || "").get("ir");
  const indicePedido = paneles.findIndex((panel) => panel.id === pedido || (pedido && panel.querySelector(`#${CSS.escape(pedido)}`)));
  mostrar(indicePedido >= 0 ? indicePedido : 0);
  pintarDetalles();
  window.addEventListener("progreso-practica", pintarDetalles);
}
