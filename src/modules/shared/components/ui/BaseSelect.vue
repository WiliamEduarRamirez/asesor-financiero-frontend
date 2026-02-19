<script setup lang="ts">
import { computed } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from './utils';

const selectVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium text-slate-800 bg-white appearance-none',
  {
    variants: {
      variant: {
        default: 'border-slate-200 shadow-sm hover:border-blue-300',
        filled: 'bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white',
        error: 'border-red-300 text-red-900 focus-visible:ring-red-300 placeholder-red-300',
      },
      size: {
        default: 'h-10 py-2',
        sm: 'h-8 text-xs',
        lg: 'h-12 text-base px-4 icon:h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type SelectProps = {
  modelValue?: string | number | null;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  placeholder?: string;
  error?: string | boolean;
  hint?: string;
  id?: string;
  variant?: 'default' | 'filled' | 'error';
  size?: 'default' | 'sm' | 'lg';
  class?: string;
};

const props = withDefaults(defineProps<SelectProps>(), {
  modelValue: '',
  variant: 'default',
  size: 'default',
  error: false,
});

const emit = defineEmits(['update:modelValue']);

const finalVariant = computed(() => (props.error ? 'error' : props.variant));
const selectClass = computed(() =>
  cn(selectVariants({ variant: finalVariant.value, size: props.size }), props.class),
);

const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="space-y-1.5 w-full relative">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 block mb-1.5"
    >
      {{ label }}
    </label>

    <div class="relative group">
      <select
        :id="id"
        :value="modelValue"
        @change="updateValue"
        :class="selectClass"
        v-bind="$attrs"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <!-- Custom Chevron -->
      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <iconify-icon
          icon="mdi:chevron-down"
          class="text-slate-400 group-hover:text-blue-500 transition-colors"
        ></iconify-icon>
      </div>
    </div>

    <!-- Error / Hint -->
    <p
      v-if="error && typeof error === 'string'"
      class="text-sm font-medium text-red-500 animate-in slide-in-from-top-1 fade-in mt-1"
    >
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-muted-foreground mt-1">
      {{ hint }}
    </p>
  </div>
</template>
