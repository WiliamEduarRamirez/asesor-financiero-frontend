<script setup lang="ts">
import { useRates } from '../composables/useRates';
import { BaseInput, BaseSwitch, BaseIcon, BaseTypography } from '@/core/ui';

const { isTceaMode, teaValue, tceaValue, desgravamenValue, fireInsuranceValue } = useRates();
</script>

<template>
  <div class="space-y-4 pt-2 border-t border-slate-100 mt-4">
    <!-- Header with Switch -->
    <div class="flex items-center justify-between">
      <BaseTypography variant="overline" color="muted"> Configuración de Tasas </BaseTypography>
      <BaseSwitch v-model="isTceaMode" label="Usar TCEA" class="ml-2" />
    </div>

    <!-- Mode: TEA (Default) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
      enter-to-class="opacity-100 translate-y-0 max-h-[200px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-[200px]"
      leave-to-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
      mode="out-in"
    >
      <div v-if="!isTceaMode" key="tea-mode" class="space-y-4">
        <!-- TEA -->
        <BaseInput
          id="teaValue"
          v-model.number="teaValue"
          type="number"
          step="0.01"
          label="TEA (%)"
          suffix="%"
          placeholder="8.5"
        />

        <!-- Insurances -->
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            id="desgravamenValue"
            v-model.number="desgravamenValue"
            type="number"
            step="0.001"
            label="Seg. Desgravamen (Mensuales %)"
            suffix="%"
            size="sm"
            class="bg-slate-50"
          />
          <BaseInput
            id="fireInsuranceValue"
            v-model.number="fireInsuranceValue"
            type="number"
            step="0.001"
            label="Seg. Inmueble (Mensuales %)"
            suffix="%"
            size="sm"
            class="bg-slate-50"
          />
        </div>
      </div>

      <!-- Mode: TCEA -->
      <div v-else key="tcea-mode" class="space-y-2">
        <div>
          <BaseInput
            id="tceaValue"
            v-model.number="tceaValue"
            type="number"
            step="0.01"
            label="TCEA Total (%)"
            suffix="%"
            placeholder="9.5"
            class="bg-indigo-50 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-indigo-900 font-bold"
          />
          <BaseTypography variant="caption" color="primary" class="mt-1 flex items-center gap-1">
            <BaseIcon icon="mdi:information-outline" />
            Incluye todos los costos y seguros
          </BaseTypography>
        </div>
      </div>
    </Transition>
  </div>
</template>
