<script setup lang="ts">
import { computed } from 'vue';
import { cn } from './utils';

type IconSize = 'x-small' | 'small' | 'default' | 'large' | 'x-large' | string | number;

interface IconProps {
  icon: string;
  size?: IconSize;
  class?: string;
  color?: string;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 'default',
});

const sizeMap: Record<string, string> = {
  'x-small': '12px',
  small: '16px',
  default: '24px',
  large: '36px',
  'x-large': '48px',
};

const processedSize = computed(() => {
  if (typeof props.size === 'string' && sizeMap[props.size]) {
    return sizeMap[props.size];
  }
  return typeof props.size === 'number' ? `${props.size}px` : props.size;
});
</script>

<template>
  <iconify-icon
    :icon="icon"
    :width="processedSize"
    :height="processedSize"
    :class="cn('inline-flex justify-center items-center', props.class)"
    :style="{ color: props.color }"
  ></iconify-icon>
</template>
