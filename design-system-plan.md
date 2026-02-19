
# Plan de Acción: Sistema de Diseño (Fase 1) - HipoExpert UI

## 1. Definición de la Paleta de Colores y Tokens
Estableceremos una paleta de colores coherente basada en la identidad actual (azules y grises oscuros "slate") pero formalizada para transmitir confianza y tecnología.

**Colores Primarios (Azul Financiero - Trust & Tech):**
- `primary-50` a `primary-900`: Basado en `blue-600` actual.
- **Uso**: Acciones principales, estados activos, enlaces.

**Colores Neutros (Slate - Modern & Clean):**
- `surface-50` a `surface-900`: Basado en `slate`.
- **Uso**: Fondos, bordes, textos, tarjetas.

**Colores de Estado (Semánticos):**
- `success`: Green (Aprobado, ahorro positivo).
- `warning`: Amber (Alertas, riesgo medio).
- `error`: Red (Errores, riesgo alto).
- `info`: Sky (Información neutral).

**Tipografía (Ya en uso pero formalizada):**
- Tamaños: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`.
- Pesos: `regular` (400), `medium` (500), `semibold` (600), `bold` (700).

## 2. Sistema de Tamaños (Density)
Definiremos 4 tamaños estándar para todos los componentes interactivos (inputs, botones, selects), inspirados en Material Design / Vuetify pero adaptados a Tailwind.

1.  **Small (`sm`)**: 32px altura. Para tablas densas o filtros secundarios.
2.  **Default (`md`)**: 40px altura. El estándar. Equilibrado para formularios generales.
3.  **Large (`lg`)**: 48px altura. Para acciones principales o inputs destacados (ej. Monto del Préstamo).
4.  **X-Large (`xl`)**: 56px altura. Para landings o inputs héroe.

## 3. Primitivas de Componentes (Atomic Components)
Crearemos los componentes base en `src/modules/shared/components/ui`. Todos implementarán `v-model` y validación integrada.

### 3.1 `BaseInput.vue` (Inspirado en v-text-field de Vuetify)
- **Props**:
    - `variant`: `outlined` (borde completo), `filled` (fondo gris suave), `underlined` (solo línea inferior).
    - `size`: `sm`, `md`, `lg`, `xl`.
    - `label`: Texto flotante o fijo.
    - `prepend-icon` / `append-icon`: Iconos a izquierda/derecha.
    - `prefix` / `suffix`: Texto fijo (ej: "S/", "%").
    - `error-message`: Mensaje de error (rojo).
    - `hint`: Texto de ayuda.
- **Features**: Validación integrada con Zod, estados (focus, error, disabled), transiciones suaves.

### 3.2 `BaseSelect.vue` (Inspirado en v-select)
- **Props**: Similares a `BaseInput` + `options` (array de objetos/strings).
- **Features**: Menú desplegable estilizado (no nativo si es posible para consistencia, o nativo estilizado para simplicidad inicial), búsqueda opcional.

### 3.3 `BaseButton.vue` (Inspirado en v-btn)
- **Props**:
    - `variant`: `solid` (relleno), `outlined` (borde), `text` (ghost), `tonal` (fondo suave).
    - `color`: `primary`, `secondary`, `success`, `error`.
    - `size`: `sm`, `md`, `lg`, `xl`.
    - `block`: Ancho completo.
    - `loading`: Estado de carga con spinner.
    - `icon`: Icono opcional.

### 3.4 `BaseCard.vue` (Inspirado en v-card)
- **Props**:
    - `variant`: `elevated` (sombra), `outlined` (borde), `flat` (plano).
    - `padding`: `none`, `sm`, `md`, `lg`.
- **Slots**: `header`, `default` (body), `actions` (footer).

### 3.5 `BaseSwitch.vue` & `BaseCheckbox.vue`
- Controles de selección booleanos consistentes con la paleta.

## 4. Estrategia de Validación
Usaremos `vee-validate` + `zod` para la gestión de formularios.
- **Integración**: Los componentes `BaseInput` y `BaseSelect` aceptarán prop `name` para conectarse automáticamente con el contexto de formulario de `vee-validate` o recibirán `error-message` directamente si se usa validación manual.

## 5. Implementación Paso a Paso

1.  **Configuración**: Definir colores y utilidades en `tailwind.config.js` / CSS variables.
2.  **BaseButton**: Crear componente y probar variantes.
3.  **BaseInput**: Crear componente maestro con soporte de iconos y estados.
4.  **BaseCard**: Crear contenedor estructural.
5.  **Refactor Piloto**: Migrar **un** formulario pequeño (ej. "Parámetros del Préstamo") para validar el sistema antes de extenderlo.

---
**Nota**: Mantendremos el diseño limpio ("No arcoiris"). Todo se basará en el azul corporativo, blanco, gris pizarra y los colores semánticos justos y necesarios.
