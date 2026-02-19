<script setup lang="ts">
import { BaseCard, BaseIcon } from '@/core/ui';
defineProps<{
  title: string;
  value: string;
  icon: string;
  iconClass?: string;
  subtext?: string;
}>();
</script>

<template>
  <BaseCard
    class="relative overflow-hidden group transition-all hover:shadow-md h-full"
    padding="md"
  >
    <div
      class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
      :class="iconClass"
    >
      <BaseIcon :icon="icon" :size="60" />
    </div>

    <div class="relative z-10">
      <p class="text-sm font-medium text-slate-500 relative inline-flex items-center gap-2">
        {{ title }}
        <slot name="badge"></slot>
      </p>

      <p class="text-2xl font-bold text-slate-900 mt-1">
        {{ value }}
      </p>

      <div v-if="$slots.footer || subtext" class="mt-2">
        <slot name="footer">
          <p class="text-xs text-slate-400">{{ subtext }}</p>
        </slot>
      </div>
    </div>
  </BaseCard>
</template>
