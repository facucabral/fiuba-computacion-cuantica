/** Mezcla clásica de dos estados puros: matriz ρ, pureza y vector dentro de la bola de Bloch. */
import { crearMarcoWidget, crear, deslizador, segmentado, escribirTex, alCambiarAspecto } from "../nucleo/utilidades.js";
import { crearDibujanteBloch } from "./esferaBloch.js";

const ESTADOS = {
  "0": { v: [0, 0, 1], nombre: "|0\\rangle" }, "1": { v: [0, 0, -1], nombre: "|1\\rangle" },
  "+": { v: [1, 0, 0], nombre: "|+\\rangle" }, "-": { v: [-1, 0, 0], nombre: "|-\\rangle" },
};
const OPCIONES = Object.keys(ESTADOS).map((k) => ({ valor: k, texto: `|${k.replace("-", "−")}⟩` }));
const n = (v) => Number(v.toFixed(3));

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Matriz densidad", titulo: "Mezclar dos estados" });
  let estadoA = "0";
  let estadoB = "1";
  let p = 0.5;

  const lienzo = crear("canvas", { "aria-label": "Vector de Bloch del estado mezcla" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const dibujante = crearDibujanteBloch(lienzo, { altoRelativo: 0.9 });
  const lectura = crear("div", { clase: "lectura-estado" });
  const explicacion = crear("p", { clase: "chico texto-2" });

  cuerpo.append(crear("div", { clase: "widget-columnas" }, [
    envoltura,
    crear("div", { clase: "bloch-controles" }, [
      crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Estado A:" }), segmentado(OPCIONES, estadoA, (v) => { estadoA = v; actualizar(); }, "Estado A")]),
      crear("div", { clase: "fila-botones" }, [crear("span", { clase: "chico texto-2", texto: "Estado B:" }), segmentado(OPCIONES, estadoB, (v) => { estadoB = v; actualizar(); }, "Estado B")]),
      deslizador({ etiqueta: "Probabilidad clásica de A, p", min: 0, max: 1, paso: 0.01, valor: p, formato: (v) => v.toFixed(2), alCambiar: (v) => { p = v; actualizar(); } }),
      lectura, explicacion,
    ]),
  ]));

  function actualizar() {
    const a = ESTADOS[estadoA].v;
    const b = ESTADOS[estadoB].v;
    const r = [0, 1, 2].map((i) => p * a[i] + (1 - p) * b[i]);
    // ρ = ½(I + r·σ)
    const rho00 = (1 + r[2]) / 2;
    const rho11 = (1 - r[2]) / 2;
    const rho01 = { re: r[0] / 2, im: -r[1] / 2 };
    const pureza = (1 + r[0] ** 2 + r[1] ** 2 + r[2] ** 2) / 2;
    const proyector = (k) => `|${k}\\rangle\\langle ${k}|`;
    escribirTex(lectura, `\\begin{aligned}\\rho &= ${n(p)}\\,${proyector(estadoA)} + ${n(1 - p)}\\,${proyector(estadoB)} =\\begin{pmatrix}${n(rho00)} & ${n(rho01.re)}\\\\ ${n(rho01.re)} & ${n(rho11)}\\end{pmatrix}\\\\ \\mathrm{Tr}(\\rho^2) &= ${n(pureza)} \\quad |\\vec r| = ${n(Math.hypot(...r))}\\end{aligned}`, true);
    explicacion.textContent = pureza > 0.999 ? "Estado puro: el vector toca la superficie." : Math.hypot(...r) < 0.01 ? "Estado máximamente mixto: ρ = I/2, el centro de la bola. Da 50/50 en cualquier base." : "Estado mixto: el vector queda adentro de la esfera. Cuanto más corto, menos información.";
    dibujante.dibujar({ vectores: [{ v: a, color: "--texto-3" }, { v: b, color: "--texto-3" }, { v: r }] });
  }

  lienzo.addEventListener("vista", actualizar);
  alCambiarAspecto(envoltura, actualizar);
  actualizar();
}
