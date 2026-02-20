---
name: Core UI Components
description: Patrones de diseño, convenciones y uso del Design System interno en src/core/ui
---

# Core UI Components Skill (Design System)

## Cuándo Usar

Auto-invocarse **SIEMPRE** antes de:
- Escribir nuevos componentes visuales.
- Modificar componentes existentes en `src/modules/` para que usen primitivas de `src/core/ui/`.
- Construir formularios, tarjetas, botones o modales.
- Implementar validaciones visuales de inputs o selects.

## 🏗️ Filosofía del Design System (HipoExpert UI)

Nuestro sistema de diseño ("mini ds") está basado en Tailwind CSS, y utiliza utilidades avanzadas como `class-variance-authority` (cva) y `tailwind-merge` (`cn`). Está inspirado fuertemente por **shadcn/ui**, lo que nos permite un control total sobre las variantes y una estética "Trust & Tech" robusta.

**Regla de Oro:** ❌ **NO USAR** tags HTML puros `<button>`, `<input>`, `<select>` para elementos de la interfaz interactiva. ✅ **USAR SIEMPRE** las primitivas en `src/core/ui` (`BaseButton`, `BaseInput`, `BaseSelect`, etc.).

## 📦 Componentes Disponibles y Patrones de Uso

Todos los componentes base se exportan centralizadamente desde `src/core/ui/index.ts`.
**Importación correcta:** `import { BaseButton, BaseInput } from '@/core/ui'` (o ruta relativa adecuada).

### 1. `BaseButton.vue`

Botón interactivo con soporte de carga, y diseño centralizado mediante `cva`.

- **Variantes (`variant`)**:
  - `'default'` (default) - Relleno principal azul (`blue-600`).
  - `'destructive'` - Relleno principal rojo para borrados o alertas severas.
  - `'outline'` - Fondo transparente, solo borde, texto gris (`slate-900` al hacer hover).
  - `'secondary'` - Fondo gris suave (`slate-100`).
  - `'ghost'` - Fondo transparente, sin borde (se pinta gris al hacer hover).
  - `'link'` - Texto azul subrayable.
- **Tamaños (`size`)**: `'sm'`, `'default'` (h-10 px-4), `'lg'`, `'icon'`.
- **Estados**: `:disabled="boolean"`, transiciones de opacidad aplicadas internamente.
- **Ejemplo**:
  ```vue
  <BaseButton variant="outline" size="sm" @click="save">
    Guardar
  </BaseButton>
  ```

### 2. Controles de Formulario (`BaseInput` & `BaseSelect`)

Todo input de texto o selección debe usar estos componentes para unificar estados de error, etiquetas (labels) y sufijos (ej: "%" o "$").

#### `BaseInput.vue`
- Usa `v-model`.
- **Variantes (`variant`)**: `'default'`, `'filled'`, `'underlined'`, `'error'`.
- **Tamaños (`size`)**: `'default'`, `'sm'`, `'lg'`.
- **Atributos descriptivos**: `label` (fijo arriba), `placeholder`, `hint` (texto ayuda gris abajo).
- **Estado de error**: Pasar prop `:error="'Mensaje de validación rojito'"`. Fuerza la variante de error internamente.
- **Decoradores**:
  - Prop `prefix` (ej. `S/`) o `suffix` (ej. `%`). Absolutos internamente.
- **Ejemplo**:
  ```vue
  <BaseInput
    v-model="loanAmount"
    label="Monto del Préstamo"
    prefix="$"
    :error="v$.loanAmount.$error ? v$.loanAmount.$errors[0]?.$message : false"
  />
  ```

#### `BaseSelect.vue`
- Usa `v-model`.
- Mismas props de estado/estilo que `BaseInput` (`variant`, `size`, `label`, `error`, `disabled`).

### 3. `BaseCard.vue`

Contenedor principal para modularizar la UI. Reemplaza divs con clases de cajas y sombras sueltas.

- **Diseño estandarizado**: Bordes sutiles, padding unificado y bg-white/surface.
- **Partes comunes**: Usado habitualmente para envolver KPIs, formularios de parámetros o gráficas.
- **Ejemplo**:
  ```vue
  <BaseCard>
    <!-- Contenido interno con padding predeterminado del sistema -->
    <h3 class="text-lg font-semibold mb-4">Detalle de Simulación</h3>
    <BaseInput ... />
  </BaseCard>
  ```

### 4. Componentes Extra

- **`BaseIcon.vue`**: Wrapper para Iconify. Usar este en vez de etiquetas directas `<iconify-icon>` para centralizar propiedades (size, color).
- **`BaseSwitch.vue` / `BaseTab.vue` / `BaseTypography.vue`**: Usar en listados de configuración, navegación en ventanas (Tabs) y jerarquías limpias de texto.

## 🎨 Tipografía y Espaciados Críticos

1.  **Colores Tailwind**: Trata de usar `text-slate-800` para títulos, `text-slate-500` para subtítulos. Evitar la "sopa de colores" — no uses verdes/rojos a menos que la información sea puramente financiera (éxito o advertencia/deuda).
2.  **Modificadores Globales**: Si necesitas agrupar botones o inputs horizontalmente, usar el estándar `flex gap-4`.

## 🔄 Workflow de Creación y Edición del Core UI

Si necesitas **crear o editar** un componente atómico en el Core UI:
1.  **¿Existe ya en Tailwind/HTML nativo algo muy simple?** Evalúa si vale la pena envolverlo.
2.  **Define Props Dinámicas**: Siempre provee `variant`, `size`, `color` usando `cva`.
3.  **Expórtalo**: OBLIGATORIO exportarlo en `src/core/ui/index.ts`.
4.  **Estricto Tipo**: No uses `any` en las props. Usa `PropType` o la macro `defineProps<{ ... }>()` de TypeScript puro en Vue 3.
5.  **📝 ACTUALIZA LA DOCUMENTACIÓN (CRÍTICO)**: Todo componente **nuevo o modificado** DEBE ser documentado/actualizado inmediatamente en:
    - Este archivo: `skills/core-ui-components/SKILL.md` (Agregarlo o actualizar la sección "Componentes Disponibles y Patrones de Uso" con sus variantes y ejemplos).
    - Plan del Sistema: `src/core/design-system-plan.md` (Referenciar su existencia, propósito o nuevas props).
