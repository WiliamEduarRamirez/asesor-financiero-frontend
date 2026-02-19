<script setup lang="ts">
import { cn } from './utils';
import type { ClassValue } from 'clsx';

export interface Tab {
  value: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
  tabs: Tab[];
  modelValue: string;
  class?: ClassValue;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div :class="cn('w-full overflow-x-auto', props.class)">
    <div
      class="inline-flex items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max w-full sm:w-auto"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        @click="emit('update:modelValue', tab.value)"
        :class="[
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none',
          modelValue === tab.value
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-background/50 hover:text-foreground',
        ]"
      >
        <iconify-icon v-if="tab.icon" :icon="tab.icon" class="mr-2 text-lg"></iconify-icon>
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
