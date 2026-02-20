# Comando /qa-review

## Descripción
Este comando ejecuta una revisión automática (QA) sobre los últimos cambios en el código o sobre el componente que se le indique, aplicando las heurísticas del proyecto.

## Flujo de Ejecución

1. **Analizar el diff o el componente**: El agente de IA inspeccionará el estado de los archivos modificados (o el archivo específico si se provee una ruta).
2. **Consultar las heurísticas**: El agente leerá internamente el archivo `skills/qa-review/SKILL.md` (o recordará este contexto si ya lo leyó).
3. **Detección de Tipos**: Verificará si es un Formulario, Componente Reactivo (UI genérica), Gráfico de Amortización o lógica del Motor Financiero.
4. **Validaciones**: Evaluará las reglas estrictas como la ausencia total de `any`, validaciones lógicas, y uso de Tailwind.
5. **Reporte**: Generará un informe siguiendo el formato de resultados estricto que se muestra a continuación.

## Formato de Resultados

El agente de IA deberá devolver SIEMPRE la revisión estructurada de la siguiente manera:

**Feature analizado:** [Nombre del feature, archivo(s) o componente, e.g. `PrepaymentModal.vue`]
**Tipo de componente detectado:** [form / lista / modal / lógica core de Simulator / gráfico / etc.]

✅ Bien implementado
- [Aspecto 1 bien manejado, ej. Tipado estricto]
- [Aspecto 2 bien manejado, ej. Uso correcto de Tailwind]

⚠️ Podría faltar
- [Observación de mejora 1, ej. No hay un "empty state" claro en la tabla]
- [Observación de mejora 2, ej. Falta spinner de carga aunque la simulación responda rápido]

❌ Definitivamente falta
- [Error claro 1, ej. Props de Vue mutadas internamente o tipo `any` encontrado]
- [Error claro 2, ej. Falta de validación en la entrada de tasa anual]

**Prioridad:**
- 🔴 Crítico (puede romper en producción o causar cálculos financieros erróneos)
- 🟡 Importante (afecta UX significativamente, bugs visuales, desincronización)
- 🟢 Nice-to-have (accesibilidad adicional, refactor de estilos)

---
> Nota para el agente AI (no exponer al usuario final): Recuerda revisar exhaustivamente las referencias nulas o arrays vacíos al trabajar con los charts o la tabla de amortización general en Vue, a la vez de las reglas TypeScript de `HipoExpert AI`.
