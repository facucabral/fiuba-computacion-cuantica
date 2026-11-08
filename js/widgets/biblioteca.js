/** Biblioteca del material: filtros por categoría, búsqueda, visor integrado, pestaña nueva y descarga. */
import { crearMarcoWidget, crear, segmentado } from "../nucleo/utilidades.js";
import { icono } from "../nucleo/iconos.js";
import { categorias, material, rutaMaterial } from "../datos/material.js";
import { abrirMaterial } from "../nucleo/visor.js";
import { buscarPagina } from "../rutas.js";

const normalizar = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Material", titulo: `${material.length} archivos` });
  let categoria = "todas";
  let consulta = "";
  const buscador = crear("input", { type: "search", placeholder: "Filtrar por nombre…", "aria-label": "Filtrar material", style: "flex:1;min-width:180px" });
  const lista = crear("div");
  buscador.addEventListener("input", () => { consulta = normalizar(buscador.value); pintar(); });

  cuerpo.append(
    crear("div", { clase: "fila-botones" }, [segmentado([{ valor: "todas", texto: "Todo" }, ...categorias.map((c) => ({ valor: c.id, texto: c.titulo.split(" ")[0] }))], categoria, (v) => { categoria = v; pintar(); }, "Categoría"), buscador]),
    lista,
  );

  function pintar() {
    lista.innerHTML = "";
    const visibles = categorias.filter((c) => categoria === "todas" || c.id === categoria);
    let hay = false;
    for (const cat of visibles) {
      const items = material.filter((m) => m.categoria === cat.id && normalizar(m.titulo).includes(consulta));
      if (!items.length) continue;
      hay = true;
      lista.append(crear("h5", { clase: "subtitulo-widget", texto: cat.titulo }), crear("p", { clase: "chico texto-2", texto: cat.descripcion }));
      for (const item of items) {
        const url = rutaMaterial(item);
        const tema = buscarPagina(item.tema);
        const extension = item.tipo === "imagen" ? "IMG" : "PDF";
        const detalle = [item.paginas ? `${item.paginas} págs.` : null, tema ? `Tema: ${tema.titulo}` : null].filter(Boolean).join(" · ");
        const ver = crear("button", { type: "button", clase: "boton chico primario", html: `${icono("ojo")} Ver`, alclick: () => abrirMaterial(item.id) });
        const pestana = crear("a", { clase: "boton chico", href: url, target: "_blank", rel: "noopener", html: `${icono("externo")} Pestaña`, "aria-label": `Abrir ${item.titulo} en otra pestaña` });
        const descargar = crear("a", { clase: "boton chico", href: url, download: item.archivo.split("/").pop(), html: `${icono("descargar")} Bajar`, "aria-label": `Descargar ${item.titulo}` });
        lista.append(crear("div", { clase: "material-item" }, [
          crear("span", { clase: "icono-doc", texto: extension }),
          crear("div", {}, [crear("h4", { texto: item.titulo }), crear("p", { html: tema ? `${detalle.replace(`Tema: ${tema.titulo}`, `Tema: <a href="#/${tema.id}">${tema.titulo}</a>`)}` : detalle })]),
          crear("div", { clase: "acciones-doc" }, [ver, pestana, descargar]),
        ]));
      }
    }
    if (!hay) lista.append(crear("p", { clase: "paleta-vacia", texto: "No hay material con ese nombre." }));
  }
  pintar();
}
