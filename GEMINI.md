# Helper Frontend - AI Agent Guide

> **Single Source of Truth** - Este es el documento maestro para todos los agentes de IA que trabajan en este proyecto.
> Lee este archivo PRIMERO antes de hacer cualquier cambio en el proyecto.

Este proyecto incluye skills de IA personalizados que proporcionan contexto y patrones específicos del proyecto HipoExpert AI.

---

## 📋 Resumen del Proyecto

**HipoExpert AI** es un simulador hipotecario web interactivo para el mercado hispanohablante construido con:

- **Vue 3** con Composition API (`<script setup>`)
- **TypeScript 5.x** estricto (sin `any`)
- **Vite 7** como bundler
- **Pinia 3** para gestión de estado
- **Vitest** + **@vue/test-utils** para testing unitario
- **Tailwind CSS 4** para estilos
- **Chart.js** + **vue-chartjs** para visualización de datos de amortización
- **npm** como gestor de tareas principal

Toda la lógica financiera profunda ("Motor de Cálculo" o `MortgageEngine`) y los `composables` para simulaciones y prepagos están encapsulados en el módulo `Simulator/`.

---

## 🎯 Skills Disponibles

### Repositorio Local (skills/)

| Skill                  | Descripción                                                               | Archivo                                          |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `qa-review`            | Heurísticas de revisión automática para componentes, formularios y lógica | [SKILL.md](skills/qa-review/SKILL.md)            |

---

## ⚡ Auto-Invoke Skills

**SIEMPRE** consulta el skill correspondiente ANTES o DURANTE estas acciones:

| Acción                           | Consulta PRIMERO                             | Por qué                                                    |
| -------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| Ejecutar slash command /qa-review| `qa-review`                                  | Leer criterios de validación y checklist visual y lógico   |
| Revisar PRs o cambios de UI      | `qa-review`                                  | Asegurar manejo de estados (loading, vacíos, asíncronos)   |

---

## 🔴 Reglas Críticas (NUNCA IGNORAR)

### TypeScript Estricto

- ❌ **NUNCA usar `any`**
- ✅ Usar tipos específicos, genéricos o interfaces
- ✅ Mantener tipado en modelos, e.g., `AmortizationRow`, `Prepayment`, en `mortgage.model.ts`
- ⚠️ Ejecutar `npm run type-check` después de cambios estructurales

### Responsabilidades de Capas

- ❌ **Evitar lógica financiera en componentes o stores**.
- ✅ **Motor de Cálculo**: Toda la lógica matemática, interés diario/mensual (TED/TEM) reside en `MortgageEngine.ts`.
- ✅ **Composables**: Usar composables (`useMortgageCalculator`, `usePrepayments`) como puente reactivo entre el motor, los cálculos y la UI.
- ✅ **Store**: Mantener el Pinia store mínimo con parámetros base (precio, tasa, plazo), NO computar toda la amortización ahí.

### Estilo de Código y Linting

- Las comillas simples, punto y coma obligatorios, comas finales, sangría de 2 espacios. (Reglas de tu Prettier interno)

---

## 🏗️ Arquitectura del Proyecto

```
hipoexpert-ai/
├── src/
│   ├── core/                 # Componentes genéricos de UI y utilidades (e.g., BaseSelect)
│   ├── modules/              # Módulos principales del dominio
│   │   ├── Simulator/        # ⚠️ Módulo PRINCIPAL: Calculadora, Engine, prepagos
│   │   │   ├── components/   # UI del simulador y visualizaciones
│   │   │   ├── composables/  # Lógica reactiva y puentes al Engine
│   │   │   ├── models/       # Tipos TypeScript de dominio financiero
│   │   │   ├── stores/       # Estado global y parámetros del simulador
│   │   │   └── utils/        # MortgageEngine y lógica pura matemática
│   │   ├── Comparison/       # Vista de comparación de hipotecas
│   │   ├── Dashboard/        # Layout principal y agregador
│   │   └── shared/           # Elementos compartidos entre simuladores y vistas
│   ├── __test__/             # ⚠️ Tests unitarios (estructura ESPEJO de src/)
│   │   └── modules/
│   │       └── Simulator/
│   │           └── composables/ 
│   │               └── useMortgageCalculator.spec.ts  # Ej: Test espejo
│   └── App.vue
├── skills/                   # Skills de IA
├── .claude/                  # Comandos Slash y contexto
├── package.json              # Módulos y scripts
└── GEMINI.md / CLAUDE.md     # Notas de contexto extra
```

### 📍 Regla de Ubicación de Tests

Los tests deben reflejar exactamente la ubicación del archivo original en la carpeta `__test__`.
Por ejemplo, para `src/modules/Simulator/composables/useMortgageCalculator.ts`, su test será `src/__test__/modules/Simulator/composables/useMortgageCalculator.spec.ts`.

---

## 🔄 Workflow de Desarrollo

### Comandos Esenciales

```bash
# Desarrollo
npm run dev                  # Servidor de desarrollo Vite
npm run build                # Build optimizado para producción

# Testing
npm run test                 # Ejecutar tests con Vitest

# Calidad de Código
npm run type-check           # ⚠️ OBLIGATORIO después de cambios profundos de tipos
npm run lint                 # Verificación de scripts
npm run format               # Aplicar reglas de Prettier
```

---

## 🚀 Comandos Slash de IA

Si el agente o IDE lo soporta:
- `/qa-review` : Analiza el diff de código actual utilizando el skill `qa-review` y escupe un reporte sobre la implementación correcta de estados del componente.

---

## 💡 Tips para Agentes de IA

1. **Calculadora**: Si el usuario te pide arreglar el cálculo, o la simulación se rompe, el 90% del tiempo el problema estará en `MortgageEngine.ts` o en cómo el composable `useMortgageCalculator.ts` o `usePrepayments.ts` consume los datos.
2. **UI**: Cuando el usuario pida interfaces, sigue los estándares visuales de TailwindCSS 4 y el enfoque "Vue 3 Script Setup".
3. **Calidad**: Al terminar un bloque, asegúrate de que pasa `npm run type-check`.
