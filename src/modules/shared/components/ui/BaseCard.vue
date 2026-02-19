<script setup lang="ts">
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const cardVariants = cva('rounded-xl border bg-card text-card-foreground shadow-sm bg-white', {
  variants: {
    variant: {
      default: 'border-slate-100 shadow-md',
      outline: 'border-slate-200 bg-transparent shadow-none',
      ghost: 'border-none shadow-none',
      flat: 'border-slate-200 shadow-none bg-slate-50',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

type CardProps = {
  variant?: VariantProps<typeof cardVariants>['variant'];
  padding?: VariantProps<typeof cardVariants>['padding'];
  class?: string;
};

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
});

const cardClass = computed(() =>
  cn(cardVariants({ variant: props.variant, padding: props.padding }), props.class),
);
</script>

<template>
  <div :class="cardClass">
    <div
      v-if="$slots.header"
      class="flex flex-col space-y-1.5 p-6 pb-0 border-b border-slate-100 mb-6 -mx-6 -mt-6 rounded-t-xl bg-slate-50/50"
    >
      <slot name="header" />
    </div>
    <div class="p-6 pt-0">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="flex items-center p-6 pt-0 border-t border-slate-100 mt-6 -mx-6 -mb-6 rounded-b-xl bg-slate-50/30"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
