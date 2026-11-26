/* Cookie notice · Jorman Bravo · no dependencies. English version.
   Three equal choices (Accept all, Reject all, Settings), categories, and nothing optional loads before consent.
   Usage: <script src="cookies.js" defer data-owner="Business" data-policy="cookies.html" data-key="my-site"></script>
   Scripts opcionales: <script type="text/plain" data-cookie-category="analitica" data-src="..."></script>
   API: window.CookieConsent.get() · .open() · .set({analitica, marketing}) · .onChange(fn) */
(function () {
  'use strict';
  var me = document.currentScript || document.querySelector('script[src*="cookies.js"]');
  var ds = (me && me.dataset) || {};
  var base = me ? me.src.replace(/cookies\.js(\?.*)?$/, '') : '';
  var KEY = 'ck-' + (ds.key || location.pathname.split('/')[1] || 'raiz');
  var VERSION = 1, MAX_AGE = 365 * 24 * 3600e3; // asks again after 12 months
  var POLICY = ds.policy || base + 'cookies.html';
  var OWNER = ds.owner || document.title.split(/[·|]/).pop().trim();
  var CATS = [
    { id: 'necesarias', name: 'Essential', desc: 'Keep the site working: they store your cookie choice and, where there is one, your cart or order in this browser. Always on.', locked: true },
    { id: 'analitica', name: 'Analytics', desc: ds.analytics || 'Would cover any analytics tool that needs cookies. We count visits with GoatCounter, which sets no cookies, so nothing here is in use right now.' },
    { id: 'marketing', name: ds.marketingName || 'Marketing', desc: ds.marketingEn || 'Third-party content or ads that may set their own cookies. We don’t use any right now.' }
  ];
  var listeners = [], banner = null, dlg = null, lastFocus = null;
  if (ds.accent) document.documentElement.style.setProperty('--ck-accent', ds.accent);

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === VERSION && Date.now() - Date.parse(c.date) < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function write(choice) {
    var c = { v: VERSION, date: new Date().toISOString(), necesarias: true, analitica: !!choice.analitica, marketing: !!choice.marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c); return c;
  }
  function apply(c) {
    document.documentElement.classList.remove('has-cookie-banner');
    // Loads the optional scripts the visitor allowed (once each)
    Array.prototype.forEach.call(document.querySelectorAll('script[type="text/plain"][data-cookie-category]'), function (s) {
      if (!c || !c[s.dataset.cookieCategory] || s.dataset.done) return;
      var n = document.createElement('script');
      if (s.dataset.src) n.src = s.dataset.src; else n.textContent = s.textContent;
      s.dataset.done = '1'; s.parentNode.insertBefore(n, s.nextSibling);
    });
    listeners.forEach(function (fn) { try { fn(c); } catch (e) {} });
    try { document.dispatchEvent(new CustomEvent('cookieconsent', { detail: c })); } catch (e) {}
  }

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { n.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return n;
  }
  function buttons(onConfig) {
    var acc = h('button', { type: 'button', 'class': 'ck-btn', text: 'Accept all' });
    var rej = h('button', { type: 'button', 'class': 'ck-btn', text: 'Reject all' });
    acc.addEventListener('click', function () { write({ analitica: true, marketing: true }); close(); });
    rej.addEventListener('click', function () { write({ analitica: false, marketing: false }); close(); });
    var kids = [acc, rej];
    if (onConfig) { var cfg = h('button', { type: 'button', 'class': 'ck-btn', text: 'Settings' }); cfg.addEventListener('click', onConfig); kids.push(cfg); }
    return h('div', { 'class': 'ck-actions' }, kids);
  }
  function buildBanner() {
    var policy = h('a', { href: POLICY, text: 'cookie policy' });
    banner = h('section', { 'class': 'ck-banner', role: 'region', 'aria-label': 'Cookie notice', id: 'ck-banner' }, [
      h('p', { 'class': 'ck-text' }, [h('strong', { text: 'Cookies. ' }), OWNER + ' only uses what the site needs to work. Optional cookies (analytics and marketing) turn on only if you accept them, and you can change your mind any time. Details in our ', policy, '.']),
      buttons(function () { openConfig(); })
    ]);
    banner.hidden = true;
    document.body.appendChild(banner);
  }
  function buildDialog() {
    var c = read() || { analitica: false, marketing: false };
    var title = h('h2', { id: 'ck-title', text: 'Cookie preferences' });
    var list = h('div', { 'class': 'ck-cats' });
    CATS.forEach(function (cat) {
      var id = 'ck-' + cat.id;
      var input = h('input', { type: 'checkbox', id: id, role: 'switch', 'aria-describedby': id + '-d' });
      input.checked = cat.locked ? true : !!c[cat.id]; if (cat.locked) input.disabled = true;
      list.appendChild(h('div', { 'class': 'ck-cat' }, [
        h('div', { 'class': 'ck-cat-head' }, [h('label', { 'for': id, text: cat.name + (cat.locked ? ' (always on)' : '') }), input]),
        h('p', { id: id + '-d', text: cat.desc })
      ]));
    });
    var save = h('button', { type: 'button', 'class': 'ck-btn', text: 'Save my choices' });
    save.addEventListener('click', function () { write({ analitica: dlg.querySelector('#ck-analitica').checked, marketing: dlg.querySelector('#ck-marketing').checked }); close(); });
    var x = h('button', { type: 'button', 'class': 'ck-x', 'aria-label': 'Close without changes', text: '×' });
    x.addEventListener('click', function () { dlg.close(); });
    var acts = buttons(null); acts.appendChild(save);
    dlg = h('dialog', { 'class': 'ck-dialog', 'aria-labelledby': 'ck-title' }, [x, title,
      h('p', { text: 'Choose what you allow. Essential cookies can’t be turned off because the site doesn’t work without them. Your choice is saved in this browser, with the date, for 12 months.' }),
      list, acts, h('p', { 'class': 'ck-small' }, [h('a', { href: POLICY, text: 'Read the cookie policy' })])]);
    dlg.addEventListener('close', function () { if (!read()) showBanner(); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
    document.body.appendChild(dlg);
  }
  function showBanner() { if (!banner) buildBanner(); banner.hidden = false; document.documentElement.classList.add('has-cookie-banner'); }
  function close() {
    if (banner) banner.hidden = true;
    if (dlg && dlg.open) dlg.close();
  }
  function openConfig() {
    lastFocus = document.activeElement;
    if (dlg) dlg.remove(); buildDialog();
    if (banner) banner.hidden = true;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    var first = dlg.querySelector('#ck-analitica'); if (first) first.focus();
  }

  // "Cookie preferences" link in the footer (unless the page already has one)
  function footerLink() {
    if (!document.querySelector('[data-cookie-prefs]')) {
      var foot = document.querySelector('footer') || document.querySelector('main');
      if (foot) {
        var p = h('p', { 'class': 'ck-foot' }, [h('button', { type: 'button', 'class': 'ck-link', 'data-cookie-prefs': '', text: 'Cookie preferences' })]);
        if (!document.querySelector('a[href$="cookies.html"]')) { p.appendChild(document.createTextNode(' · ')); p.appendChild(h('a', { href: POLICY, text: 'Cookie policy' })); }
        foot.appendChild(p);
      }
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-prefs], [data-reset-consent]');
      if (t) { e.preventDefault(); openConfig(); }
    });
  }

  window.CookieConsent = {
    get: read,
    open: openConfig,
    set: function (choice) { var c = read() || {}; return write({ analitica: 'analitica' in choice ? choice.analitica : c.analitica, marketing: 'marketing' in choice ? choice.marketing : c.marketing }); },
    onChange: function (fn) { listeners.push(fn); var c = read(); if (c) fn(c); }
  };

  function start() {
    footerLink();
    var c = read();
    if (c) apply(c);
    // The stylesheet is injected here so it doesn't block rendering. The notice shows once styled and is fixed, so content doesn't shift.
    var css = document.querySelector('link[href*="cookies.css"]');
    if (!css) {
      css = h('link', { rel: 'stylesheet', href: base + '../cookies.css?v=1' });
      if (!c) { css.addEventListener('load', showBanner); css.addEventListener('error', showBanner); }
      document.head.appendChild(css);
    } else if (!c) showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
