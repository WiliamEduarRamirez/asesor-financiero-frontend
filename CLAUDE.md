# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con el código de este repositorio.

## Comandos

```bash
npm run dev          # Iniciar servidor de desarrollo Vite
npm run build        # Verificación de tipos + build de producción con Vite
npm run preview      # Vista previa del build de producción
npm run test         # Ejecutar tests con Vitest
npm run type-check   # Verificación de TypeScript sin emitir archivos
npm run lint         # Verificación con ESLint
npm run lint:fix     # Auto-corrección con ESLint
npm run format       # Formatear src/ con Prettier
```

Para ejecutar un único archivo de test:
```bash
npx vitest run src/__test__/modules/Simulator/composables/useMortgageCalculator.spec.ts
```

## Arquitectura

**HipoExpert AI** es un simulador hipotecario en Vue 3 para el mercado hispanohablante (contexto argentino: TEA, TEM, desgravamen, ITF). Toda la lógica de dominio reside en `src/modules/Simulator/`.

### Flujo de Datos

```
Entrada del usuario (props/v-model en componente)
  → Composable (usa MortgageEngine)
  → Tabla de amortización computada
  → Template renderiza gráficos/tablas
```

### Capas Principales

**Motor de Cálculo** — [src/modules/Simulator/utils/MortgageEngine.ts](src/modules/Simulator/utils/MortgageEngine.ts)
El núcleo intelectual. Funciones puras que implementan amortización francesa, interés diario/mensual (TED/TEM), simulación de prepagos con detección del punto de cruce capital/interés, manejo de eventos de refinanciación y estrategias inteligentes basadas en equilibrio. Toda la lógica financiera debe agregarse o modificarse aquí.

**Pinia Store** — [src/modules/Simulator/stores/useMortgageStore.ts](src/modules/Simulator/stores/useMortgageStore.ts)
Contiene únicamente los parámetros base del préstamo (precio, cuota inicial, tasa anual, plazo, salario mensual, tasas de seguro). El getter `loanAmount` computa `precio - cuotaInicial`. Mantener el store mínimo — los cálculos pertenecen a los composables.

**Composables** — [src/modules/Simulator/composables/](src/modules/Simulator/composables/)
Puente entre el store y los componentes. Cada composable encapsula un dominio de funcionalidad:
- `useMortgageCalculator.ts` — lógica de cálculo principal, tabla de amortización, comparación de estrategias
- `usePrepayments.ts` — agregar/eliminar/gestionar esquemas de prepago
- `useDebtOptimization.ts` — gestión de eventos de refinanciación
- `useRates.ts` — configuración de tasas
- `useLoanParameters.ts` — validación de entradas
- `usePaymentChart.ts` — preparación de datos para gráficos

**Modelos de Datos** — [src/modules/Simulator/models/mortgage.model.ts](src/modules/Simulator/models/mortgage.model.ts)
Tipos clave: `AmortizationRow` (desglose mensual), `Prepayment`, `PrepaymentStrategy` (`"reduce_term" | "reduce_payment"`), `RefinancingEvent`.

**Componentes** — [src/modules/Simulator/components/](src/modules/Simulator/components/)
Todos usan `<script setup>` con props y emits. Uso intensivo de Chart.js a través de `vue-chartjs`.

### Estructura de Módulos

```
src/modules/
├── Simulator/       # Funcionalidad principal: calculadora hipotecaria
├── Comparison/      # Comparación de escenarios lado a lado
├── Dashboard/       # Agregación de rutas + layout
└── shared/          # DashboardLayout, AIAssessor, composables/stores compartidos
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Lenguaje | TypeScript 5.x |
| Build | Vite 7 |
| Estado | Pinia 3 |
| Enrutamiento | Vue Router 5 |
| Estilos | Tailwind CSS 4 |
| Gráficos | Chart.js + vue-chartjs |
| Testing | Vitest + @vue/test-utils (jsdom) |
| Linting | ESLint 9 flat config + Prettier |

### Alias de Rutas

`@` resuelve a `./src` (configurado en `vite.config.ts`).

### Ubicación de Tests

Los tests se encuentran en `src/__test__/modules/` siguiendo la misma estructura que `src/modules/`.

### Estilo de Código

Configuración de Prettier: comillas simples, punto y coma, sangría de 2 espacios, ancho máximo de 100 caracteres, comas finales en todos lados.
