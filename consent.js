/* Laborathorno — mapa de Google solo con permiso de "Marketing y contenido de terceros". El aviso lo pone cookies.js. Autor: Jorman Bravo */
(function () {
  var MAP_SRC = "https://www.google.com/maps?q=10.4959375,-66.8474375&z=17&hl=es&output=embed";
  function $(sel, rootEl) { return (rootEl || document).querySelector(sel); }
  function loadMap() {
    var wrap = $("#map-wrap");
    if (!wrap || wrap.querySelector("iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.title = "Mapa de la ubicación de Laborathorno en Chacao, Caracas";
    iframe.src = MAP_SRC;
    iframe.loading = "lazy";
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    iframe.allowFullscreen = true;
    wrap.appendChild(iframe);
    wrap.classList.add("is-live");
  }
  function unloadMap() {
    var wrap = $("#map-wrap");
    if (!wrap) return;
    var iframe = wrap.querySelector("iframe");
    if (iframe) iframe.remove();
    wrap.classList.remove("is-live");
  }
  function onReady() {
    var CC = window.CookieConsent;
    if (!CC) return;
    CC.onChange(function (c) { if (c && c.marketing) loadMap(); else unloadMap(); });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-accept-cookies]")) CC.set({ marketing: true });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
