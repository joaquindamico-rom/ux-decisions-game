/**
 * Estado del juego: pantalla actual, índice de carta, métricas, historial por turno, reinicio.
 * API: getState, getScreen, getMetrics, getHistory, getLastResult, setScreen, applyDelta, pushHistory, setLastResult, clearLastResult, reset, startLevel, chooseOption, advanceCard.
 */
(function () {
  "use strict";

  var METRIC_KEYS = ["conversion", "support", "satisfaction", "revenue", "uxDebt"];

  var RESEARCH_MAX = 2;

  var state = {
    screen: "intro",
    cardIndex: 0,
    conversion: 0,
    support: 0,
    satisfaction: 0,
    revenue: 0,
    uxDebt: 0,
    history: [],
    lastResult: null,
    researchUsesLeft: RESEARCH_MAX,
    shieldNext: false
  };

  function getState() {
    return {
      screen: state.screen,
      cardIndex: state.cardIndex,
      conversion: state.conversion,
      support: state.support,
      satisfaction: state.satisfaction,
      revenue: state.revenue,
      uxDebt: state.uxDebt,
      history: state.history.slice(),
      lastResult: state.lastResult ? { delta: state.lastResult.delta, note: state.lastResult.note } : null,
      researchUsesLeft: state.researchUsesLeft,
      shieldNext: state.shieldNext
    };
  }

  function getResearchState() {
    return { researchUsesLeft: state.researchUsesLeft, shieldNext: state.shieldNext };
  }

  function getScreen() {
    return state.screen;
  }

  function getMetrics() {
    return {
      conversion: state.conversion,
      support: state.support,
      satisfaction: state.satisfaction,
      revenue: state.revenue,
      uxDebt: state.uxDebt
    };
  }

  function getHistory() {
    return state.history.slice();
  }

  function getLastResult() {
    return state.lastResult;
  }

  function setScreen(screen) {
    if (["intro", "context", "game", "end"].indexOf(screen) !== -1) {
      state.screen = screen;
    }
  }

  function setCardIndex(i) {
    state.cardIndex = Math.max(0, i);
  }

  function applyDelta(delta) {
    if (!delta || typeof delta !== "object") return;
    var useShield = state.shieldNext;
    if (useShield) state.shieldNext = false;
    for (var k = 0; k < METRIC_KEYS.length; k++) {
      var key = METRIC_KEYS[k];
      if (!delta.hasOwnProperty(key) || typeof state[key] !== "number") continue;
      var v = delta[key];
      if (useShield && v < 0) {
        v = Math.floor(v / 2);
      }
      state[key] += v;
    }
  }

  function useResearch() {
    if (state.researchUsesLeft <= 0) return false;
    state.researchUsesLeft -= 1;
    state.shieldNext = true;
    return true;
  }

  /**
   * Deuda UX como métrica madre: al final del turno aplica spillover proporcional.
   * Más deuda → más tickets, menos satisfacción, menos conversión y revenue.
   */
  function applySpillover() {
    var d = state.uxDebt;
    if (d <= 0) return;
    state.support += d;
    state.satisfaction -= d;
    state.conversion -= Math.floor(d / 2);
    state.revenue -= Math.floor(d / 2);
  }

  function pushHistory() {
    state.history.push({
      conversion: state.conversion,
      support: state.support,
      satisfaction: state.satisfaction,
      revenue: state.revenue,
      uxDebt: state.uxDebt
    });
  }

  function setLastResult(result) {
    state.lastResult = result ? { delta: result.delta || {}, note: result.note || result.feedback || "" } : null;
  }

  function clearLastResult() {
    state.lastResult = null;
  }

  function reset() {
    state.screen = "intro";
    state.cardIndex = 0;
    state.conversion = 0;
    state.support = 0;
    state.satisfaction = 0;
    state.revenue = 0;
    state.uxDebt = 0;
    state.history = [];
    state.lastResult = null;
    state.researchUsesLeft = RESEARCH_MAX;
    state.shieldNext = false;
  }

  function startLevel() {
    state.screen = "game";
    state.cardIndex = 0;
    state.conversion = 0;
    state.support = 0;
    state.satisfaction = 0;
    state.revenue = 0;
    state.uxDebt = 0;
    state.history = [{ conversion: 0, support: 0, satisfaction: 0, revenue: 0, uxDebt: 0 }];
    state.lastResult = null;
    state.researchUsesLeft = RESEARCH_MAX;
    state.shieldNext = false;
  }

  function chooseOption(option) {
    if (!option || !option.delta) return;
    applyDelta(option.delta);
    applySpillover();
    pushHistory();
    setLastResult({ delta: option.delta, note: option.feedback || option.note || "" });
  }

  function advanceCard() {
    clearLastResult();
    state.cardIndex += 1;
  }

  if (typeof window !== "undefined") {
    window.GameState = {
      getState: getState,
      getScreen: getScreen,
      getMetrics: getMetrics,
      getHistory: getHistory,
      getLastResult: getLastResult,
      getResearchState: getResearchState,
      setScreen: setScreen,
      setCardIndex: setCardIndex,
      applyDelta: applyDelta,
      pushHistory: pushHistory,
      setLastResult: setLastResult,
      clearLastResult: clearLastResult,
      reset: reset,
      startLevel: startLevel,
      chooseOption: chooseOption,
      advanceCard: advanceCard,
      useResearch: useResearch,
      METRIC_KEYS: METRIC_KEYS,
      RESEARCH_MAX: RESEARCH_MAX
    };
  }
})();
