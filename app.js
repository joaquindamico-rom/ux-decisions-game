/**
 * Render UI y eventos. Componentes que devuelven HTML en string.
 * Depende de: window.CARDS, window.GameState
 */
(function () {
  "use strict";

  var CARDS = typeof window !== "undefined" && window.CARDS ? window.CARDS : [];
  var GameState = typeof window !== "undefined" && window.GameState ? window.GameState : null;
  var DEBUG = typeof window !== "undefined" && window.DEBUG_GAME === true;

  var METRIC_LABELS = { conversion: "Conversión", support: "Tickets", satisfaction: "Satisfacción", revenue: "Salud del negocio", uxDebt: "Deuda UX" };

  /** Rangos para semáforo: verde estricto para que sea difícil terminar todo en verde */
  var SEMAPHORE = {
    conversion: { greenMin: 6, yellowMin: 3 },
    support: { greenMax: -3, yellowMax: 0 },
    satisfaction: { greenMin: 5, yellowMin: 2 },
    revenue: { greenMin: 4, yellowMin: 1 },
    uxDebt: { greenMax: -1, yellowMax: 2 }
  };

  function getSemaphoreState(key, value) {
    var s = SEMAPHORE[key];
    if (!s) return "yellow";
    if (s.greenMin !== undefined) {
      if (value >= s.greenMin) return "green";
      if (value >= s.yellowMin) return "yellow";
      return "red";
    }
    if (s.greenMax !== undefined) {
      if (value <= s.greenMax) return "green";
      if (value <= s.yellowMax) return "yellow";
      return "red";
    }
    return "yellow";
  }

  function getBarFillPct(key, value) {
    var ranges = { conversion: [-4, 10], support: [-4, 8], satisfaction: [-4, 8], revenue: [-4, 8], uxDebt: [-2, 10] };
    var r = ranges[key];
    if (!r) return 50;
    var min = r[0], max = r[1];
    var v = Math.max(min, Math.min(max, value));
    if (key === "support" || key === "uxDebt") {
      return ((max - v) / (max - min)) * 100;
    }
    return ((v - min) / (max - min)) * 100;
  }

  function getPillLabel(sem) {
    if (sem === "green") return "Bien";
    if (sem === "yellow") return "Riesgo";
    return "Crítico";
  }

  function escapeHtml(str) {
    if (str == null) return "";
    var s = String(str);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatMetricValue(key, value) {
    if (value === 0) return "0";
    var sign = value > 0 ? "+" : "";
    if (key === "conversion") return sign + value + " pts";
    if (key === "support") return sign + value + " tickets/sem";
    if (key === "satisfaction") return sign + value + " pts";
    if (key === "revenue") return sign + value + " pts";
    if (key === "uxDebt") return sign + value + " pts";
    return sign + value;
  }

  function formatDeltaShort(key, value) {
    if (value === 0) return "";
    var sign = value > 0 ? "+" : "";
    if (key === "conversion") return sign + value + " pts";
    if (key === "support") return sign + value + " tickets/sem";
    if (key === "satisfaction") return sign + value + " pts";
    if (key === "revenue") return sign + value + " pts";
    if (key === "uxDebt") return sign + value + " pts";
    return sign + value;
  }

  function formatDeltaForResult(delta) {
    if (!delta || typeof delta !== "object") return "";
    var parts = [];
    var keys = ["conversion", "support", "satisfaction", "revenue", "uxDebt"];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (delta[k] !== undefined && delta[k] !== 0) {
        parts.push(METRIC_LABELS[k] + " " + formatDeltaShort(k, delta[k]));
      }
    }
    return parts.join(" · ");
  }

  function getMetricClass(key, value) {
    if (value === 0) return "metric-neutral";
    if (key === "uxDebt") return value > 0 ? "metric-warning" : "metric-positive";
    if (key === "support") return value > 0 ? "metric-negative" : "metric-positive";
    return value > 0 ? "metric-positive" : "metric-negative";
  }

  function sparkline(metricKey, values) {
    if (!values || values.length === 0) return "";
    values = values.slice(-6);
    if (values.length === 1) values = [values[0], values[0]];
    var min = values[0], max = values[0];
    for (var i = 1; i < values.length; i++) {
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
    }
    var range = max - min || 1;
    var w = 120, h = 28, pad = 2;
    var points = [];
    for (var j = 0; j < values.length; j++) {
      var x = pad + (j / (values.length - 1 || 1)) * (w - 2 * pad);
      var y = h - pad - ((values[j] - min) / range) * (h - 2 * pad);
      points.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    var path = "M" + points.join(" L");
    return "<svg class=\"sparkline\" width=\"100%\" height=\"" + h + "\" viewBox=\"0 0 " + w + " " + h + "\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"" + escapeHtml(path) + "\"/></svg>";
  }

  function introScreen() {
    return (
      "<section id=\"screen-intro\" class=\"screen screen-intro\">" +
        "<div class=\"screen-inner intro-board\">" +
          "<div class=\"intro-card\">" +
            "<span class=\"intro-badge\" aria-hidden=\"true\">Nivel 1</span>" +
            "<h1 class=\"intro-title\">Decisiones de Producto</h1>" +
            "<p class=\"intro-subtitle\">Un juego para aprender a mejorar UX sin ser diseñador.</p>" +
            "<ul class=\"intro-bullets\">" +
              "<li>Tomás decisiones como persona de producto.</li>" +
              "<li>Cada opción impacta en métricas reales: conversión, tickets, satisfacción, salud del negocio y deuda UX.</li>" +
              "<li>No hay respuestas correctas; hay consecuencias acumuladas.</li>" +
            "</ul>" +
            "<div class=\"intro-preview\" aria-hidden=\"true\">" +
              "<div class=\"preview-card preview-carta\">" +
                "<div class=\"preview-line\"></div><div class=\"preview-line w-4-5\"></div><div class=\"preview-line w-half\"></div>" +
              "</div>" +
              "<div class=\"preview-chart preview-tablero\" aria-hidden=\"true\">" +
                "<svg viewBox=\"0 0 100 50\" preserveAspectRatio=\"none\"><polyline fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" points=\"0,5 20,18 40,12 60,28 80,22 100,42\"/></svg>" +
              "</div>" +
            "</div>" +
            "<button type=\"button\" id=\"btn-intro-start\" class=\"btn btn-primary intro-cta\">Empezar</button>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function contextScreen() {
    return (
      "<section id=\"screen-context\" class=\"screen screen-context\">" +
        "<div class=\"screen-inner intro-board\">" +
          "<div class=\"intro-card\">" +
            "<span class=\"intro-badge\" aria-hidden=\"true\">Nivel 1</span>" +
            "<h2 class=\"intro-title\">Nivel 1 — Problemas visibles</h2>" +
            "<p class=\"intro-subtitle context-text\">Cada carta describe un problema típico de producto. Elegí una opción y verás cómo impactan en conversión, tickets, satisfacción, salud del negocio y deuda UX. La deuda UX al final de cada turno genera un efecto en las demás métricas.</p>" +
            "<button type=\"button\" id=\"btn-context-continue\" class=\"btn btn-primary intro-cta\">Continuar</button>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function metricRow(metricKey, value, recentChangeStr, isAffected) {
    var label = METRIC_LABELS[metricKey] || metricKey;
    var valStr = formatMetricValue(metricKey, value);
    var sem = getSemaphoreState(metricKey, value);
    var pulseCls = isAffected ? " metric-pulse" : "";
    var barPct = getBarFillPct(metricKey, value).toFixed(0);
    var barMin = Math.max(0, parseInt(barPct, 10));
    if (barMin === 0 && value !== 0) barMin = 4;
    var pillText = getPillLabel(sem);
    var changeHtml = recentChangeStr ? "<span class=\"metric-change\">" + escapeHtml(recentChangeStr) + "</span>" : "";
    return (
      "<div class=\"metric-row sem-" + sem + pulseCls + "\" data-metric=\"" + escapeHtml(metricKey) + "\">" +
        "<div class=\"metric-header\">" +
          "<span class=\"metric-label\">" + escapeHtml(label) + "</span>" +
          "<span class=\"metric-value\">" + escapeHtml(valStr) + "</span>" +
          "<span class=\"status-pill sem-" + sem + "\">" + escapeHtml(pillText) + "</span>" +
        "</div>" +
        (changeHtml ? "<div class=\"metric-recent\">" + changeHtml + "</div>" : "") +
        "<div class=\"metric-bar\" role=\"presentation\"><span class=\"metric-bar-fill\" style=\"width:" + barMin + "%\"></span></div>" +
      "</div>"
    );
  }

  function gameScreen() {
    if (!GameState || !CARDS.length) return "<section id=\"screen-game\" class=\"screen\"><p>Error: faltan datos.</p></section>";
    var st = GameState.getState();
    var metrics = GameState.getMetrics();
    var history = GameState.getHistory();
    var lastResult = GameState.getLastResult();
    var cardIndex = st.cardIndex;
    var total = CARDS.length;

    if (cardIndex >= total) {
      GameState.setScreen("end");
      return endScreen();
    }

    var card = CARDS[cardIndex];
    var optionsHtml = "";
    for (var o = 0; o < card.options.length; o++) {
      var opt = card.options[o];
      var costStr = (opt.cost != null && opt.cost !== "") ? "<span class=\"option-cost\">" + escapeHtml(opt.cost) + "</span>" : "";
      optionsHtml += "<button type=\"button\" class=\"btn btn-option\" data-option-index=\"" + o + "\"><span class=\"option-label\">" + escapeHtml(opt.label) + "</span>" + costStr + "</button>";
    }

    var researchState = GameState.getResearchState ? GameState.getResearchState() : { researchUsesLeft: 0, shieldNext: false };
    var researchMax = GameState.RESEARCH_MAX != null ? GameState.RESEARCH_MAX : 2;
    var researchEnabled = card.research && card.research.enabled;
    var investigarHtml = researchEnabled ? "<button type=\"button\" id=\"btn-investigar\" class=\"btn btn-investigar\" title=\"1 semana\">Investigar (" + researchState.researchUsesLeft + "/" + researchMax + ") · 1 semana</button>" : "";

    var metricsHtml = "";
    var keys = GameState.METRIC_KEYS || ["conversion", "support", "satisfaction", "revenue", "uxDebt"];
    var affectedKeys = lastResult && lastResult.delta ? Object.keys(lastResult.delta) : [];
    for (var m = 0; m < keys.length; m++) {
      var key = keys[m];
      var isAffected = affectedKeys.indexOf(key) !== -1;
      var recentStr = "";
      if (lastResult && lastResult.delta && lastResult.delta[key] !== undefined && lastResult.delta[key] !== 0) {
        recentStr = formatDeltaShort(key, lastResult.delta[key]);
      }
      metricsHtml += metricRow(key, metrics[key], recentStr, isAffected);
    }

    var impactCardHtml = "";
    if (lastResult && (lastResult.note || (lastResult.delta && Object.keys(lastResult.delta).length))) {
      var deltaParts = [];
      if (lastResult.delta) {
        for (var d = 0; d < keys.length; d++) {
          var dk = keys[d];
          if (lastResult.delta[dk] !== undefined && lastResult.delta[dk] !== 0) {
            deltaParts.push("<li><strong>" + escapeHtml(METRIC_LABELS[dk]) + "</strong> " + escapeHtml(formatDeltaShort(dk, lastResult.delta[dk])) + "</li>");
          }
        }
      }
      var impactList = deltaParts.length ? "<ul class=\"impact-list\">" + deltaParts.join("") + "</ul>" : "";
      var impactNote = lastResult.note ? "<p class=\"impact-note\">" + escapeHtml(lastResult.note) + "</p>" : "";
      impactCardHtml = "<div class=\"impact-card\">" +
        "<h3 class=\"impact-title\">Último impacto</h3>" +
        impactList +
        impactNote +
        "<button type=\"button\" id=\"btn-impact-continue\" class=\"btn btn-primary impact-cta\">Continuar</button>" +
        "</div>";
    }

    return (
      "<section id=\"screen-game\" class=\"screen screen-game\">" +
        "<div class=\"game-wrap\">" +
          "<header class=\"game-header card\">" +
            "<span class=\"header-level header-badge\">Nivel 1</span>" +
            "<span class=\"header-progress header-badge\">Carta <span id=\"card-index\">" + (cardIndex + 1) + "</span>/<span id=\"card-total\">" + total + "</span></span>" +
          "</header>" +
          "<div class=\"game-grid\">" +
            "<article id=\"main-card\" class=\"card game-card card-transition\">" +
              "<h2 id=\"card-title\" class=\"card-title\">" + escapeHtml(card.title) + "</h2>" +
              "<p id=\"card-situation\" class=\"card-situation\">" + escapeHtml(card.situation) + "</p>" +
              "<div id=\"options\" class=\"options\">" + optionsHtml + "</div>" +
              (investigarHtml ? "<div class=\"investigar-wrap\">" + investigarHtml + "</div>" : "") +
              "<div id=\"result-area\" class=\"result-area\">" + impactCardHtml + "</div>" +
            "</article>" +
            "<aside class=\"card sidebar dashboard-panel dashboard-tablero\">" +
              "<h3 class=\"sidebar-title\">Métricas</h3>" +
              "<div class=\"metrics-list\">" + metricsHtml + "</div>" +
              "<button type=\"button\" id=\"btn-restart\" class=\"btn btn-secondary\">Reiniciar</button>" +
            "</aside>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function getEstadoFinal(metrics, keys) {
    var green = 0, red = 0;
    for (var i = 0; i < keys.length; i++) {
      var sem = getSemaphoreState(keys[i], metrics[keys[i]]);
      if (sem === "green") green++;
      if (sem === "red") red++;
    }
    if (green >= 4 && red === 0) return { label: "estable", text: "Tu sistema terminó estable: la mayoría de métricas en rango saludable." };
    if (red >= 3) return { label: "reactivo", text: "Tu sistema terminó reactivo: varias métricas en zona crítica. La deuda y los trade-offs se acumularon." };
    return { label: "tensionado", text: "Tu sistema terminó tensionado: algunas métricas bien, otras en riesgo. Consecuencia de priorizar y dejar deuda." };
  }

  function endScreen() {
    if (!GameState) return "<section id=\"screen-end\" class=\"screen\"><p>Error.</p></section>";
    var metrics = GameState.getMetrics();
    var history = GameState.getHistory();
    var keys = GameState.METRIC_KEYS || ["conversion", "support", "satisfaction", "revenue", "uxDebt"];
    var rows = "";
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      rows += metricRow(key, metrics[key], "", false);
    }
    var estado = getEstadoFinal(metrics, keys);
    return (
      "<section id=\"screen-end\" class=\"screen screen-end\">" +
        "<div class=\"screen-inner card\">" +
          "<h2 class=\"card-title\">Fin del nivel</h2>" +
          "<p class=\"card-text end-reading\">" + escapeHtml(estado.text) + " No hay respuestas correctas, solo consecuencias acumuladas.</p>" +
          "<p class=\"card-text end-reading\">Revisá las métricas finales abajo. Cada decisión sumó o restó; la deuda UX al final de cada turno siguió impactando en el resto.</p>" +
          "<div class=\"end-summary\">" + rows + "</div>" +
          "<p class=\"end-estado\"><strong>Estado final:</strong> " + escapeHtml(estado.label) + "</p>" +
          "<button type=\"button\" id=\"btn-end-play-again\" class=\"btn btn-primary\">Jugar de nuevo</button>" +
        "</div>" +
      "</section>"
    );
  }

  function render() {
    var app = document.getElementById("app");
    var errEl = document.getElementById("jsError");
    if (!GameState) {
      if (app) app.innerHTML = "<p class=\"error-msg\">Error: GameState no disponible.</p>";
      return;
    }
    if (!app) return;
    var screen = GameState.getScreen();
    var html = "";
    if (screen === "intro") html = introScreen();
    else if (screen === "context") html = contextScreen();
    else if (screen === "game") html = gameScreen();
    else if (screen === "end") html = endScreen();
    else html = introScreen();
    app.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    var btnIntro = document.getElementById("btn-intro-start");
    if (btnIntro) btnIntro.addEventListener("click", function () {
      GameState.setScreen("context");
      render();
    });

    var btnContext = document.getElementById("btn-context-continue");
    if (btnContext) btnContext.addEventListener("click", function () {
      GameState.startLevel();
      render();
    });

    var btnRestart = document.getElementById("btn-restart");
    if (btnRestart) btnRestart.addEventListener("click", function () {
      GameState.reset();
      render();
    });

    var btnPlayAgain = document.getElementById("btn-end-play-again");
    if (btnPlayAgain) btnPlayAgain.addEventListener("click", function () {
      GameState.reset();
      render();
    });

    var btnInvestigar = document.getElementById("btn-investigar");
    if (btnInvestigar && GameState.useResearch) {
      btnInvestigar.addEventListener("click", function () {
        if (GameState.getLastResult()) return;
        var ok = GameState.useResearch();
        if (ok) {
          GameState.setLastResult({ delta: {}, note: "Tomaste 1 semana para entender mejor el problema. El próximo impacto negativo se reduce a la mitad." });
          if (DEBUG) console.log("[DEBUG] Investigar usado. shieldNext=true");
        }
        render();
      });
    }

    var btnImpactContinue = document.getElementById("btn-impact-continue");
    if (btnImpactContinue) {
      btnImpactContinue.addEventListener("click", function () {
        GameState.advanceCard();
        var st = GameState.getState();
        if (DEBUG) console.log("[DEBUG] advanceCard (Continuar)", st);
        if (st.cardIndex >= CARDS.length) {
          GameState.setScreen("end");
        }
        render();
      });
    }

    var optionsContainer = document.getElementById("options");
    if (optionsContainer && CARDS.length) {
      var cardIndex = GameState.getState().cardIndex;
      if (cardIndex < CARDS.length) {
        var card = CARDS[cardIndex];
        optionsContainer.addEventListener("click", function (e) {
          var lr = GameState.getLastResult();
          if (lr) {
            var isInvestigarMsg = lr.delta && Object.keys(lr.delta).length === 0 && lr.note && lr.note.indexOf("Tomaste 1 semana") !== -1;
            if (isInvestigarMsg) GameState.clearLastResult();
            else return;
          }
          var btn = e.target.closest("[data-option-index]");
          if (!btn) return;
          var idx = parseInt(btn.getAttribute("data-option-index"), 10);
          if (isNaN(idx) || !card.options[idx]) return;
          var option = card.options[idx];
          if (DEBUG) console.log("[DEBUG] chooseOption", { cardIndex: cardIndex, option: option.label, delta: option.delta });
          GameState.chooseOption(option);
          render();
        });
      }
    }
  }

  function showError(msg) {
    var el = document.getElementById("jsError");
    if (el) {
      el.textContent = msg;
      el.classList.add("visible");
    } else {
      document.body.innerHTML = "<pre class=\"error-fallback\">" + String(msg).replace(/</g, "&lt;") + "</pre>";
    }
  }

  function init() {
    if (!GameState) {
      showError("GameState no cargado. Verificá el orden de scripts: cards.js, gameState.js, app.js.");
      return;
    }
    if (!CARDS || CARDS.length === 0) {
      showError("No hay cartas definidas (CARDS).");
      return;
    }
    if (DEBUG) console.log("[DEBUG] init", GameState.getState());
    render();
  }

  if (typeof window !== "undefined") {
    window.onerror = function (message, source, lineno, colno, error) {
      showError("Error: " + (message || "") + (source ? " (" + source + ")" : "") + (lineno ? " Línea " + lineno : ""));
      return true;
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
