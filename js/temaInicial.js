// Se ejecuta antes de pintar para que no parpadee el tema equivocado.
(function aplicarTemaGuardado() {
  try {
    var tema = localStorage.getItem("fiuba-tema");
    if (tema === "light" || tema === "dark") document.documentElement.setAttribute("data-theme", tema);
  } catch (error) { /* almacenamiento bloqueado: se usa el tema del sistema */ }
})();
