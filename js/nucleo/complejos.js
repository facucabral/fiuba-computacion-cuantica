/** Aritmética de números complejos { re, im } y formato TeX "como en el pizarrón". */

export const complejo = (re = 0, im = 0) => ({ re, im });
export const suma = (a, b) => complejo(a.re + b.re, a.im + b.im);
export const resta = (a, b) => complejo(a.re - b.re, a.im - b.im);
export const producto = (a, b) => complejo(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const escalar = (a, k) => complejo(a.re * k, a.im * k);
export const conjugado = (a) => complejo(a.re, -a.im);
export const moduloCuadrado = (a) => a.re * a.re + a.im * a.im;
export const modulo = (a) => Math.hypot(a.re, a.im);
export const fase = (a) => Math.atan2(a.im, a.re);
export const polar = (r, angulo) => complejo(r * Math.cos(angulo), r * Math.sin(angulo));
export const esCero = (a, tolerancia = 1e-9) => Math.abs(a.re) < tolerancia && Math.abs(a.im) < tolerancia;

const TOLERANCIA = 1e-7;
const mcd = (a, b) => (b === 0 ? Math.abs(a) : mcd(b, a % b));

/** Saca factores cuadrados: √n = k·√m. */
function simplificarRaiz(n) {
  let afuera = 1;
  let adentro = n;
  for (let f = 2; f * f <= adentro; f += 1) {
    while (adentro % (f * f) === 0) {
      afuera *= f;
      adentro /= f * f;
    }
  }
  return { afuera, adentro };
}

/**
 * Escribe un real positivo como fracción con raíces si su cuadrado es racional "chico":
 * 0.7071 → \frac{1}{\sqrt{2}},  0.9487 → \frac{3}{\sqrt{10}},  0.866 → \frac{\sqrt{3}}{2}.
 * Si no encuentra una forma exacta, devuelve el decimal.
 */
export function realATex(valorPositivo) {
  const cuadrado = valorPositivo * valorPositivo;
  for (let q = 1; q <= 200; q += 1) {
    const p = Math.round(cuadrado * q);
    if (p === 0 || Math.abs(cuadrado * q - p) > TOLERANCIA * q) continue;
    const divisor = mcd(p, q);
    const numerador = simplificarRaiz(p / divisor);
    const denominador = simplificarRaiz(q / divisor);
    // valor = (a√m) / (b√n)
    const arriba = numerador.adentro === 1 ? `${numerador.afuera}` : `${numerador.afuera === 1 ? "" : numerador.afuera}\\sqrt{${numerador.adentro}}`;
    const abajo = denominador.adentro === 1 ? `${denominador.afuera}` : `${denominador.afuera === 1 ? "" : denominador.afuera}\\sqrt{${denominador.adentro}}`;
    if (abajo === "1") return arriba;
    return `\\frac{${arriba}}{${abajo}}`;
  }
  return Number(valorPositivo.toFixed(4)).toString();
}

/** Coeficiente complejo en TeX con su signo. Devuelve { signo: "+"|"-", cuerpo } para armar sumas. */
export function complejoATex(valor) {
  const re = Math.abs(valor.re) < TOLERANCIA ? 0 : valor.re;
  const im = Math.abs(valor.im) < TOLERANCIA ? 0 : valor.im;
  if (im === 0) return { signo: re < 0 ? "-" : "+", cuerpo: realATex(Math.abs(re)) };
  if (re === 0) {
    const magnitud = realATex(Math.abs(im));
    return { signo: im < 0 ? "-" : "+", cuerpo: magnitud === "1" ? "i" : `${magnitud}\\,i` };
  }
  // Parte real e imaginaria juntas entre paréntesis: el signo va adentro.
  const partes = `${re < 0 ? "-" : ""}${realATex(Math.abs(re))} ${im < 0 ? "-" : "+"} ${realATex(Math.abs(im))}\\,i`;
  return { signo: "+", cuerpo: `\\left(${partes}\\right)`, sinSignoExterno: true };
}

/** Coeficiente suelto (para mostrar amplitudes individuales). */
export function coeficienteATex(valor) {
  const { signo, cuerpo, sinSignoExterno } = complejoATex(valor);
  if (sinSignoExterno) return cuerpo;
  return signo === "-" ? `-${cuerpo}` : cuerpo;
}

export const formatoDecimal = (valor, decimales = 3) => {
  const re = Number(valor.re.toFixed(decimales));
  const im = Number(valor.im.toFixed(decimales));
  if (im === 0) return `${re}`;
  if (re === 0) return `${im}i`;
  return `${re} ${im < 0 ? "−" : "+"} ${Math.abs(im)}i`;
};
