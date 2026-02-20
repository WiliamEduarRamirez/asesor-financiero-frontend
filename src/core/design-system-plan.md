# Sistema de Diseño - HipoExpert UI (Core UI)

## 1. Filosofía y Stack Técnico
El sistema de diseño de HipoExpert AI está construido sobre `Tailwind CSS 4` e inspirado fuertemente en los patrones de **shadcn/ui**, utilizando `class-variance-authority` (cva) y utilidades de mergeo de clases (`clsx` + `tailwind-merge` embebidos en la función `cn()`).

A diferencia del planteamiento original (inspirado en Vuetify), nuestro "mini ds" opta por un enfoque más nativo a Tailwind: componentes accesibles, directos y con control total de las variantes mediante CVA.

## 2. Definición de la Paleta de Colores
**Colores Primarios (Azul Financiero - Trust & Tech):**
- Basados en `blue-600` como color por defecto para acciones principales.

**Colores Neutros (Slate - Modern & Clean):**
- Uso intensivo de la paleta `slate` (`slate-50` a `slate-900`) para textos, bordes, backgrounds suaves (fondos de inputs en modo filled, placeholders, etc.).

**Colores de Estado (Semánticos):**
- `destructive` / `error`: Basados en la paleta `red` (`red-500` para fondos, `red-400` para bordes).

## 3. Primitivas de Componentes (Atomic Components)
Los componentes base residen en `src/core/ui/` y se exportan desde `src/core/ui/index.ts`.

### 3.1 `BaseButton.vue`
Botón renderizado mediante `cva`, con soporte nativo de Tailwind.
- **`variant`**:
  - `default` (bg azul)
  - `destructive` (bg rojo)
  - `outline` (borde sutil, hover gris)
  - `secondary` (bg gris claro)
  - `ghost` (sin fondo, hover gris)
  - `link` (texto azul con underline)
- **`size`**: `default` (h-10), `sm` (h-8), `lg` (h-12), `icon` (cuadrado h-10 w-10).

### 3.2 `BaseInput.vue`
Input de texto moderno con soporte de variantes, layouts flotantes y validación.
- **`variant`**:
  - `default` (borde sutil, ring azul en focus)
  - `filled` (bg suave slate-50)
  - `underlined` (solo borde inferior)
  - `error` (forzado internamente si la prop `error` existe).
- **`size`**: `default` (h-10), `sm` (h-8), `lg` (h-12).
- **`error`**: Acepta un *string*. Si es string, se renderiza debajo del input.
- **Soporte Adicional**: `prefix`, `suffix`, `label` y `hint`.

### 3.3 El resto del ecosistema
- **`BaseSelect.vue`**, **`BaseCard.vue`**, **`BaseIcon.vue`**, **`BaseSwitch.vue`**, **`BaseTabs.vue`**, etc., siguen el mismo paradigma: clases centralizadas por CVA, merge de propiedades custom por medio de `cn()`, y ausencia de librerías CSS pesadas adicionales.

## 4. Estrategia de Validación y Reglas de Importación
- **No HTML puro**: Evitar drásticamente utilizar `<button>` nativo o `<input>` suelto en los `src/modules/*`.
- **Integración fluida**: Usar prop `error` de los inputs enviando el string de validación (por ejemplo usando VeeValidate/Zod o validación on-the-fly en Vue).
- **Consistencia Visual**: Mantener el uso de `gap-x`, `flex`, y text-colors referenciando `slate-700` y `slate-500` para evitar una "sopa de colores" incoherente.
