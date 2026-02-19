<script setup lang="ts">
import { computed, inject } from 'vue';
import { cn } from './utils';
import type { Ref } from 'vue';

const props = defineProps<{
  value: string | number;
  disabled?: boolean;
  class?: string;
}>();

const context = inject<{
  activeValue: Ref<string | number>;
  variant: Ref<'pills' | 'underlined'>;
  grow: Ref<boolean>;
  updateValue: (val: string | number) => void;
}>('tabsContext');

const isActive = computed(() => context?.activeValue.value === props.value);

const buttonClass = computed(() => {
  const isUnderlined = context?.variant.value === 'underlined';
  const shouldGrow = context?.grow.value;

  const baseClasses = [
    'inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
    shouldGrow ? 'flex-1' : '',
  ];

  if (isUnderlined) {
    return cn(
      ...baseClasses,
      'border-b-2 -mb-px hover:text-indigo-600 hover:bg-slate-50',
      isActive.value
        ? 'border-indigo-600 text-indigo-700 font-bold'
        : 'border-transparent text-slate-500',
      props.class,
    );
  }

  // Pills variant
  return cn(
    ...baseClasses,
    'rounded-md ring-offset-background',
    isActive.value
      ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200/50'
      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900',
    props.class,
  );
});

const handleClick = () => {
  if (!props.disabled && context) {
    context.updateValue(props.value);
  }
};
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="isActive"
    :disabled="disabled"
    @click="handleClick"
    :class="buttonClass"
  >
    <slot />
  </button>
</template>
