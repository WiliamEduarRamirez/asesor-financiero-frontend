<script setup lang="ts">
import { BaseCard, BaseIcon, BaseTypography } from '@/core/ui';
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
      <BaseTypography
        variant="subtitle2"
        color="muted"
        class="relative inline-flex items-center gap-2"
      >
        {{ title }}
        <slot name="badge"></slot>
      </BaseTypography>

      <BaseTypography variant="h4" color="default" class="mt-1">
        <slot name="value">{{ value }}</slot>
      </BaseTypography>

      <div v-if="$slots.footer || subtext" class="mt-2">
        <slot name="footer">
          <BaseTypography variant="caption" color="muted">{{ subtext }}</BaseTypography>
        </slot>
      </div>
    </div>
  </BaseCard>
</template>
