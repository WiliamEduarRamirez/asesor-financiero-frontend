<script setup lang="ts">
import { computed, provide } from 'vue';
import { cn } from './utils';
import type { ClassValue } from 'clsx';

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    class?: ClassValue;
    align?: 'left' | 'center' | 'right';
    variant?: 'pills' | 'underlined';
    grow?: boolean;
  }>(),
  {
    align: 'left',
    variant: 'pills',
    grow: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const alignClass = computed(() => {
  switch (props.align) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    case 'left':
    default:
      return 'justify-start';
  }
});

const wrapperClass = computed(() => {
  if (props.variant === 'underlined') {
    return cn(
      'flex w-full overflow-x-auto border-b border-slate-200 scrollbar-hide',
      alignClass.value,
      props.class,
    );
  }
  return cn('flex w-full overflow-x-auto scrollbar-hide', props.class);
});

const innerContainerClass = computed(() => {
  if (props.variant === 'underlined') {
    return cn('flex min-w-max', props.grow ? 'w-full' : 'w-auto');
  }
  return cn(
    'inline-flex items-center rounded-lg bg-slate-100 p-1 min-w-max',
    alignClass.value,
    props.grow ? 'w-full flex-1' : 'w-auto',
  );
});

// Proveemos el contexto a todos los BaseTab descendientes
provide('tabsContext', {
  activeValue: computed(() => props.modelValue),
  variant: computed(() => props.variant),
  grow: computed(() => props.grow),
  updateValue: (val: string | number) => emit('update:modelValue', val),
});
</script>

<template>
  <div :class="wrapperClass">
    <div :class="innerContainerClass" role="tablist">
      <slot />
    </div>
  </div>
</template>
