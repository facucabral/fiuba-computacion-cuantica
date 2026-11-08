/**
 * Stern-Gerlach secuencial: átomos que atraviesan aparatos orientados en z o en x.
 * Cada aparato mide el spin en su eje; la salida no elegida se bloquea.
 * La animación se pausa cuando el widget no está a la vista.
 */
import { crearMarcoWidget, crear, segmentado, prepararLienzo, colorDelTema, alCambiarAspecto, reducirMovimiento, boton, porcentaje } from "../nucleo/utilidades.js";

const PRESETS = [
  { valor: "z", texto: "Un aparato z", etapas: [{ eje: "z", sigue: null }] },
  { valor: "zz", texto: "z → z", etapas: [{ eje: "z", sigue: "arriba" }, { eje: "z", sigue: null }] },
  { valor: "zx", texto: "z → x", etapas: [{ eje: "z", sigue: "arriba" }, { eje: "x", sigue: null }] },
  { valor: "zxz", texto: "z → x → z", etapas: [{ eje: "z", sigue: "arriba" }, { eje: "x", sigue: "arriba" }, { eje: "z", sigue: null }] },
];

// Estado del spin como ángulo en el plano z–x de la esfera de Bloch: 0 = ↑z, π = ↓z, π/2 = ↑x, 3π/2 = ↓x.
const ANGULO_EJE = { z: 0, x: Math.PI / 2 };

export function montar(contenedor) {
  const { cuerpo } = crearMarcoWidget(contenedor, { rotulo: "Stern-Gerlach", titulo: "Átomos de plata por imanes" });
  let preset = PRESETS[3];
  let particulas = [];
  let conteos = { arriba: 0, abajo: 0, bloqueadas: 0, total: 0 };
  let ultimoNacimiento = 0;
  let animacion = null;
  let visible = true;

  const lienzo = crear("canvas", { "aria-label": "Animación del experimento de Stern-Gerlach" });
  const envoltura = crear("div", { clase: "lienzo-envoltura" }, [lienzo]);
  const metricas = crear("div", { clase: "metricas" });
  const explicacion = crear("p", { clase: "chico texto-2" });
  const selector = segmentado(PRESETS, preset.valor, (v) => { preset = PRESETS.find((p) => p.valor === v); reiniciar(); }, "Configuración");
  cuerpo.append(crear("div", { clase: "fila-botones" }, [selector, boton("Reiniciar conteo", reiniciar)]), envoltura, metricas, explicacion);

  /** Simula el recorrido completo de un átomo al nacer (horno: orientación al azar). */
  function simularRecorrido() {
    let angulo = Math.random() < 0.5 ? 0 : Math.PI; // un haz no polarizado se comporta como mezcla 50/50
    const salidas = [];
    for (const etapa of preset.etapas) {
      const pArriba = Math.cos((angulo - ANGULO_EJE[etapa.eje]) / 2) ** 2;
      const salida = Math.random() < pArriba ? "arriba" : "abajo";
      salidas.push(salida);
      angulo = ANGULO_EJE[etapa.eje] + (salida === "arriba" ? 0 : Math.PI);
      if (etapa.sigue && etapa.sigue !== salida) return { salidas, bloqueada: true };
    }
    return { salidas, bloqueada: false };
  }

  function geometria(ancho, alto) {
    const n = preset.etapas.length;
    const inicio = 70;
    const fin = ancho - 70;
    const paso = (fin - inicio) / n;
    const centro = alto / 2;
    const separacion = Math.min(46, alto * 0.22);
    return { n, inicio, fin, paso, centro, separacion, xEtapa: (i) => inicio + paso * i + paso * 0.18, anchoImán: paso * 0.34 };
  }

  /** Puntos de la trayectoria de un átomo (para moverlo a velocidad constante). */
  function trayectoria(recorrido, g) {
    const puntos = [[20, g.centro]];
    recorrido.salidas.forEach((salida, i) => {
      const x0 = g.xEtapa(i);
      const x1 = x0 + g.anchoImán;
      const desvio = salida === "arriba" ? -g.separacion : g.separacion;
      puntos.push([x0, g.centro], [x1, g.centro + desvio * 0.5]);
      const esUltima = i === recorrido.salidas.length - 1;
      if (recorrido.bloqueada && esUltima) puntos.push([x1 + 26, g.centro + desvio]);
      else if (esUltima) puntos.push([g.fin + 30, g.centro + desvio * 1.2]);
      else puntos.push([x1 + g.paso * 0.3, g.centro + desvio], [g.xEtapa(i + 1), g.centro]);
    });
    return puntos;
  }

  function dibujar(ahora = performance.now()) {
    const { contexto: ctx, ancho, alto } = prepararLienzo(lienzo, 0.4);
    const g = geometria(ancho, alto);
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center";
    // Horno
    ctx.fillStyle = colorDelTema("--superficie-2");
    ctx.strokeStyle = colorDelTema("--borde-fuerte");
    ctx.beginPath(); ctx.roundRect(4, g.centro - 18, 30, 36, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = colorDelTema("--texto-3");
    ctx.fillText("horno", 19, g.centro + 32);
    // Imanes
    preset.etapas.forEach((etapa, i) => {
      const x = g.xEtapa(i);
      ctx.fillStyle = colorDelTema("--compuerta-fondo");
      ctx.strokeStyle = colorDelTema(etapa.eje === "z" ? "--dato-0" : "--dato-2");
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, g.centro - g.separacion * 0.9, g.anchoImán, g.separacion * 1.8, 8); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = colorDelTema(etapa.eje === "z" ? "--dato-0" : "--dato-2");
      ctx.fillText(`SG ${etapa.eje}`, x + g.anchoImán / 2, g.centro + 4);
      if (etapa.sigue) {
        const yBloqueo = g.centro + (etapa.sigue === "arriba" ? g.separacion : -g.separacion);
        ctx.fillStyle = colorDelTema("--error");
        ctx.fillRect(x + g.anchoImán + 22, yBloqueo - 9, 6, 18);
        ctx.fillStyle = colorDelTema("--texto-3");
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(etapa.sigue === "arriba" ? "sigue ↑" : "sigue ↓", x + g.anchoImán + 40, g.centro + (etapa.sigue === "arriba" ? -g.separacion - 10 : g.separacion + 18));
        ctx.font = "600 12px Inter, sans-serif";
      }
    });
    // Pantalla final
    const ultimo = preset.etapas.at(-1).eje;
    ctx.fillStyle = colorDelTema("--texto-2");
    ctx.fillText(ultimo === "z" ? "↑z" : "↑x", g.fin + 44, g.centro - g.separacion * 1.2 - 14);
    ctx.fillText(ultimo === "z" ? "↓z" : "↓x", g.fin + 44, g.centro + g.separacion * 1.2 + 24);
    ctx.strokeStyle = colorDelTema("--borde-fuerte");
    ctx.beginPath(); ctx.moveTo(g.fin + 34, 8); ctx.lineTo(g.fin + 34, alto - 8); ctx.stroke();
    // Partículas
    const velocidad = 0.16; // px por ms
    ctx.fillStyle = colorDelTema("--acento");
    particulas = particulas.filter((p) => {
      const recorrido = (ahora - p.nacimiento) * velocidad;
      const posicion = puntoEn(p.puntos, recorrido);
      if (!posicion) {
        if (!p.contada) contarLlegada(p);
        return false;
      }
      ctx.beginPath(); ctx.arc(posicion[0], posicion[1], 3, 0, Math.PI * 2); ctx.fill();
      return true;
    });
  }

  function puntoEn(puntos, distancia) {
    let restante = distancia;
    for (let i = 1; i < puntos.length; i += 1) {
      const [x0, y0] = puntos[i - 1];
      const [x1, y1] = puntos[i];
      const largo = Math.hypot(x1 - x0, y1 - y0);
      if (restante <= largo) return [x0 + ((x1 - x0) * restante) / largo, y0 + ((y1 - y0) * restante) / largo];
      restante -= largo;
    }
    return null;
  }

  function contarLlegada(particula) {
    particula.contada = true;
    conteos.total += 1;
    if (particula.recorrido.bloqueada) conteos.bloqueadas += 1;
    else conteos[particula.recorrido.salidas.at(-1)] += 1;
    pintarMetricas();
  }

  function pintarMetricas() {
    const llegaron = conteos.arriba + conteos.abajo;
    const eje = preset.etapas.at(-1).eje;
    metricas.innerHTML = "";
    [[`Detector ↑${eje}`, conteos.arriba, llegaron], [`Detector ↓${eje}`, conteos.abajo, llegaron], ["Bloqueadas", conteos.bloqueadas, conteos.total]].forEach(([etiqueta, n, total]) => {
      metricas.append(crear("div", { clase: "metrica" }, [crear("small", { texto: etiqueta }), crear("strong", { texto: `${n}` }), crear("small", { texto: total ? porcentaje(n / total) : "—" })]));
    });
  }

  function cuadro(ahora) {
    if (!visible) { animacion = null; return; }
    const intervalo = reducirMovimiento() ? 400 : 140;
    if (ahora - ultimoNacimiento > intervalo && particulas.length < 60) {
      ultimoNacimiento = ahora;
      const { ancho, alto } = { ancho: lienzo.clientWidth, alto: lienzo.clientHeight };
      const recorrido = simularRecorrido();
      particulas.push({ recorrido, puntos: trayectoria(recorrido, geometria(ancho, alto)), nacimiento: ahora, contada: false });
    }
    dibujar(ahora);
    animacion = requestAnimationFrame(cuadro);
  }

  const textos = {
    z: "Un solo aparato: mitad arriba, mitad abajo. Nada en el medio: el spin está cuantizado.",
    zz: "Los que salieron ↑z vuelven a salir 100 % ↑z: la medición dejó el estado en |0⟩ (colapso).",
    zx: "Los ↑z pasan por un aparato x y se dividen 50/50: |0⟩ = (|+⟩ + |−⟩)/√2.",
    zxz: "Después de medir x, el tercer aparato z vuelve a dar 50/50: la medición en x borró la información de z.",
  };

  function reiniciar() {
    particulas = [];
    conteos = { arriba: 0, abajo: 0, bloqueadas: 0, total: 0 };
    explicacion.textContent = textos[preset.valor];
    pintarMetricas();
    if (!animacion && visible) animacion = requestAnimationFrame(cuadro);
  }

  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible && !animacion) animacion = requestAnimationFrame(cuadro);
  }).observe(contenedor);
  alCambiarAspecto(envoltura, () => { particulas = []; dibujar(); });
  reiniciar();
}
