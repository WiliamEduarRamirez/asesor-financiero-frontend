<script setup lang="ts">
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const typographyVariants = cva(
  '', // Clases base
  {
    variants: {
      variant: {
        h1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
        h2: 'text-3xl md:text-4xl font-bold tracking-tight',
        h3: 'text-2xl md:text-3xl font-bold tracking-tight',
        h4: 'text-xl md:text-2xl font-bold',
        h5: 'text-lg font-semibold',
        h6: 'text-base font-semibold',
        subtitle1: 'text-base font-medium',
        subtitle2: 'text-sm font-medium',
        body1: 'text-base leading-relaxed',
        body2: 'text-sm leading-relaxed',
        caption: 'text-xs',
        overline: 'text-[10px] uppercase tracking-wider font-bold',
        custom: '', // Variante para uso puramente clase-tailwind o custom
      },
      color: {
        default: 'text-slate-800',
        muted: 'text-slate-500',
        primary: 'text-indigo-600',
        secondary: 'text-purple-600',
        success: 'text-emerald-600',
        error: 'text-red-600',
        warning: 'text-amber-600',
        white: 'text-white',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
      },
    },
    defaultVariants: {
      variant: 'custom',
      color: 'default',
      align: 'left',
    },
  },
);

type TypographyVariantProps = VariantProps<typeof typographyVariants>;

export interface TypographyProps {
  /** Estilo visual de la tipografía (Ej. h1, h2, body1) */
  variant?: TypographyVariantProps['variant'];
  /** Forzar un tag HTML específico (Ej. 'span', 'p', 'h1'). Si no, se infiere del variant. */
  as?: string;
  /** Color semántico */
  color?: TypographyVariantProps['color'];
  /** Alineación del texto */
  align?: TypographyVariantProps['align'];
  /** Sobrescribir el grosor de la fuente (font-weight) */
  weight?: TypographyVariantProps['weight'];
  class?: string;
}

const props = withDefaults(defineProps<TypographyProps>(), {
  variant: 'custom',
  color: 'default',
  align: 'left',
});

// Mapa para inferir automáticamente el Tag HTML más semántico dependiendo del aspecto visual
const defaultTagMap: Record<string, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
};

const currentTag = computed(() => {
  return props.as || (props.variant ? defaultTagMap[props.variant] : 'p') || 'p';
});

const typographyClass = computed(() => {
  return cn(
    typographyVariants({
      variant: props.variant,
      color: props.color,
      align: props.align,
      weight: props.weight,
    }),
    props.class,
  );
});
</script>

<template>
  <component :is="currentTag" :class="typographyClass">
    <slot />
  </component>
</template>
