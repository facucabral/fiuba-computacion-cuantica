/**
 * Verifica el simulador contra las resoluciones publicadas en la guía (parciales y autoevaluaciones).
 * Ejecutar: node --test pruebas/
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { EstadoCuantico, compuertas, estadosNotables } from "../js/nucleo/estadoCuantico.js";
import { complejo } from "../js/nucleo/complejos.js";

const { H, X, Y, Z } = compuertas;
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("Bell: H y CNOT sobre |00⟩ da (|00⟩+|11⟩)/√2", () => {
  const estado = new EstadoCuantico(2).aplicar(H, 1).aplicar(X, 2, [1]);
  assert.equal(estado.aTex(), "\\frac{1}{\\sqrt{2}}\\left(|00\\rangle + |11\\rangle\\right)");
  assert.equal(estado.esSeparable(), false);
});

test("Parcial 11/06/2026, ej. 1: Ψa = (−|00⟩ + 3|11⟩)/√10 y p₂(1) = 9/10", () => {
  const q1 = [complejo(1 / Math.sqrt(5)), complejo(-2 / Math.sqrt(5))];
  const estado = EstadoCuantico.desdeQubits([q1, estadosNotables["1"]]);
  estado.aplicar(H, 1).aplicar(X, 2).aplicar(X, 2, [1]).intercambiar(1, 2);
  assert.equal(estado.aTex(), "-\\frac{1}{\\sqrt{10}}|00\\rangle + \\frac{3}{\\sqrt{10}}|11\\rangle");
  cerca(estado.probabilidadDeQubit(2, 1), 0.9);
  assert.equal(estado.proyectarQubit(2, 1).posterior.aTex(), "|11\\rangle");
});

test("Parcial 11/06/2026, ej. 5: Ψb = ½(|001⟩ + |010⟩ − |101⟩ + |110⟩)", () => {
  const estado = EstadoCuantico.desdeEtiqueta("101");
  estado.aplicar(H, 1).aplicar(X, 2, [1]).aplicar(H, 2).aplicar(X, 3, [2]);
  assert.equal(estado.aTex(), "\\frac{1}{2}\\left(|001\\rangle + |010\\rangle - |101\\rangle + |110\\rangle\\right)");
  cerca(estado.probabilidadDeQubit(2, 0), 0.5);
  const posterior = estado.proyectarQubit(2, 0).posterior;
  assert.equal(posterior.aTex(), "\\frac{1}{\\sqrt{2}}\\left(|001\\rangle - |101\\rangle\\right)");
  posterior.aplicar(X, 1).aplicar(Y, 2).aplicar(Z, 3);
  assert.equal(posterior.aTex(), "\\frac{1}{\\sqrt{2}}\\left(i|011\\rangle - i|111\\rangle\\right)");
});

test("Recuperatorio 2024 y 2026, ej. 5: entrada |10⟩ termina en i/√2(|11⟩ − |10⟩) y es separable", () => {
  const estado = EstadoCuantico.desdeEtiqueta("10");
  estado.aplicar(X, 2, [1]).aplicar(H, 1).aplicar(X, 2).intercambiar(1, 2).aplicar(Y, 1).aplicar(X, 2);
  assert.equal(estado.aTex(), "\\frac{1}{\\sqrt{2}}\\left(-i|10\\rangle + i|11\\rangle\\right)");
  cerca(estado.probabilidades()[parseInt("11", 2)], 0.5);
  assert.equal(estado.esSeparable(), true);
});

test("Recuperatorio 2024, ej. 1 con α=0.6, β=0.8: P(10) = |α−β|²/2", () => {
  const alfa = 0.6;
  const beta = 0.8;
  const estado = EstadoCuantico.desdeQubits([[complejo(alfa), complejo(beta)], estadosNotables["0"]]);
  estado.aplicar(H, 1).aplicar(X, 2).aplicar(X, 2, [1]).aplicar(Z, 2);
  cerca(estado.probabilidades()[parseInt("10", 2)], (alfa - beta) ** 2 / 2);
  cerca(estado.probabilidades()[parseInt("01", 2)], (alfa + beta) ** 2 / 2);
});

test("Autoevaluación 4: Toffoli después de H⊗H⊗H da (|001⟩ + |110⟩)/√2", () => {
  const bell = EstadoCuantico.desdeQubits([estadosNotables["0"], estadosNotables["0"]]).aplicar(H, 1).aplicar(X, 2, [1]);
  const estado = new EstadoCuantico(3, [...bell.amplitudes.flatMap((a) => [complejo(a.re / Math.SQRT2), complejo(-a.re / Math.SQRT2)])]);
  estado.aplicar(H, 1).aplicar(H, 2).aplicar(H, 3).aplicar(X, 3, [1, 2]);
  assert.equal(estado.aTex(), "\\frac{1}{\\sqrt{2}}\\left(|001\\rangle + |110\\rangle\\right)");
});

test("Born con complejos: ⟨ψ|ψ⟩ = 1 conjugando el bra", () => {
  const estado = new EstadoCuantico(1, [complejo(3 / 5), complejo(0, 4 / 5)]);
  cerca(estado.productoInterno(estado).re, 1);
  cerca(estado.productoInterno(estado).im, 0);
});
