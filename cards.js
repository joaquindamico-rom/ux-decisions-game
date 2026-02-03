/**
 * Cartas: level, id, title, situation, options: [{ label, cost, delta, feedback }], research?: { enabled }.
 */
(function () {
  "use strict";

  var CARDS = [
    {
      level: 1,
      id: "onboarding",
      title: "Onboarding complejo",
      situation: "El producto pide mucha información desde el inicio. Parte del abandono ocurre sin errores visibles.",
      options: [
        { label: "Optimizar visualmente el formulario", delta: { conversion: 1, uxDebt: 1 }, cost: "1–2 días", feedback: "Mejora la primera impresión, pero la fricción sigue ahí." },
        { label: "Reorganizar la información en pasos", delta: { conversion: 2, support: -1, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "Menos abandono y menos consultas a soporte." },
        { label: "Ajustar textos y ayudas", delta: { uxDebt: 1 }, cost: "1 día", feedback: "Parche visible; el problema de fondo no cambia." },
        { label: "No cambiar nada aún", delta: {}, cost: "0", feedback: "Decidís observar un poco más." }
      ],
      research: { enabled: true }
    },
    {
      level: 1,
      id: "no-avanzan",
      title: "La gente llega, pero no avanza",
      situation: "Hay tráfico, pero la acción principal no se completa.",
      options: [
        { label: "Reducir pasos", delta: { conversion: 2, revenue: 1, uxDebt: 2 }, cost: "2 sprints", feedback: "Conversión sube, pero acumulás deuda en otros flujos." },
        { label: "Dar más explicaciones", delta: { support: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "Menos tickets a corto plazo; la fricción se traslada." },
        { label: "Simplificar decisiones", delta: { conversion: 1, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "El flujo gana claridad y los usuarios lo notan." },
        { label: "Observar antes de intervenir", delta: {}, cost: "0", feedback: "Priorizás entender antes de cambiar." }
      ],
      research: { enabled: true }
    },
    {
      level: 1,
      id: "errores-evitables",
      title: "Errores evitables",
      situation: "Usuarios fallan en campos que parecen simples.",
      options: [
        { label: "Explicar errores", delta: { support: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "Menos consultas, pero el error sigue ocurriendo." },
        { label: "Prevenir errores", delta: { conversion: 1, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "Menos frustración y menos fricción a largo plazo." },
        { label: "Bloquear avance", delta: { conversion: -1, satisfaction: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "La validación estricta genera más abandono." },
        { label: "Entender por qué fallan", delta: { uxDebt: -1 }, cost: "1 sprint", feedback: "Invertís en diagnóstico; la deuda baja un poco." }
      ],
      research: { enabled: true }
    },
    {
      level: 1,
      id: "mobile-incomodo",
      title: "Mobile incómodo",
      situation: "El flujo se siente pesado en pantallas chicas.",
      options: [
        { label: "Ocultar información", delta: { conversion: 1, uxDebt: 2 }, cost: "1 sprint", feedback: "Sube conversión móvil, pero la deuda crece." },
        { label: "Repriorizar el flujo", delta: { conversion: 1, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "El flujo móvil gana sentido sin esconder todo." },
        { label: "Mantener consistencia", delta: { satisfaction: -1, uxDebt: 1 }, cost: "0", feedback: "No cambias nada; la queja sigue." },
        { label: "Forzar desktop", delta: { conversion: -2, satisfaction: -2, uxDebt: 2 }, cost: "1 sprint", feedback: "Empeorás la experiencia móvil de golpe." }
      ],
      research: { enabled: true }
    },
    {
      level: 1,
      id: "pico-soporte",
      title: "Primer pico de soporte",
      situation: "Soporte empieza a recibir consultas frecuentes.",
      options: [
        { label: "Sección de ayuda visible", delta: { support: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "Menos tickets, pero la causa raíz no se toca." },
        { label: "Ayudas contextuales", delta: { conversion: 1, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "Ayuda donde duele; menos consultas y mejor percepción." },
        { label: "Respuestas automáticas", delta: { satisfaction: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "Descongestionás soporte a costa de satisfacción." },
        { label: "Entender preguntas frecuentes", delta: { uxDebt: -1 }, cost: "1 sprint", feedback: "Usás el feedback para priorizar; la deuda baja." }
      ],
      research: { enabled: false }
    }
  ];

  if (typeof window !== "undefined") {
    window.CARDS = CARDS;
  }
})();
