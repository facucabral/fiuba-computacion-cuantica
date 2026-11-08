/**
 * Quiz con explicación por respuesta.
 * data-conjunto="general" | "autoevaluacion1"
 * data-cantidad="10"   preguntas por ronda (modo de a una)
 * data-orden="fijo"    todas las preguntas en lista, en orden y sin mezclar opciones (V/F)
 */
import { crearMarcoWidget, crear, boton, renderizarMatematica, leerGuardado } from "../nucleo/utilidades.js";
import { conjuntos } from "../datos/preguntas.js";
import { buscarPagina } from "../rutas.js";
import { registrarEvento } from "../nucleo/analitica.js";
import { guardarRecordQuiz } from "../nucleo/progresoPractica.js";

const LETRAS = ["A", "B", "C", "D"];

function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Dibuja una pregunta y avisa si se respondió bien. Las opciones se mezclan salvo en V/F. */
function crearPregunta(pregunta, { mezclarOpciones, alResponder }) {
  const indices = pregunta.opciones.map((_, i) => i);
  const orden = mezclarOpciones ? mezclar(indices) : indices;
  const contenedor = crear("div", { clase: "pregunta-quiz" });
  const enunciado = crear("div", { clase: "enunciado", html: pregunta.enunciado });
  const opciones = crear("div", { clase: "opciones" });
  const explicacion = crear("div", { clase: "explicacion-quiz" });

  orden.forEach((indiceOriginal, posicion) => {
    const opcion = crear("button", { type: "button", clase: "opcion" }, [
      crear("span", { clase: "letra", texto: LETRAS[posicion] }),
      crear("span", { html: pregunta.opciones[indiceOriginal] }),
    ]);
    opcion.addEventListener("click", () => {
      const acerto = indiceOriginal === pregunta.correcta;
      opciones.querySelectorAll(".opcion").forEach((boton, p) => {
        boton.disabled = true;
        if (orden[p] === pregunta.correcta) boton.classList.add("correcta");
      });
      if (!acerto) opcion.classList.add("incorrecta");
      const pagina = buscarPagina(pregunta.tema);
      explicacion.innerHTML = `<div class="aviso ${acerto ? "ok" : "error"}"><span class="titulo-aviso">${acerto ? "Correcto" : "No es esa"}</span><p>${pregunta.explicacion}${pagina ? ` <a href="#/${pagina.id}">Repasar: ${pagina.titulo}</a>` : ""}</p></div>`;
      renderizarMatematica(explicacion);
      alResponder(acerto);
    });
    opciones.append(opcion);
  });
  contenedor.append(enunciado, opciones, explicacion);
  renderizarMatematica(contenedor);
  return contenedor;
}

export function montar(contenedor) {
  const nombreConjunto = contenedor.dataset.conjunto || "general";
  const banco = conjuntos[nombreConjunto] || [];
  const fijo = contenedor.dataset.orden === "fijo";
  const cantidad = Math.min(Number(contenedor.dataset.cantidad) || banco.length, banco.length);
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Quiz", titulo: fijo ? `${banco.length} afirmaciones` : `${cantidad} preguntas por ronda` });

  if (fijo) return montarLista(cuerpo, banco);

  let ronda = [];
  let indice = 0;
  let aciertos = 0;
  const marcador = crear("div", { clase: "marcador-quiz" });
  const zona = crear("div", { style: "margin-top:16px" });
  const pie = crear("div", { clase: "fila-botones" });
  cuerpo.append(marcador, zona, pie);

  function empezar() {
    ronda = mezclar(banco).slice(0, cantidad);
    indice = 0;
    aciertos = 0;
    mostrar();
  }

  function pintarMarcador() {
    const record = leerGuardado(`record-${nombreConjunto}`, null);
    marcador.innerHTML = `<span>Pregunta <span class="puntos">${Math.min(indice + 1, ronda.length)}/${ronda.length}</span></span><div class="progreso-quiz"><span style="width:${(indice / ronda.length) * 100}%"></span></div><span>Aciertos <span class="puntos">${aciertos}</span></span>${record !== null ? `<span class="chico texto-2">Récord ${record}/${cantidad}</span>` : ""}`;
  }

  function mostrar() {
    pintarMarcador();
    zona.innerHTML = "";
    pie.innerHTML = "";
    if (indice >= ronda.length) return terminar();
    zona.append(crearPregunta(ronda[indice], {
      mezclarOpciones: true,
      alResponder: (acerto) => {
        if (acerto) aciertos += 1;
        pintarMarcador();
        pie.append(boton(indice === ronda.length - 1 ? "Ver resultado" : "Siguiente pregunta →", () => { indice += 1; mostrar(); }, "boton primario"));
      },
    }));
  }

  function terminar() {
    const record = leerGuardado(`record-${nombreConjunto}`, 0);
    guardarRecordQuiz(nombreConjunto, aciertos);
    registrarEvento("quiz_terminado", { conjunto: nombreConjunto, aciertos });
    const mensaje = aciertos === ronda.length ? "¡Perfecto! Estás listo para esta parte." : aciertos >= ronda.length * 0.7 ? "Muy bien. Repasá los temas de las que fallaste." : "Repasá los temas enlazados y volvé a intentar.";
    zona.innerHTML = `<div class="metricas"><div class="metrica ${aciertos >= ronda.length * 0.7 ? "exito" : "error"}"><small>Resultado</small><strong>${aciertos}/${ronda.length}</strong></div><div class="metrica"><small>Mejor puntaje</small><strong>${Math.max(record, aciertos)}/${cantidad}</strong></div></div><p>${mensaje}</p>`;
    pie.append(boton("Otra ronda", empezar, "boton primario"));
    pintarMarcador();
  }

  empezar();
}

function montarLista(cuerpo, banco) {
  let respondidas = 0;
  let aciertos = 0;
  const resumen = crear("p", { clase: "chico texto-2" });
  const actualizarResumen = () => { resumen.textContent = `Respondidas ${respondidas}/${banco.length} · aciertos ${aciertos}`; };
  banco.forEach((pregunta) => {
    cuerpo.append(crearPregunta(pregunta, { mezclarOpciones: false, alResponder: (acerto) => { respondidas += 1; if (acerto) aciertos += 1; actualizarResumen(); } }), crear("hr"));
  });
  cuerpo.append(resumen, boton("Reiniciar", () => { const padre = cuerpo.parentElement; montar(padre); }));
  actualizarResumen();
}
