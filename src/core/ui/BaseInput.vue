<script setup lang="ts">
import { computed } from 'vue';
import { cva } from 'class-variance-authority';
import { cn } from './utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium text-slate-800',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 placeholder-slate-400 bg-white shadow-sm hover:border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
        filled:
          'bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
        underlined:
          'rounded-none border-t-0 border-l-0 border-r-0 border-b-2 px-0 shadow-none focus:ring-0 focus:border-blue-600',
        error:
          'border-red-400 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-red-300',
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

type InputProps = {
  modelValue?: string | number | null;
  label?: string;
  error?: string | boolean;
  prefix?: string;
  suffix?: string;
  hint?: string;
  id?: string;
  type?: string;
  variant?: 'default' | 'filled' | 'underlined' | 'error';
  size?: 'default' | 'sm' | 'lg';
  class?: string;
};

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  variant: 'default',
  size: 'default',
  error: false,
});

const emit = defineEmits(['update:modelValue']);

const finalVariant = computed(() => (props.error ? 'error' : props.variant));

const inputClass = computed(() => {
  return cn(
    inputVariants({ variant: finalVariant.value, size: props.size }),
    props.prefix ? 'pl-8' : '',
    props.suffix ? 'pr-8' : '',
    props.class,
  );
});

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="space-y-1.5 w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 block mb-1.5"
      :class="size === 'sm' ? 'text-xs' : 'text-sm'"
    >
      {{ label }}
    </label>

    <!-- Input Wrapper -->
    <div class="relative group">
      <!-- Prefix -->
      <span
        v-if="prefix"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none pointer-events-none transition-colors group-focus-within:text-blue-500"
        :class="{ 'text-red-400': error }"
      >
        {{ prefix }}
      </span>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="updateValue"
        :class="inputClass"
        v-bind="$attrs"
      />

      <!-- Suffix -->
      <span
        v-if="suffix"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none pointer-events-none"
        :class="{ 'text-red-400': error }"
      >
        {{ suffix }}
      </span>
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
