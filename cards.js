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
    },
    {
      level: 2,
      id: "senales-mixtas",
      title: "Señales mixtas",
      situation: "Las métricas de producto y las de soporte cuentan historias distintas: conversión sube pero los tickets también. No está claro si el problema es el producto o la expectativa.",
      options: [
        { label: "Priorizar métricas de producto", delta: { conversion: 1, support: 1, uxDebt: 1 }, cost: "1 sprint", feedback: "Optimizás un lado; el otro sigue sin respuesta." },
        { label: "Unificar criterios de medición", delta: { uxDebt: -1, satisfaction: 0 }, cost: "2 sprints", feedback: "Claridad a futuro; el corto plazo no cambia." },
        { label: "Investigar causas con usuarios", delta: { support: -1, uxDebt: -1 }, cost: "1–2 semanas", feedback: "Mejor diagnóstico; la decisión se posterga." },
        { label: "Mantener foco en conversión", delta: { conversion: 1, satisfaction: -1 }, cost: "0", feedback: "Seguís con lo que ya priorizaste." }
      ],
      research: { enabled: true }
    },
    {
      level: 2,
      id: "optimizacion-local",
      title: "Optimización local",
      situation: "Un equipo optimizó un flujo aislado y las métricas de ese flujo mejoraron. El resto del producto no se tocó. Hay presión por replicar el enfoque en otros flujos.",
      options: [
        { label: "Replicar la misma receta", delta: { conversion: 1, uxDebt: 2 }, cost: "2 sprints", feedback: "Ganancia cortoplacista; la deuda se reparte." },
        { label: "Revisar consistencia primero", delta: { satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "Unificás criterios antes de escalar." },
        { label: "Medir impacto en el resto", delta: { revenue: 0, uxDebt: -1 }, cost: "1 sprint", feedback: "Entendés si el éxito se traslada." },
        { label: "Pausar y documentar el caso", delta: { uxDebt: 0 }, cost: "1 semana", feedback: "No movés métricas; ganás aprendizaje." }
      ],
      research: { enabled: false }
    },
    {
      level: 2,
      id: "ruido-de-contexto",
      title: "Ruido de contexto",
      situation: "Los comentarios de usuarios vienen mezclados: piden features, reportan bugs y se quejan del soporte en el mismo canal. Es difícil priorizar sin más estructura.",
      options: [
        { label: "Segmentar canales por tipo", delta: { support: -1, uxDebt: 0 }, cost: "1 sprint", feedback: "Mejor triaje; requiere disciplina de uso." },
        { label: "Responder solo lo urgente", delta: { satisfaction: -1, support: 0 }, cost: "0", feedback: "Contenés incendios; la imagen se resiente." },
        { label: "Agregar un formulario guiado", delta: { support: -1, uxDebt: 1 }, cost: "1 sprint", feedback: "Menos ruido; algo de fricción nueva." },
        { label: "Reservar tiempo para análisis", delta: { uxDebt: -1 }, cost: "1 semana", feedback: "Menos reacción, más contexto para decidir." }
      ],
      research: { enabled: true }
    },
    {
      level: 2,
      id: "datos-que-no-alcanzan",
      title: "Datos que no alcanzan",
      situation: "Hay hipótesis sobre por qué la conversión se estanca, pero el volumen de datos o la instrumentación actual no permiten validarlas con confianza. El equipo pide más tiempo.",
      options: [
        { label: "Actuar con lo que hay", delta: { conversion: 0, uxDebt: 1 }, cost: "1 sprint", feedback: "Avanzás con incertidumbre; riesgo de desvío." },
        { label: "Mejorar instrumentación", delta: { uxDebt: -1 }, cost: "2 sprints", feedback: "Mejor visibilidad después; el ahora no cambia." },
        { label: "Reducir alcance y validar", delta: { conversion: 1, satisfaction: 0 }, cost: "1 sprint", feedback: "Un experimento acotado da señal más clara." },
        { label: "Esperar más datos", delta: {}, cost: "2–3 semanas", feedback: "No cambian métricas; ganás certeza." }
      ],
      research: { enabled: false }
    },
    {
      level: 2,
      id: "excepciones-razonables",
      title: "Excepciones razonables",
      situation: "Una regla de negocio (validación, límite, flujo) genera fricción para un segmento pequeño pero valioso. Flexibilizar podría ayudar a ese segmento y complicar el resto.",
      options: [
        { label: "Crear excepción explícita", delta: { satisfaction: 1, uxDebt: 1 }, cost: "1 sprint", feedback: "Cubrís el caso; la complejidad sube." },
        { label: "Mantener regla única", delta: { satisfaction: -1, conversion: 0 }, cost: "0", feedback: "Simplicidad; el segmento sigue molesto." },
        { label: "Rediseñar la regla", delta: { conversion: 0, satisfaction: 1, uxDebt: -1 }, cost: "2 sprints", feedback: "Solución de fondo; más costo de producto." },
        { label: "Ofrecer alternativa manual", delta: { support: 1, satisfaction: 0 }, cost: "1 sprint", feedback: "Soporte absorbe la excepción; escala limitada." }
      ],
      research: { enabled: false }
    }
  ];

  if (typeof window !== "undefined") {
    window.CARDS = CARDS;
  }
})();
