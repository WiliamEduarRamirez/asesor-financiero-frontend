<script setup lang="ts">
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200/80',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        link: 'text-blue-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  class?: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
});

const buttonClass = computed(() => {
  return cn(buttonVariants({ variant: props.variant, size: props.size }), props.class);
});
</script>

<template>
  <button :class="buttonClass" :disabled="props.disabled">
    <slot />
  </button>
</template>
