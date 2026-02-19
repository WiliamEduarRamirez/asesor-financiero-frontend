<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { cn } from './utils';

const props = defineProps<{
  modelValue: string | number;
  class?: string;
}>();

const registeredItems = ref<(string | number)[]>([]);

const registerItem = (val: string | number) => {
  if (!registeredItems.value.includes(val)) {
    registeredItems.value.push(val);
  }
};

const direction = ref<'forward' | 'reverse'>('forward');

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    const newIndex = registeredItems.value.indexOf(newVal);
    const oldIndex = registeredItems.value.indexOf(oldVal);

    if (newIndex !== -1 && oldIndex !== -1) {
      direction.value = newIndex > oldIndex ? 'forward' : 'reverse';
    }
  },
);

// Proveemos el valor activo y funciones de control a los BaseTabsWindowItem
provide('tabsWindowContext', {
  activeValue: computed(() => props.modelValue),
  direction: computed(() => direction.value),
  registerItem,
});

const wrapperClass = computed(() => cn('relative w-full overflow-hidden', props.class));
</script>

<template>
  <div :class="wrapperClass">
    <slot />
  </div>
</template>
