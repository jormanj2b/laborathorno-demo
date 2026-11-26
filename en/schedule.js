/* Hearth & Crumb — fechas y franjas de retiro (America/New_York). Autor: Jorman Bravo */
(function (root) {
  "use strict";

  var TZ = "America/New_York";
  var WINDOWS = [
    { id: "manana", label: "Morning (8 AM – 12 PM)", short: "Morning 8–12", start: 8 * 60, end: 12 * 60 },
    { id: "tarde", label: "Afternoon (12 PM – 4 PM)", short: "Afternoon 12–4", start: 12 * 60, end: 16 * 60 },
    { id: "noche", label: "Evening (4 PM – 8:30 PM)", short: "Evening 4–8:30", start: 16 * 60, end: 20 * 60 + 30 }
  ];
  var STORE_CLOSE = 20 * 60 + 30;

  function pad(n) { return String(n).padStart(2, "0"); }

  function tzParts(date) {
    var o = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", weekday: "short",
      hourCycle: "h23"
    }).formatToParts(date).forEach(function (p) {
      if (p.type !== "literal") o[p.type] = p.value;
    });
    return { year: +o.year, month: +o.month, day: +o.day, hour: +o.hour, minute: +o.minute, weekday: o.weekday };
  }

  function isoFromParts(p) { return p.year + "-" + pad(p.month) + "-" + pad(p.day); }
  function minutesOf(p) { return p.hour * 60 + p.minute; }

  // 16:00 UTC de una fecha ISO (mediodía EDT / 11:00 EST): siempre cae en el mismo día en Doral.
  function instantFromIso(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 16, 0, 0));
  }

  function addDaysIso(iso, n) { return isoFromParts(tzParts(new Date(instantFromIso(iso).getTime() + n * 86400000))); }

  function weekdayEs(dateOrIso) {
    var d = typeof dateOrIso === "string" ? instantFromIso(dateOrIso) : dateOrIso;
    return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(d);
  }

  function formatTimeEs(h, m) {
    m = m || 0;
    var suf = h < 12 ? "AM" : "PM";
    var h12 = h % 12; if (!h12) h12 = 12;
    return h12 + ":" + pad(m) + " " + suf;
  }

  function formatDateEs(iso) {
    var d = instantFromIso(iso);
    try {
      return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      var p = iso.split("-");
      return p[1] + "/" + p[2] + "/" + p[0];
    }
  }

  function leadMinHours(items, byId) {
    var max = 0, any = false;
    (items || []).forEach(function (it) {
      var p = byId ? byId[it.id] : it;
      if (!p) return;
      var h = p.minHours != null ? p.minHours : 24;
      if (!any || h > max) { max = h; any = true; }
    });
    return any ? max : 24;
  }

  function earliestReady(now, items, byId) {
    return new Date(now.getTime() + leadMinHours(items, byId) * 3600000);
  }

  function isWindowAllowed(iso, win, earliest) {
    var ep = tzParts(earliest);
    var earliestIso = isoFromParts(ep);
    if (iso < earliestIso) return false;
    if (iso > earliestIso) return true;
    var readyMin = minutesOf(ep);
    if (readyMin > STORE_CLOSE) return win.id === "noche";
    return win.end >= readyMin;
  }

  function windowsOn(iso, earliest) {
    return WINDOWS.map(function (w) {
      return { id: w.id, label: w.label, short: w.short, allowed: isWindowAllowed(iso, w, earliest) };
    });
  }

  function firstAvailable(now, items, byId) {
    var earliest = earliestReady(now, items, byId);
    var iso = isoFromParts(tzParts(earliest));
    var i, w, list;
    for (i = 0; i < 14; i++) {
      list = windowsOn(iso, earliest);
      for (w = 0; w < list.length; w++) {
        if (list[w].allowed) return { iso: iso, window: WINDOWS[w], earliest: earliest };
      }
      iso = addDaysIso(iso, 1);
    }
    return { iso: isoFromParts(tzParts(earliest)), window: WINDOWS[2], earliest: earliest };
  }

  function readyMessage(now, items, byId) {
    var first = firstAvailable(now, items, byId);
    var np = tzParts(now);
    var todayIso = isoFromParts(np);
    var nowIso = isoFromParts(np);
    var hechoDia = weekdayEs(now);
    var hechoHora = formatTimeEs(np.hour, np.minute);
    var hecho = (nowIso === todayIso ? "today, " : "on ") + hechoDia + " at " + hechoHora;
    var dayName = weekdayEs(first.iso);
    var dayNum = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(instantFromIso(first.iso));
    var phrase;
    if (first.window.id === "noche") {
      phrase = "ready " + dayName + ", " + dayNum + " between 4:00 and 8:30 PM, or " + weekdayEs(addDaysIso(first.iso, 1)) + " morning";
    } else if (first.window.id === "manana") {
      phrase = "ready " + dayName + ", " + dayNum + " in the morning (8 AM – 12 PM)";
    } else {
      phrase = "ready " + dayName + ", " + dayNum + " in the afternoon (12 PM – 4 PM)";
    }
    return "Ordered " + hecho + " → " + phrase;
  }

  function windowById(id) {
    var i;
    for (i = 0; i < WINDOWS.length; i++) if (WINDOWS[i].id === id) return WINDOWS[i];
    return null;
  }

  var api = {
    TZ: TZ,
    WINDOWS: WINDOWS,
    tzParts: tzParts,
    isoFromParts: isoFromParts,
    leadMinHours: leadMinHours,
    earliestReady: earliestReady,
    isWindowAllowed: isWindowAllowed,
    windowsOn: windowsOn,
    firstAvailable: firstAvailable,
    readyMessage: readyMessage,
    formatTimeEs: formatTimeEs,
    formatDateEs: formatDateEs,
    weekdayEs: weekdayEs,
    windowById: windowById,
    addDaysIso: addDaysIso
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LaborathornoSchedule = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
