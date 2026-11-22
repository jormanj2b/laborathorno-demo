/* Laborathorno — consentimiento de cookies. Autor: Jorman Bravo */
(function () {
  var KEY = "laborathorno-consent-v1";
  var MAP_SRC = "https://www.google.com/maps?q=10.4959375,-66.8474375&z=17&hl=es&output=embed";

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }
  function clearChoice() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function $(sel, rootEl) { return (rootEl || document).querySelector(sel); }

  function buildBanner() {
    if ($("#cookie-banner")) return $("#cookie-banner");
    var el = document.createElement("div");
    el.id = "cookie-banner";
    el.className = "cookie-banner";
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", "Aviso de cookies");
    el.hidden = true;
    el.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p>Usamos el almacenamiento local de tu navegador para guardar tu pedido y tu elección. Si aceptas, también cargamos el mapa de Google, que puede usar cookies de terceros.</p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-primary" data-consent="accepted">Aceptar</button>' +
          '<button type="button" class="btn btn-outline" data-consent="rejected">Rechazar</button>' +
          '<a class="cookie-policy-link" href="cookies.html">Ver política</a>' +
        "</div>" +
      "</div>";
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (!btn) return;
      acceptOrReject(btn.getAttribute("data-consent"));
    });
    return el;
  }

  function setBannerClass(on) {
    document.documentElement.classList.toggle("has-cookie-banner", !!on);
    document.body.classList.toggle("has-cookie-banner", !!on);
  }

  function showBanner() {
    var banner = buildBanner();
    banner.hidden = false;
    setBannerClass(true);
  }
  function hideBanner() {
    var banner = $("#cookie-banner");
    if (banner) banner.hidden = true;
    setBannerClass(false);
  }

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

  function acceptOrReject(value) {
    setChoice(value);
    apply();
  }

  function resetChoice() {
    clearChoice();
    unloadMap();
    showBanner();
    var banner = $("#cookie-banner");
    var first = banner && banner.querySelector("button, a");
    if (first) first.focus();
  }

  function apply() {
    var choice = getChoice();
    if (choice === "accepted") {
      hideBanner();
      loadMap();
    } else {
      unloadMap();
      if (choice) hideBanner();
      else showBanner();
    }
  }

  function onReady() {
    buildBanner();
    document.addEventListener("click", function (e) {
      var accept = e.target.closest("[data-accept-cookies]");
      if (accept) { acceptOrReject("accepted"); return; }
      var reset = e.target.closest("[data-reset-consent]");
      if (reset) { resetChoice(); }
    });
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();

  window.LaborathornoConsent = { get: getChoice, accept: function () { acceptOrReject("accepted"); }, reject: function () { acceptOrReject("rejected"); }, reset: resetChoice };
})();
