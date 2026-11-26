/* Laborathorno — catálogo y pedido por WhatsApp (JS vanilla, sin dependencias) */
(function () {
  "use strict";

  var WA_NUMBER = "584242015800";
  var STORE_KEY = "laborathorno-order-en-v1";
  var CATS = window.CATEGORIES || [];
  var PRODUCTS = window.PRODUCTS || [];
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var catName = {};
  CATS.forEach(function (c) { catName[c.id] = c.name; });

  // ---------- utilidades ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toFixed(2); }
  // Validación de campos: ayuda a quien escribe y evita datos raros. La protección de verdad es que
  // todo lo que escribe el usuario se muestra con textContent, nunca como HTML.
  var NAME_RE = /^\p{L}(?:[\p{L}\p{M}]|['’ -](?=\p{L}))*$/u;
  function clean(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cleanLong(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
  function nameMsg(v, min, max, empty) {
    if (!v) return empty;
    if (/[^\p{L}\p{M}\d '’-]/u.test(v)) return 'Use letters, spaces, apostrophes and hyphens only (no symbols like < > / ; =).';
    if (/\d/.test(v)) return 'Names can’t contain numbers.';
    if (!NAME_RE.test(v)) return 'Use letters, spaces, apostrophes and hyphens only.';
    if (v.length < min) return 'Enter at least ' + min + ' letters.';
    if (v.length > max) return max + ' characters max.';
    return '';
  }
  function phoneMsg(v, min, short) {
    if (/(?!^\+)\D/.test(v)) return 'Phone numbers use digits only (and + at the start for a country code).';
    var d = v.replace(/\D/g, '');
    if (d.length < min) return short;
    if (d.length > 15) return 'Too many digits. Check the number.';
    return '';
  }
  function textMsg(v, max) {
    if (/[<>]/.test(v)) return 'Please leave out the < and > characters.';
    if (max && v.length > max) return max + ' characters max.';
    return '';
  }
  function isCharMsg(m) { return /numbers|letters, spaces|digits only|only accepts|characters\./.test(m); }
  // Valida al escribir solo si hay un carácter no permitido (o si el campo ya estaba marcado), y siempre al salir del campo
  function live(input, rule, show) {
    input.addEventListener('input', function () { var m = rule(input.value); if (input.getAttribute('aria-invalid') === 'true' || isCharMsg(m)) show(m); });
    input.addEventListener('blur', function () { if (input.value) show(rule(input.value)); });
  }
  // Filtro al escribir o pegar: quita lo que no corresponde al tipo de campo y lo avisa.
  var FILTERS = {
    name: [/[^\p{L}\p{M} '’-]/gu, 'This field only accepts letters, spaces, apostrophes and hyphens.'],
    digits: [/\D/g, 'This field only accepts numbers.'],
    phone: [/(?!^\+)\D/g, 'Phone numbers only accept digits (and + at the start for a country code).'],
    user: [/[^A-Za-z0-9._-]/g, 'Usernames use plain letters, numbers, dots and hyphens only.'],
    text: [/[<>]/g, 'The < and > characters aren’t allowed.']
  };
  function filter(input, kind, show) {
    input.addEventListener('input', function () {
      var k = typeof kind === 'function' ? kind() : kind, f = FILTERS[k];
      if (!f) return;
      var v = input.value, c = v.replace(f[0], '');
      if (c === v) return;
      var pos = Math.max(0, (input.selectionStart || c.length) - (v.length - c.length));
      input.value = c;
      try { input.setSelectionRange(pos, pos); } catch (e) {}
      if (show) show(f[1]);
    });
  }
  // Campos type=number: bloquea e, E, +, -, punto y coma (el navegador sí los deja escribir)
  function digitsOnlyNumber(input) {
    input.addEventListener('keydown', function (e) { if (['e', 'E', '+', '-', '.', ','].indexOf(e.key) > -1) e.preventDefault(); });
    input.addEventListener('paste', function (e) { var t = (e.clipboardData || window.clipboardData).getData('text'); if (/\D/.test(t)) e.preventDefault(); });
  }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function waLink(text) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }
  function icon(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function unitPrice(p, size) {
    if (p.sizes && p.sizes.length) {
      var s = p.sizes.filter(function (x) { return x.label === size; })[0] || p.sizes[0];
      return s.price;
    }
    return p.price;
  }
  function clampQty(v, min) {
    v = parseInt(v, 10);
    if (isNaN(v) || v < min) v = min;
    if (v > 9999) v = 9999;
    return v;
  }
  function placeholder(p, small) {
    if (small) return '<svg aria-hidden="true"><use href="#seal"/></svg>';
    return '<div class="ph" role="img" aria-label="' + esc(p.name) + ' (photo coming soon)">' +
      '<svg aria-hidden="true"><use href="#seal"/></svg><span>' + esc(p.name) + '</span><small>Handmade</small></div>';
  }

  // ---------- enlaces de WhatsApp genéricos ----------
  $all("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); });
  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- estado del pedido ----------
  var state = { items: [], form: { name: "", date: "", window: "", delivery: "In-store pickup", notes: "" } };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && Array.isArray(saved.items)) {
      state.items = saved.items.filter(function (it) { return byId[it.id]; }).map(function (it) {
        it.qty = clampQty(it.qty, byId[it.id].min); return it;
      });
      if (saved.form) ["name", "date", "window", "delivery", "notes"].forEach(function (k) {
        if (typeof saved.form[k] === "string") state.form[k] = saved.form[k].slice(0, k === "notes" ? 300 : 80);
      });
    }
  } catch (e) { /* almacenamiento no disponible */ }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }

  function lineKey(id, size, option) { return [id, size || "", option || ""].join("|"); }
  function addItem(id, qty, size, option) {
    var key = lineKey(id, size, option);
    var found = state.items.filter(function (i) { return i.key === key; })[0];
    if (found) found.qty = clampQty(found.qty + qty, byId[id].min);
    else state.items.push({ key: key, id: id, qty: clampQty(qty, byId[id].min), size: size || "", option: option || "" });
    save(); renderCart(true);
  }
  function lineTotal(it) {
    var p = byId[it.id], u = unitPrice(p, it.size);
    return u == null ? 0 : u * it.qty;
  }
  function cartTotal() { return state.items.reduce(function (s, it) { return s + lineTotal(it); }, 0); }
  function cartCount() { return state.items.reduce(function (s, it) { return s + it.qty; }, 0); }
  function hasUnpriced() { return state.items.some(function (it) { return unitPrice(byId[it.id], it.size) == null; }); }
  var S = window.LaborathornoSchedule;
  function now() {
    if (window.Laborathorno && typeof window.Laborathorno._now === "function") return window.Laborathorno._now();
    return new Date();
  }

  // ---------- tiempo estimado de elaboración ----------
  // Toma el producto con el rango más largo (mayor maxHours; empate: mayor minHours)
  function leadOf(p) { return { min: p.minHours != null ? p.minHours : 24, max: p.maxHours != null ? p.maxHours : 48 }; }
  function orderLead(items) {
    var best = null;
    (items || state.items).forEach(function (it) {
      var p = byId[it.id]; if (!p) return;
      var l = leadOf(p);
      if (!best || l.max > best.max || (l.max === best.max && l.min > best.min)) best = { min: l.min, max: l.max, product: p };
    });
    return best;
  }
  function leadLabel(l) {
    if (!l) return "";
    if (l.max <= 24 && l.min === 0) return "under 24 hours (baked daily)";
    if (l.min === l.max) return l.max % 24 === 0 && l.max > 24 ? (l.max / 24) + " days" : l.max + " hours";
    if (l.min >= 48) return (l.min / 24) + "-" + Math.round(l.max / 24) + " days";
    return l.min + "–" + l.max + " hours";
  }

  // ---------- mensaje de WhatsApp ----------
  function formatDate(iso) {
    if (!iso) return "";
    if (S && S.formatDateEs) return S.formatDateEs(iso);
    var parts = iso.split("-");
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    try {
      return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return parts[1] + "/" + parts[2] + "/" + parts[0]; }
  }
  function buildMessage(items, form) {
    var lines = ["Hi Laborathorno! I’d like to place this order:", ""];
    items.forEach(function (it) {
      var p = byId[it.id]; if (!p) return;
      var u = unitPrice(p, it.size);
      var extra = [it.size, it.option].filter(Boolean).join(" · ");
      var name = p.name + (extra ? " (" + extra + ")" : "");
      if (u == null) lines.push("• " + it.qty + " × " + name + " — price on request");
      else lines.push("• " + it.qty + " × " + name + " — " + money(u) + " each = " + money(u * it.qty));
    });
    var total = items.reduce(function (s, it) { var p = byId[it.id]; var u = p && unitPrice(p, it.size); return s + (u == null ? 0 : u * it.qty); }, 0);
    lines.push("");
    lines.push("*Estimated total: " + money(total) + "*" + (items.some(function (it) { return byId[it.id] && unitPrice(byId[it.id], it.size) == null; }) ? " (+ items priced on request)" : ""));
    lines.push("");
    var est = orderLead(items);
    if (est) lines.push("Estimated prep time: " + leadLabel(est) + " (from confirmation)");
    if (form.name) lines.push("Name: " + form.name.trim());
    if (form.date) {
      var win = form.window && S ? S.windowById(form.window) : null;
      var dateLine = "Preferred date: " + formatDate(form.date) + (win ? ", " + win.label : "");
      if (est && S) {
        var first = S.firstAvailable(now(), items, byId);
        var tooSoon = form.date < first.iso || (form.date === first.iso && win && !S.isWindowAllowed(form.date, win, first.earliest));
        if (tooSoon) dateLine += " (sooner than the estimated prep time, please confirm)";
      }
      lines.push(dateLine);
    }
    if (form.delivery) lines.push("Delivery: " + form.delivery);
    if (form.notes && form.notes.trim()) lines.push("Notes: " + form.notes.trim());
    lines.push("");
    lines.push("Please confirm availability and how I can pay. Thank you!");
    return lines.join("\n");
  }
  function buildOrderUrl() { return waLink(buildMessage(state.items, state.form)); }
  // expuesto para pruebas
  window.Laborathorno = {
    buildMessage: buildMessage,
    orderLead: orderLead,
    leadLabel: leadLabel,
    buildOrderUrl: buildOrderUrl,
    state: state,
    waLink: waLink,
    schedule: S,
    now: now,
    setNow: function (d) {
      if (d == null) { this._now = null; return; }
      var dt = d instanceof Date ? d : new Date(d);
      this._now = function () { return new Date(dt.getTime()); };
    },
    firstAvailable: function (items) { return S.firstAvailable(now(), items || state.items, byId); },
    readyMessage: function (items) { return S.readyMessage(now(), items || state.items, byId); }
  };

  // ---------- catálogo ----------
  var grid = $("#product-grid"), tabsEl = $("[data-tabs]"), searchInput = $("#search-input");
  var info = $("#results-info"), empty = $("#empty-state");
  var emptyText = $("#empty-text"), emptyAll = $("#empty-all"), emptyClear = $("#empty-clear");
  var currentCat = "todos";
  var hasCatalog = !!(grid && tabsEl && searchInput && info && empty);

  function productHref(id) { return "catalog.html#producto-" + id; }
  function cardHTML(p) {
    var imgs = p.imgs || [];
    var heading = (grid && grid.id === "product-grid") ? "h2" : "h3";
    var media = imgs.length
      ? '<img src="' + esc(imgs[0].src) + '" alt="' + esc(imgs[0].alt || p.name) + '" loading="lazy" decoding="async" width="' + (imgs[0].w || 800) + '" height="' + (imgs[0].h || 600) + '">'
      : placeholder(p);
    var price = (p.sizes ? p.sizes[0].price : p.price);
    var priceHTML = price == null ? '<span class="price">Price on request</span>'
      : '<span class="price">' + money(price) + ' <small>/ ' + esc(p.unit) + "</small></span>";
    return '<article class="card" data-id="' + p.id + '">' +
      '<a class="card-link" href="' + productHref(p.id) + '" data-open-product="' + p.id + '">' +
      '<div class="card-media">' + media + (p.tag ? '<span class="card-tag">' + esc(p.tag) + "</span>" : "") + "</div>" +
      '<div class="card-body">' +
        '<p class="card-cat">' + esc(catName[p.cat] || "") + "</p>" +
        "<" + heading + ">" + esc(p.name) + "</" + heading + ">" +
        '<p class="card-desc">' + esc(p.desc || "") + "</p>" +
        '<div class="price-row">' + priceHTML + '<span class="min">Min. ' + p.min + "</span></div>" +
        '<span class="lead-badge">' + icon("ic-clock") + esc(p.lead) + "</span>" +
        '<span class="card-cta">View item ' + icon("ic-arrow") + "</span>" +
        '<p class="in-cart" data-in-cart' + (qtyInCart(p.id) ? "" : " hidden") + ">" + icon("ic-check") + "<span>En tu pedido: " + qtyInCart(p.id) + "</span></p>" +
      "</div></a></article>";
  }
  function addLabel(p, qty, size) {
    var u = unitPrice(p, size);
    return u == null ? "Add to order" : "Add · " + money(u * qty);
  }
  function qtyInCart(id) {
    return state.items.reduce(function (s, it) { return s + (it.id === id ? it.qty : 0); }, 0);
  }
  function refreshInCart() {
    $all("[data-in-cart]").forEach(function (el) {
      var host = el.closest("[data-id], [data-pm-body]");
      var id = (host && host.dataset.id) || (modalProduct && modalProduct.id);
      if (!id) return;
      var n = qtyInCart(id);
      el.hidden = !n;
      var span = $("span", el);
      if (span) span.textContent = "En tu pedido: " + n;
    });
  }
  function matches(p, q) {
    return !q || norm(p.name + " " + (p.desc || "") + " " + (catName[p.cat] || "") + " " + (p.options ? p.options.values.join(" ") : "")).indexOf(q) !== -1;
  }
  function renderTabs() {
    if (!tabsEl) return;
    var all = [{ id: "todos", name: "All" }].concat(CATS);
    tabsEl.innerHTML = all.map(function (c) {
      return '<button type="button" class="tab" data-cat="' + c.id + '" aria-pressed="' + (c.id === currentCat) + '">' + esc(c.name) + "</button>";
    }).join("");
  }
  function renderGrid() {
    if (!hasCatalog) return;
    var q = norm(searchInput.value.trim());
    var list = PRODUCTS.filter(function (p) {
      return (currentCat === "todos" || p.cat === currentCat) && matches(p, q);
    });
    grid.innerHTML = list.map(cardHTML).join("");
    empty.hidden = list.length > 0;
    if (!list.length) {
      var elsewhere = currentCat !== "todos" && q ? PRODUCTS.filter(function (p) { return matches(p, q); }).length : 0;
      var raw = searchInput.value.trim();
      emptyText.textContent = elsewhere
        ? "No results for “" + raw + "” in " + catName[currentCat] + ", but there are some in other categories."
        : q ? "We couldn’t find anything for “" + raw + "”." : "No items in this category yet.";
      emptyAll.hidden = !elsewhere;
      emptyAll.textContent = "See " + elsewhere + (elsewhere === 1 ? " result" : " results") + " across the whole catalog";
      emptyClear.hidden = !q;
    }
    info.textContent = list.length + (list.length === 1 ? " item" : " items") +
      (currentCat !== "todos" ? " in " + catName[currentCat] : "") + (q ? " for “" + searchInput.value.trim() + "”" : "");
  }
  function setCat(cat) {
    currentCat = cat || "todos";
    if (!tabsEl) return;
    $all(".tab", tabsEl).forEach(function (t) {
      var on = t.dataset.cat === currentCat;
      t.setAttribute("aria-pressed", String(on));
      if (on && t.scrollIntoView && tabsEl.scrollWidth > tabsEl.clientWidth) t.scrollIntoView({ block: "nearest", inline: "center" });
    });
    renderGrid();
  }

  if (hasCatalog) {
    emptyAll.addEventListener("click", function () { setCat("todos"); });
    emptyClear.addEventListener("click", function () { searchInput.value = ""; renderGrid(); searchInput.focus(); });
    tabsEl.addEventListener("click", function (e) {
      var t = e.target.closest(".tab"); if (t) setCat(t.dataset.cat);
    });
    var searchTimer;
    searchInput.addEventListener("input", function () { clearTimeout(searchTimer); searchTimer = setTimeout(renderGrid, 120); });
  }

  $all("[data-filter-link]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      setCat(a.getAttribute("data-filter-link"));
    });
  });

  // destacados en la página de inicio
  var featuredGrid = $("#featured-grid");
  var FEATURED_IDS = ["hogaza", "croissant", "brownies", "torta-navidena"];
  function renderFeatured() {
    if (!featuredGrid) return;
    var list = FEATURED_IDS.map(function (id) { return byId[id]; }).filter(Boolean);
    featuredGrid.innerHTML = list.map(cardHTML).join("");
  }

  // ---------- ficha de producto (modal) ----------
  var modal = $("#product-modal");
  var modalDialog = modal ? $(".product-modal", modal) : null;
  var modalMedia = $("[data-pm-media]");
  var modalBody = $("[data-pm-body]");
  var modalProduct = null;
  var lastFocus = null;

  function syncModalStepper() {
    if (!modalProduct || !modalBody) return;
    var input = $("input[data-pm-qty]", modalBody);
    if (!input) return;
    var v = clampQty(input.value, modalProduct.min);
    input.value = v;
    var minus = $('[data-step="-1"]', modalBody);
    if (minus) minus.disabled = v <= modalProduct.min;
    var size = $("[data-size]", modalBody);
    var label = $("[data-add-label]", modalBody);
    if (label) label.textContent = addLabel(modalProduct, v, size ? size.value : "");
  }
  function modalMediaHTML(p, index) {
    var imgs = p.imgs || [];
    var i = index || 0;
    if (!imgs.length) return placeholder(p);
    var im = imgs[i];
    var html = '<img src="' + esc(im.src) + '" alt="' + esc(im.alt || p.name) + '" width="' + (im.w || 800) + '" height="' + (im.h || 600) + '" data-main>';
    if (p.tag) html += '<span class="card-tag">' + esc(p.tag) + "</span>";
    var unique = [];
    imgs.forEach(function (img, n) {
      if (!unique.some(function (u) { return u.src === img.src; })) unique.push({ src: img.src, index: n });
    });
    if (unique.length > 1) {
      html += '<div class="pm-thumbs" role="group" aria-label="Photos of ' + esc(p.name) + '">' + unique.map(function (u) {
        return '<button type="button" data-photo="' + u.index + '" aria-label="Ver foto ' + (u.index + 1) + ' de ' + unique.length + '" aria-pressed="' + (u.index === i) + '">' +
          '<img src="' + esc(u.src) + '" alt="" width="56" height="56">' +
          "</button>";
      }).join("") + "</div>";
    }
    return html;
  }
  function modalBodyHTML(p) {
    var price = (p.sizes ? p.sizes[0].price : p.price);
    var priceHTML = price == null ? '<p class="pm-price">Price on request</p>'
      : '<p class="pm-price" data-price>' + money(price) + ' <small>/ ' + esc(p.unit) + "</small></p>";
    var sel = "";
    if (p.sizes) {
      sel += '<label class="opt-label" for="pm-size">Size</label><select id="pm-size" data-size>' +
        p.sizes.map(function (s) { return '<option value="' + esc(s.label) + '">' + esc(s.label) + " · " + money(s.price) + "</option>"; }).join("") + "</select>";
    }
    if (p.options) {
      sel += '<label class="opt-label" for="pm-opt">' + esc(p.options.label) + '</label><select id="pm-opt" data-option>' +
        p.options.values.map(function (v) { return '<option>' + esc(v) + "</option>"; }).join("") + "</select>";
    }
    return '<p class="pm-cat">' + esc(catName[p.cat] || "") + "</p>" +
      '<h2 id="pm-title">' + esc(p.name) + "</h2>" +
      '<p class="pm-desc">' + esc(p.desc || "") + "</p>" +
      priceHTML +
      '<div class="pm-meta">' +
        '<span class="min">Minimum: ' + p.min + (p.min === 1 ? " unit" : " units") + "</span>" +
        '<span class="lead-badge">' + icon("ic-clock") + esc(p.lead) + "</span>" +
      "</div>" +
      sel +
      '<div class="pm-actions">' +
        '<div class="stepper">' +
          '<button type="button" data-step="-1" aria-label="Remove one" disabled>' + icon("ic-minus") + "</button>" +
          '<input type="number" inputmode="numeric" min="' + p.min + '" step="1" value="' + p.min + '" data-pm-qty aria-label="Quantity (minimum ' + p.min + ')">' +
          '<button type="button" data-step="1" aria-label="Add one">' + icon("ic-plus") + "</button>" +
        "</div>" +
        '<button type="button" class="btn btn-primary add-btn" data-add>' + icon("ic-cart") + '<span data-add-label>' + addLabel(p, p.min, p.sizes ? p.sizes[0].label : "") + "</span></button>" +
        '<p class="in-cart" data-in-cart' + (qtyInCart(p.id) ? "" : " hidden") + ">" + icon("ic-check") + "<span>En tu pedido: " + qtyInCart(p.id) + "</span></p>" +
      "</div>";
  }
  function getFocusable(root) {
    return $all('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function openProduct(id, pushHash) {
    var p = byId[id];
    if (!p || !modal) {
      if (p && !modal) { location.href = productHref(id); }
      return;
    }
    modalProduct = p;
    if (modalBody) { modalBody.dataset.id = p.id; modalBody.innerHTML = modalBodyHTML(p); }
    if (modalMedia) modalMedia.innerHTML = modalMediaHTML(p, 0);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    lastFocus = document.activeElement;
    if (pushHash !== false) {
      if (history.replaceState) history.replaceState(null, "", "catalog.html#producto-" + p.id);
      else location.hash = "producto-" + p.id;
    }
    var closeBtn = $("[data-close-product]", modal);
    setTimeout(function () { (closeBtn || modalDialog).focus(); }, 0);
  }
  function closeProduct() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    modalProduct = null;
    if (location.hash.indexOf("producto-") !== -1 && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-close-product]")) { closeProduct(); return; }
      if (!modalProduct) return;
      var dot = e.target.closest("[data-photo]");
      if (dot && modalMedia) {
        modalMedia.innerHTML = modalMediaHTML(modalProduct, +dot.dataset.photo);
        return;
      }
      var step = e.target.closest("[data-step]");
      if (step) {
        var input = $("input[data-pm-qty]", modalBody);
        input.value = clampQty(+input.value + (+step.dataset.step), modalProduct.min);
        syncModalStepper();
        return;
      }
      var add = e.target.closest("[data-add]");
      if (add) {
        syncModalStepper();
        var qtyInput = $("input[data-pm-qty]", modalBody);
        var size = $("[data-size]", modalBody), opt = $("[data-option]", modalBody);
        addItem(modalProduct.id, +qtyInput.value, size ? size.value : "", opt ? opt.value : "");
        var label = $("[data-add-label]", add);
        add.classList.add("added"); label.textContent = "Added!";
        toast(qtyInput.value + " × " + modalProduct.name + " agregado a tu pedido");
        qtyInput.value = modalProduct.min;
        setTimeout(function () { add.classList.remove("added"); syncModalStepper(); }, 1400);
      }
    });
    modal.addEventListener("change", function (e) {
      if (!modalProduct) return;
      if (e.target.matches("input[data-pm-qty]")) {
        if (parseInt(e.target.value, 10) < modalProduct.min) toast("The minimum for " + modalProduct.name + " is " + modalProduct.min);
        syncModalStepper();
      }
      if (e.target.matches("[data-size]")) {
        var pr = $("[data-price]", modalBody);
        if (pr) pr.innerHTML = money(unitPrice(modalProduct, e.target.value)) + " <small>/ " + esc(modalProduct.unit) + "</small>";
        syncModalStepper();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeProduct(); return; }
      if (e.key === "Tab" && modalDialog) {
        var nodes = getFocusable(modalDialog);
        if (!nodes.length) return;
        var first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("[data-open-product]");
    if (!link) return;
    if (!modal) return; // en inicio navegamos a catalogo.html#producto-…
    e.preventDefault();
    openProduct(link.getAttribute("data-open-product"));
  });

  function applyDeepLink() {
    if (!hasCatalog && !modal) return;
    var params = new URLSearchParams(location.search);
    var cat = params.get("cat");
    if (cat) setCat(cat);
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash.indexOf("producto-") === 0) openProduct(hash.slice(9), false);
  }

  // temporadas anteriores
  var past = $("#past-season-list");
  if (past && window.PAST_SEASON) {
    past.innerHTML = window.PAST_SEASON.map(function (x) {
      return "<li><span>" + esc(x.name) + " <small>(" + esc(x.season) + ")</small></span><span>" + money(x.price) + " · " + esc(x.unit) + "</span></li>";
    }).join("");
  }

  // ---------- carrito ----------
  var drawer = $("#cart-drawer"), overlay = $(".drawer-overlay"), itemsEl = $("#cart-items");
  var emptyEl = $("#cart-empty"), form = $("#cart-form"), totalEl = $("#cart-total");
  var sendBtn = $("#send-order"), clearBtn = $("#clear-cart"), copyBtn = $("#copy-order"), mobileBar = $(".mobile-cart-bar");
  var fName = $("#f-name"), fDate = $("#f-date"), fWindow = $("#f-window"), fDelivery = $("#f-delivery"), fNotes = $("#f-notes");
  var fNameErr = $("#f-name-err"), dateHint = $("#f-date-hint"), dateWarn = $("#f-date-warn");
  var leadNotice = $("#lead-notice"), leadText = $("#lead-text"), leadSub = $("#lead-sub");

  fName.value = state.form.name || ""; fDate.value = state.form.date || "";
  if (fWindow) fWindow.value = state.form.window || "";
  fDelivery.value = state.form.delivery || "In-store pickup"; fNotes.value = state.form.notes || "";

  function fillWindows(iso, earliest, preferFirst) {
    if (!fWindow || !S) return;
    var list = S.windowsOn(iso, earliest);
    var current = state.form.window || fWindow.value;
    var html = '<option value="" disabled>Choose a time window</option>';
    list.forEach(function (w) {
      html += '<option value="' + w.id + '"' + (w.allowed ? "" : " disabled") + ">" + w.label + (w.allowed ? "" : " — unavailable") + "</option>";
    });
    fWindow.innerHTML = html;
    fWindow.disabled = false;
    var allowed = list.filter(function (w) { return w.allowed; }).map(function (w) { return w.id; });
    if (!preferFirst && current && allowed.indexOf(current) !== -1) fWindow.value = current;
    else fWindow.value = allowed[0] || "";
    state.form.window = fWindow.value;
  }

  function dateWindowValid() {
    var est = orderLead();
    if (!est || !S) return true;
    var first = S.firstAvailable(now(), state.items, byId);
    var v = fDate.value;
    var win = S.windowById(fWindow && fWindow.value);
    if (!v || v < first.iso) return false;
    if (!win || !S.isWindowAllowed(v, win, first.earliest)) return false;
    return true;
  }

  function updateDateRules() {
    var est = orderLead();
    leadNotice.hidden = !est;
    if (!est) {
      dateHint.textContent = "";
      dateWarn.hidden = true;
      fDate.removeAttribute("min");
      fDate.removeAttribute("aria-invalid");
      if (fWindow) { fWindow.innerHTML = '<option value="">Choose a time window</option>'; fWindow.disabled = true; fWindow.removeAttribute("aria-invalid"); }
      return;
    }
    var first = S.firstAvailable(now(), state.items, byId);
    var min = first.iso;
    fDate.min = min;
    var snapped = false;
    if (!fDate.value || fDate.value < min) {
      fDate.value = min;
      state.form.date = min;
      snapped = true;
    }
    fillWindows(fDate.value, first.earliest, snapped);
    leadText.textContent = S.readyMessage(now(), state.items, byId);
    leadSub.textContent = "Based on the item that takes longest (" + est.product.name + "). Pickup hours: every day, 8:00 AM – 8:30 PM. We confirm on WhatsApp.";
    dateHint.textContent = "Pick " + formatDate(min) + " or later, plus an open time window. Orders aren’t ready right away.";
    var v = fDate.value;
    var win = S.windowById(fWindow && fWindow.value);
    if (!v || v < min) {
      dateWarn.hidden = false; dateWarn.className = "field-warn is-error"; fDate.setAttribute("aria-invalid", "true");
      if (fWindow) fWindow.removeAttribute("aria-invalid");
      dateWarn.textContent = "That date is too soon: your order needs " + leadLabel(est) + ". The earliest date is " + formatDate(min) + ".";
    } else if (!win || !S.isWindowAllowed(v, win, first.earliest)) {
      dateWarn.hidden = false; dateWarn.className = "field-warn is-error";
      if (fWindow) fWindow.setAttribute("aria-invalid", "true");
      fDate.removeAttribute("aria-invalid");
      dateWarn.textContent = "Choose an open time window. On that date, windows before your order is ready aren’t available.";
    } else if (v < S.isoFromParts(S.tzParts(new Date(now().getTime() + est.max * 3600000)))) {
      dateWarn.hidden = false; dateWarn.className = "field-warn"; fDate.removeAttribute("aria-invalid");
      if (fWindow) fWindow.removeAttribute("aria-invalid");
      dateWarn.textContent = "That date works, pending confirmation on WhatsApp based on our baking schedule.";
    } else {
      dateWarn.hidden = true; fDate.removeAttribute("aria-invalid");
      if (fWindow) fWindow.removeAttribute("aria-invalid");
    }
  }


  if (window.Laborathorno) window.Laborathorno.updateDateRules = updateDateRules;

  function renderCart(bump) {
    var count = state.items.length; // productos distintos en el pedido
    $all("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      if (bump && el.classList.contains("cart-count")) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $all("[data-cart-total]").forEach(function (el) { el.textContent = money(cartTotal()); });
    mobileBar.hidden = state.items.length === 0;
    var has = state.items.length > 0;
    emptyEl.hidden = has; form.hidden = !has; sendBtn.disabled = !has; clearBtn.hidden = !has; copyBtn.hidden = !has;
    totalEl.textContent = money(cartTotal()) + (hasUnpriced() ? " + on request" : "");
    itemsEl.innerHTML = state.items.map(function (it) {
      var p = byId[it.id], u = unitPrice(p, it.size);
      var extra = [it.size, it.option].filter(Boolean).join(" · ");
      return '<li class="cart-item" data-key="' + esc(it.key) + '">' +
        '<div class="ci-thumb">' + (p.imgs && p.imgs.length ? '<img src="' + esc(p.imgs[0].src) + '" alt="" width="64" height="64" loading="lazy">' : placeholder(p, true)) + "</div>" +
        "<div>" +
          '<p class="ci-name">' + esc(p.name) + "</p>" +
          '<p class="ci-opt">' + (extra ? esc(extra) + " · " : "") + (u == null ? "Price on request" : money(u) + " each") + "</p>" +
          '<div class="ci-row">' +
            '<div class="stepper">' +
              '<button type="button" data-cstep="-1" aria-label="Remove one ' + esc(p.name) + '"' + (it.qty <= p.min ? " disabled" : "") + ">" + icon("ic-minus") + "</button>" +
              '<input type="number" inputmode="numeric" min="' + p.min + '" value="' + it.qty + '" aria-label="Quantity of ' + esc(p.name) + '">' +
              '<button type="button" data-cstep="1" aria-label="Add one more ' + esc(p.name) + '">' + icon("ic-plus") + "</button>" +
            "</div>" +
            '<span class="ci-total">' + (u == null ? "—" : money(u * it.qty)) + "</span>" +
            '<button type="button" class="ci-remove" data-remove aria-label="Remove ' + esc(p.name) + ' from order">' + icon("ic-trash") + "</button>" +
          "</div>" +
          (it.qty <= p.min ? '<p class="ci-min">Minimum quantity: ' + p.min + "</p>" : "") +
        "</div></li>";
    }).join("");
    updateDateRules();
    refreshInCart();
  }
  function findItem(li) { var k = li.dataset.key; return state.items.filter(function (i) { return i.key === k; })[0]; }
  itemsEl.addEventListener("click", function (e) {
    var li = e.target.closest(".cart-item"); if (!li) return;
    var it = findItem(li), p = byId[it.id];
    var st = e.target.closest("[data-cstep]");
    if (st) {
      it.qty = clampQty(it.qty + (+st.dataset.cstep), p.min); save(); renderCart();
      var again = itemsEl.querySelector('[data-key="' + CSS.escape(it.key) + '"] [data-cstep="' + st.dataset.cstep + '"]');
      if (again && !again.disabled) again.focus(); else { var inp = itemsEl.querySelector('[data-key="' + CSS.escape(it.key) + '"] input'); if (inp) inp.focus(); }
      return;
    }
    if (e.target.closest("[data-remove]")) {
      state.items = state.items.filter(function (i) { return i !== it; }); save(); renderCart();
      toast(p.name + " removed from your order");
      var first = itemsEl.querySelector("[data-remove]"); (first || $("[data-close-cart]", drawer)).focus();
    }
  });
  itemsEl.addEventListener("change", function (e) {
    if (!e.target.matches("input")) return;
    var li = e.target.closest(".cart-item"), it = findItem(li), p = byId[it.id];
    if (parseInt(e.target.value, 10) < p.min) toast("The minimum for " + p.name + " is " + p.min);
    it.qty = clampQty(e.target.value, p.min); save(); renderCart();
  });
  // Nombre: solo letras, espacios, apóstrofes y guiones. Notas: sin < >.
  var nameRule = function (v) { return nameMsg(clean(v), 2, 60, "Enter your name to send the order."); };
  var notesRule = function (v) { return textMsg(cleanLong(v), 300); };
  var fNotesErr = null;
  if (fNotes) {
    fNotesErr = document.createElement("p"); fNotesErr.className = "field-error"; fNotesErr.id = "f-notes-err"; fNotesErr.hidden = true;
    fNotesErr.setAttribute("aria-live", "polite"); fNotes.insertAdjacentElement("afterend", fNotesErr);
  }
  function showField(input, errEl, msg) {
    errEl.textContent = msg; errEl.hidden = !msg;
    if (msg) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", errEl.id); } else input.removeAttribute("aria-invalid");
    return !msg;
  }
  if (fName) live(fName, nameRule, function (m) { showField(fName, fNameErr, m); });
  if (fNotes) live(fNotes, notesRule, function (m) { showField(fNotes, fNotesErr, m); });
  if (fName) filter(fName, "name", function (m) { showField(fName, fNameErr, m); });
  if (fNotes) filter(fNotes, "text", function (m) { showField(fNotes, fNotesErr, m); });
  // Cantidades (type=number del carrito y de la ficha): solo dígitos
  document.addEventListener("keydown", function (e) { if (e.target.matches && e.target.matches('input[type="number"]') && ["e", "E", "+", "-", ".", ","].indexOf(e.key) > -1) e.preventDefault(); });
  document.addEventListener("paste", function (e) { if (e.target.matches && e.target.matches('input[type="number"]') && /\D/.test((e.clipboardData || window.clipboardData).getData("text"))) e.preventDefault(); });
  [fName, fDate, fWindow, fDelivery, fNotes].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", function () {
      state.form[el.name] = el.value; save();
      if (el === fDate || el === fWindow) updateDateRules();
    });
    if (el === fDate || el === fWindow) {
      el.addEventListener("change", function () {
        state.form[el.name] = el.value; save();
        updateDateRules();
      });
    }
  });
  copyBtn.addEventListener("click", function () {
    var text = buildMessage(state.items, state.form);
    function done() { toast("Order copied. Paste it into a WhatsApp message."); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.className = "visually-hidden"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Couldn’t copy. Send the order on WhatsApp instead."); }
      document.body.removeChild(ta);
    }
  });
  clearBtn.addEventListener("click", function () {
    if (!confirm("Clear your whole order?")) return;
    state.items = []; save(); renderCart(); toast("Order cleared");
  });
  sendBtn.addEventListener("click", function () {
    if (!state.items.length) return;
    fName.value = clean(fName.value);
    if (fNotes) { fNotes.value = cleanLong(fNotes.value); state.form.notes = fNotes.value; }
    if (!showField(fName, fNameErr, nameRule(fName.value))) { fName.focus(); return; }
    if (fNotes && !showField(fNotes, fNotesErr, notesRule(fNotes.value))) { fNotes.focus(); return; }
    updateDateRules();
    if (!dateWindowValid()) {
      updateDateRules();
      if (fDate && fDate.getAttribute("aria-invalid") === "true") fDate.focus();
      else if (fWindow) fWindow.focus();
      return;
    }
    state.form.name = fName.value;
    state.form.date = fDate.value;
    if (fWindow) state.form.window = fWindow.value;
    save();
    var url = buildOrderUrl();
    // En móviles y navegadores internos (Instagram, Facebook, TikTok) window.open puede bloquearse:
    // navegar en la misma pestaña abre la app de WhatsApp de forma fiable. El pedido queda guardado.
    var ua = navigator.userAgent || "";
    if (/Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Line\/|Android|iPhone|iPad|iPod/i.test(ua)) { window.location.href = url; return; }
    // Ojo: con "noopener" window.open siempre devuelve null; se abre sin él y se corta el opener a mano.
    var win = window.open(url, "_blank");
    if (win) { try { win.opener = null; } catch (e) {} } else { window.location.href = url; }
  });

  // abrir/cerrar drawer con foco atrapado
  var lastFocus = null;
  var bgEls = $all("body > header, body > main, body > footer, .mobile-cart-bar, .wa-float, .skip-link");
  function setInert(on) { bgEls.forEach(function (el) { if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert"); }); }
  function setExpanded(v) { $all("[data-open-cart]").forEach(function (b) { b.setAttribute("aria-expanded", String(v)); }); }
  function openCart() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    if (toastEl) toastEl.classList.remove("show");
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    setInert(true);
    document.body.classList.add("drawer-open"); setExpanded(true);
    setTimeout(function () { $("[data-close-cart]", drawer).focus(); }, 50);
  }
  function closeCart() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
    setInert(false);
    overlay.classList.remove("show");
    setTimeout(function () { overlay.hidden = true; }, 300);
    document.body.classList.remove("drawer-open"); setExpanded(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $all("[data-open-cart]").forEach(function (b) { b.addEventListener("click", openCart); });
  $all("[data-close-cart]").forEach(function (b) { b.addEventListener("click", closeCart); });
  document.addEventListener("keydown", function (e) {
    if (!drawer.classList.contains("open")) {
      if (e.key === "Escape" && nav.classList.contains("open")) toggleNav(false);
      return;
    }
    if (e.key === "Escape") { closeCart(); return; }
    if (e.key === "Tab") {
      var f = $all('button:not([disabled]):not([hidden]), a[href], input, select, textarea', drawer).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- menú móvil ----------
  var nav = $("#main-nav"), menuBtn = $(".menu-btn");
  function toggleNav(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { toggleNav(!nav.classList.contains("open")); });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) toggleNav(false);
  });
  $all("a", nav).forEach(function (a) { a.addEventListener("click", function () { toggleNav(false); }); });

  // header con sombra al hacer scroll
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- toast ----------
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // init
  renderFeatured(); renderTabs(); renderGrid(); applyDeepLink(); renderCart();
})();

/* Logo: volver siempre al inicio exacto de la página */
document.querySelectorAll('a[href="#top"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
  });
});
