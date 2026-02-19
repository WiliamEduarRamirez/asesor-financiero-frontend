<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';
import { cn } from './utils';

const props = defineProps<{
  value: string | number;
  class?: string;
}>();

const context = inject<{
  activeValue: Ref<string | number>;
  direction: Ref<'forward' | 'reverse'>;
  registerItem?: (val: string | number) => void;
}>('tabsWindowContext');

import { onMounted } from 'vue';

onMounted(() => {
  if (context?.registerItem) {
    context.registerItem(props.value);
  }
});

const isActive = computed(() => context?.activeValue.value === props.value);
const isForward = computed(() => context?.direction?.value === 'forward');

const itemClass = computed(() => cn('w-full', props.class));
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    :enter-from-class="
      isForward
        ? 'opacity-0 translate-x-8 lg:translate-x-12'
        : 'opacity-0 -translate-x-8 lg:-translate-x-12'
    "
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-200 ease-in absolute inset-x-0 top-0"
    leave-from-class="opacity-100 translate-x-0"
    :leave-to-class="
      isForward
        ? 'opacity-0 -translate-x-8 lg:-translate-x-12'
        : 'opacity-0 translate-x-8 lg:translate-x-12'
    "
  >
    <div v-show="isActive" :class="itemClass" role="tabpanel">
      <slot />
    </div>
  </Transition>
</template>
