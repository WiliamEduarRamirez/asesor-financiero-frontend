<script setup lang="ts">
import { computed } from 'vue';
import { cn } from './utils';

// Definimos las propiedades del componente
interface SwitchProps {
  modelValue?: boolean;
  label?: string;
  id?: string;
  disabled?: boolean;
  error?: string | boolean;
  class?: string;
}

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  disabled: false,
  error: false,
});

const emit = defineEmits(['update:modelValue']);

// Método para alternar el valor
const toggle = () => {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
};

// Clases dinámicas del botón y el círculo interno
const switchClass = computed(() => {
  return cn(
    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.modelValue ? 'bg-indigo-600' : 'bg-slate-300',
    props.error ? 'focus-visible:ring-red-500 bg-red-400' : 'focus-visible:ring-indigo-500',
    props.class,
  );
});

const thumbClass = computed(() => {
  return cn(
    'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
    props.modelValue ? 'translate-x-4' : 'translate-x-0',
  );
});
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Label opcional a la izquierda -->
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none cursor-pointer select-none transition-colors"
      :class="[
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        error ? 'text-red-500' : modelValue ? 'text-indigo-600' : 'text-slate-600',
      ]"
      @click="toggle"
    >
      {{ label }}
    </label>

    <button
      :id="id"
      type="button"
      :aria-pressed="modelValue || false"
      :disabled="disabled"
      :class="switchClass"
      @click="toggle"
      @keyup.space.prevent="toggle"
      @keyup.enter.prevent="toggle"
    >
      <span :class="thumbClass"></span>
    </button>

    <!-- Mensaje de error (opcional) inferior si estuviese suelto en form -->
    <p
      v-if="error && typeof error === 'string'"
      class="text-xs font-medium text-red-500 mt-1 absolute -bottom-5"
    >
      {{ error }}
    </p>
  </div>
</template>
