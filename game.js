// =======================
// JUEGO DE DECISIONES DE PRODUCTO
// Alineado al documento de acuerdos y visión. Solo HTML/CSS/JS, file://
// =======================

(function () {
  "use strict";

  var SCREENS = ["screen-intro", "screen-context", "screen-game", "screen-end"];
  var REQUIRED_IDS = [
    "screen-intro", "screen-context", "screen-game", "screen-end",
    "btn-intro-start", "btn-context-continue", "restart", "btn-end-play-again", "end-summary",
    "total", "idx", "cardTitle", "cardSituation", "options", "systemNote",
    "m_conversion", "m_support", "m_satisfaction", "m_revenue", "m_uxDebt",
    "main-card", "dashboard-chart", "jsError"
  ];

  function showError(msg) {
    var el = document.getElementById("jsError");
    if (el) {
      el.textContent = msg;
      el.classList.add("visible");
    } else {
      document.body.innerHTML = "<pre style='margin:20px;color:#991b1b;background:#fef2f2;padding:16px;'>" + String(msg).replace(/</g, "&lt;") + "</pre>";
    }
  }

  function getEl(id) {
    return document.getElementById(id) || null;
  }

  function requireElements() {
    var missing = [];
    for (var i = 0; i < REQUIRED_IDS.length; i++) {
      if (!document.getElementById(REQUIRED_IDS[i])) missing.push(REQUIRED_IDS[i]);
    }
    if (missing.length) {
      showError("Faltan elementos en el HTML con los siguientes IDs:\n" + missing.join(", "));
      return false;
    }
    return true;
  }

  function showScreen(screenId) {
    for (var s = 0; s < SCREENS.length; s++) {
      var el = getEl(SCREENS[s]);
      if (el) el.classList.add("hidden");
    }
    var target = getEl(screenId);
    if (target) target.classList.remove("hidden");
  }

  var state = {
    conversion: 0,
    support: 0,
    satisfaction: 0,
    revenue: 0,
    uxDebt: 0,
    index: 0,
    metricHistory: []
  };

  var metrics = ["conversion", "support", "satisfaction", "revenue", "uxDebt"];
  var metricLabels = { conversion: "Conversión", support: "Tickets", satisfaction: "Satisfacción", revenue: "Revenue", uxDebt: "Deuda UX" };

  var cards = [
    {
      title: "Onboarding complejo",
      situation: "El producto pide mucha información desde el inicio. Parte del abandono ocurre sin errores visibles.",
      options: [
        { text: "Optimizar visualmente el formulario", effect: { conversion: 1, uxDebt: 1 } },
        { text: "Reorganizar la información en pasos", effect: { conversion: 2, support: -1, satisfaction: 1, uxDebt: -1 } },
        { text: "Ajustar textos y ayudas", effect: { uxDebt: 1 } },
        { text: "No cambiar nada aún", effect: {} }
      ]
    },
    {
      title: "La gente llega, pero no avanza",
      situation: "Hay tráfico, pero la acción principal no se completa.",
      options: [
        { text: "Reducir pasos", effect: { conversion: 2, revenue: 1, uxDebt: 2 } },
        { text: "Dar más explicaciones", effect: { support: -1, uxDebt: 1 } },
        { text: "Simplificar decisiones", effect: { conversion: 1, satisfaction: 1, uxDebt: -1 } },
        { text: "Observar antes de intervenir", effect: {} }
      ]
    },
    {
      title: "Errores evitables",
      situation: "Usuarios fallan en campos que parecen simples.",
      options: [
        { text: "Explicar errores", effect: { support: -1, uxDebt: 1 } },
        { text: "Prevenir errores", effect: { conversion: 1, satisfaction: 1, uxDebt: -1 } },
        { text: "Bloquear avance", effect: { conversion: -1, satisfaction: -1, uxDebt: 1 } },
        { text: "Entender por qué fallan", effect: { uxDebt: -1 } }
      ]
    },
    {
      title: "Mobile incómodo",
      situation: "El flujo se siente pesado en pantallas chicas.",
      options: [
        { text: "Ocultar información", effect: { conversion: 1, uxDebt: 2 } },
        { text: "Repriorizar el flujo", effect: { conversion: 1, satisfaction: 1, uxDebt: -1 } },
        { text: "Mantener consistencia", effect: { satisfaction: -1, uxDebt: 1 } },
        { text: "Forzar desktop", effect: { conversion: -2, satisfaction: -2, uxDebt: 2 } }
      ]
    },
    {
      title: "Primer pico de soporte",
      situation: "Soporte empieza a recibir consultas frecuentes.",
      options: [
        { text: "Sección de ayuda visible", effect: { support: -1, uxDebt: 1 } },
        { text: "Ayudas contextuales", effect: { conversion: 1, satisfaction: 1, uxDebt: -1 } },
        { text: "Respuestas automáticas", effect: { satisfaction: -1, uxDebt: 1 } },
        { text: "Entender preguntas frecuentes", effect: { uxDebt: -1 } }
      ]
    }
  ];

  // Impacto con texto corto; color comunica estado (verde/rojo/ámbar apagados)
  function formatMetric(key, value) {
    if (value === 0) return "sin cambio";
    switch (key) {
      case "conversion": return value > 0 ? "la conversión mejora" : "la conversión baja";
      case "support": return value < 0 ? "menos tickets" : "los tickets aumentan";
      case "satisfaction": return value > 0 ? "mejor satisfacción" : "la satisfacción baja";
      case "revenue": return value > 0 ? "más revenue" : "menos revenue";
      case "uxDebt": return value > 0 ? "la fricción se acumula" : "menos fricción";
      default: return value > 0 ? "sube" : "baja";
    }
  }

  function getMetricClass(key, value) {
    if (value === 0) return "metric-neutral";
    if (key === "uxDebt") return value > 0 ? "metric-warning" : "metric-positive";
    if (key === "support") return value > 0 ? "metric-negative" : "metric-positive";
    return value > 0 ? "metric-positive" : "metric-negative";
  }

  function updateMetrics() {
    for (var i = 0; i < metrics.length; i++) {
      var m = metrics[i];
      var el = getEl("m_" + m);
      if (el) {
        el.textContent = formatMetric(m, state[m]);
        el.className = "font-medium text-right " + getMetricClass(m, state[m]);
      }
    }
  }

  // Mini dashboard: evolución acumulativa, tendencia sube/baja (doc §6)
  function renderDashboardChart() {
    var container = getEl("dashboard-chart");
    if (!container || !state.metricHistory.length) return;
    var h = state.metricHistory;
    var scores = [];
    for (var i = 0; i < h.length; i++) {
      var s = h[i];
      scores.push((s.conversion || 0) + (s.satisfaction || 0) + (s.revenue || 0) - (s.support || 0) - (s.uxDebt || 0));
    }
    if (scores.length === 1) scores.push(scores[0]);
    var min = scores[0], max = scores[0];
    for (var j = 1; j < scores.length; j++) {
      if (scores[j] < min) min = scores[j];
      if (scores[j] > max) max = scores[j];
    }
    var range = max - min || 1;
    var w = 160, height = 48, pad = 4;
    var points = [];
    for (var k = 0; k < scores.length; k++) {
      var x = pad + (k / (scores.length - 1 || 1)) * (w - 2 * pad);
      var y = height - pad - ((scores[k] - min) / range) * (height - 2 * pad);
      points.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    var path = "M" + points.join(" L");
    container.innerHTML = "<svg width=\"100%\" height=\"" + height + "\" viewBox=\"0 0 " + w + " " + height + "\" preserveAspectRatio=\"none\" class=\"text-stone-500\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"" + path + "\"/></svg>";
  }

  function playCardTransition(callback) {
    var cardEl = getEl("main-card");
    if (!cardEl) {
      if (callback) callback();
      return;
    }
    cardEl.classList.remove("entering", "show");
    cardEl.classList.add("entering");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cardEl.classList.add("show");
        setTimeout(function () {
          cardEl.classList.remove("entering", "show");
          if (callback) callback();
        }, 260);
      });
    });
  }

  function renderCard() {
    var totalEl = getEl("total");
    var cardTitleEl = getEl("cardTitle");
    var cardSituationEl = getEl("cardSituation");
    var optionsEl = getEl("options");
    var systemNoteEl = getEl("systemNote");
    var idxEl = getEl("idx");
    if (!totalEl || !cardTitleEl || !cardSituationEl || !optionsEl || !systemNoteEl || !idxEl) return;

    var total = cards.length;
    totalEl.textContent = total;
    idxEl.textContent = state.index + 1;

    if (state.index >= total) {
      showScreen("screen-end");
      renderEndSummary();
      return;
    }

    var card = cards[state.index];
    cardTitleEl.textContent = card.title;
    cardSituationEl.textContent = card.situation;
    optionsEl.innerHTML = "";
    systemNoteEl.textContent = "";

    for (var o = 0; o < card.options.length; o++) {
      var opt = card.options[o];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full rounded-lg border border-stone-300 bg-transparent py-2.5 px-4 text-left text-[0.9375rem] text-stone-700 transition hover:bg-stone-50 active:bg-stone-100";
      btn.textContent = opt.text;
      btn.onclick = (function (eff) {
        return function () { choose(eff); };
      })(opt.effect);
      optionsEl.appendChild(btn);
    }

    updateMetrics();
    renderDashboardChart();
  }

  function choose(effect) {
    var keys = Object.keys(effect);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (state.hasOwnProperty(key)) state[key] += effect[key];
    }
    state.metricHistory.push({
      conversion: state.conversion,
      support: state.support,
      satisfaction: state.satisfaction,
      revenue: state.revenue,
      uxDebt: state.uxDebt
    });
    state.index += 1;
    playCardTransition(renderCard);
  }

  function renderEndSummary() {
    var container = getEl("end-summary");
    if (!container) return;
    container.innerHTML = "";
    for (var i = 0; i < metrics.length; i++) {
      var m = metrics[i];
      var row = document.createElement("div");
      row.className = "flex justify-between gap-3";
      var valSpan = document.createElement("span");
      valSpan.className = "font-medium text-right " + getMetricClass(m, state[m]);
      valSpan.textContent = formatMetric(m, state[m]);
      row.innerHTML = "<span class=\"text-stone-500\">" + metricLabels[m] + "</span>";
      row.appendChild(valSpan);
      container.appendChild(row);
    }
  }

  function resetToIntro() {
    state = {
      conversion: 0,
      support: 0,
      satisfaction: 0,
      revenue: 0,
      uxDebt: 0,
      index: 0,
      metricHistory: []
    };
    showScreen("screen-intro");
  }

  function startLevel() {
    state.index = 0;
    state.conversion = 0;
    state.support = 0;
    state.satisfaction = 0;
    state.revenue = 0;
    state.uxDebt = 0;
    state.metricHistory = [{ conversion: 0, support: 0, satisfaction: 0, revenue: 0, uxDebt: 0 }];
    showScreen("screen-game");
    renderCard();
  }

  function bindButtons() {
    var btnIntro = getEl("btn-intro-start");
    if (btnIntro) btnIntro.onclick = function () { showScreen("screen-context"); };

    var btnContext = getEl("btn-context-continue");
    if (btnContext) btnContext.onclick = startLevel;

    var btnRestart = getEl("restart");
    if (btnRestart) btnRestart.onclick = resetToIntro;

    var btnPlayAgain = getEl("btn-end-play-again");
    if (btnPlayAgain) btnPlayAgain.onclick = resetToIntro;
  }

  function init() {
    if (!requireElements()) return;
    bindButtons();
    showScreen("screen-intro");
  }

  window.onerror = function (message, source, lineno, colno, error) {
    showError("Error en el juego:\n" + (message || "") + "\n" + (source || "") + " " + (lineno ? "Línea " + lineno : "") + (colno ? ":" + colno : "") + (error && error.stack ? "\n" + error.stack : ""));
    return true;
  };

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  } catch (e) {
    showError("Error al iniciar:\n" + (e && e.message ? e.message : String(e)) + (e && e.stack ? "\n" + e.stack : ""));
  }
})();
