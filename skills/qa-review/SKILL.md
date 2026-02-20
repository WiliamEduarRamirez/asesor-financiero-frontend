---
name: QA Component Review
description: Heurísticas automáticas para revisar la implementación de componentes UI y lógica de negocio
---

# QA Review Skill

## Cuándo Usar

Auto-invocarse o usar cuando el usuario ejecuta o solicita indirectamente una revisión con `/qa-review`.

## Heurísticas Base por Tipo de Componente

Estas son heurísticas mínimas conocidas. Como agente de IA, además de estas, debes inferir casuísticas adicionales según el código específico y el contexto real del componente (por ej. interacción con `useMortgageCalculator` o estados reactivos complejos de Pinia).

### Selección múltiple y Listados
- ¿Hay límite de selección? Si es así, ¿se deshabilitan los items restantes al llegar al límite?
- ¿Se rehabilitan al deseleccionar?
- ¿El contador refleja el estado actual?
- ¿Qué pasa en n-1, n y n+1 estados límite de ítems?
- Para listas largas o renderizado de tablas de amortización (ej: componente de resultados de hipoteca): ¿Maneja paginación, virtualización o estados vacíos para escenarios atípicos?

### Forms (Formularios de Parámetros, Tasas, Prepagos)
- ¿Todos los inputs tienen parseo de números correctos (`Number()`, `NaN`) en TypeScript?
- ¿Todos los campos tienen validación requerida? (Integración con schemas, si existe, o validaciones custom).
- ¿Los mensajes de error son claros y en español (el idioma del proyecto)?
- ¿El botón submit o el cálculo en vivo se deshabilita mientras hay errores o está cargando?
- ¿Se resetea el form después de submit exitoso de un "Add Prepayment"?
- ¿Qué pasa si el campo es de tipo `null` o `undefined` en TypeScript (estricto)?
- ¿Los esquemas de validación cubren todos los casos "edge" financieros? Ej. "Monto de cuota inicial mayor que el precio de vivienda", "tasa negativa".

### Modales / Alertas / Notificaciones
- ¿El estado de apertura/cierre está correctamente sincronizado bidireccionalmente (`v-model` o emits `update:modelValue`)?
- ¿Hay estado "loading" en acciones asíncronas o de recalculo pesado de simulaciones?
- ¿Se limpian los datos en estado temporal del modal al cerrarlo o cancelarlo?

### Listas / Tablas / Gráficos (Chart.js)
- ¿Hay un "empty state" si los datos de la hipoteca no son válidos o se reinician?
- ¿Hay estado de carga (skeleton o spinner) durante las peticiones o recalculos pesados?
- ¿Hay estado de error con opción de reajustar los parámetros?
- ¿La actualización reactiva de las gráficas de `vue-chartjs` respeta el ciclo de vida (destruye/recrea) adecuadamente?

### Componentes con límites o validaciones cruzadas (Motor Financiero)
- ¿Se deshabilita la interacción o cálculo si los parámetros entran en conflicto? Ej: "Plazo de 500 años" no permitido.
- ¿Hay feedback visual instantáneo (Tailwind alerts) de los límites excedidos en tasas o montos?
- ¿Se prueba la respuesta de la UI en los casos de amortización con meses finales residuales ($0 o fracciones de centavo)?

### Componentes o Composables Asíncronos
- ¿Se manejan adecuadamente los tres estados: loading, error, success?
- ¿Hay retry en caso de error (si hay fetch de tasas externas, por ejemplo)?
- ¿Se evita concurrencia no deseada (doble click a simular o aplicar prepago)?

## Cómo Inferir Casuísticas Adicionales
Al analizar el código del diff o los componentes actuales, pregúntate constantemente:
- ¿Este `composables/` (ej. `usePrepayments.ts`) tiene estados internos (`ref`, `reactive`) que pueden desincronizarse con Pinia?
- ¿Hay `props` en los componentes base (`src/core/ui/`) que condicionan fuertemente el comportamiento de la validación o estilos genéricos?
- ¿Hay llamadas asíncronas de guardado o exportación no contempladas para fallos de red?
- ¿La comunicación padre-hijo se rompe si ocurre un update intermedio de la interfaz de usuario?
- ¿Qué sucede con los getters reactivos (`computed`) si los arrays están vacíos? ¿Causan errores de renderizado en Vue?

## Checklist Visual

- [ ] Los estados visuales (colores Tailwind) reflejan fielmente el estado lógico actual (rojo=error, gris=cargando).
- [ ] No existen botones ni campos de entrada habilitados si los parámetros anteriores son inservibles.
- [ ] Los "spinners" y componentes de `error/empty` existen donde se necesitan recálculos.
- [ ] El comportamiento numérico y de bordes (tasas al máximo, capital extra alto) ha sido testeado teóricamente o manejado.
- [ ] Los strings no están "hardcoded" caprichosamente sino en pro de la arquitectura y la UI de la aplicación en español.

## Bugs Conocidos

Patrones reales que han causado fallos en la estructura y que debes revisar sistemáticamente:
- Exceso de componentes de lógica que deberían estar en `MortgageEngine`: verificar que no haya matemática `interés = prestamo * tasa` en componentes; refactorizarlo al utils Engine.
- `any` escondido en callbacks genéricos: asegurar tipo `unknown` y validación tipada si no hay interfaz obvia disponible.
- Elementos residuales no deshabilitados: siempre comprobar que al superar la selección de métodos de prepago, el frontend actualiza su estado.
- Falta de reactividad de los gráficos: la reconstrucción de gráficos fallando por pasar arrays en la propiedad `data` sin reasignar el objeto principal reactivo en Pinia o Composables de Charts.
