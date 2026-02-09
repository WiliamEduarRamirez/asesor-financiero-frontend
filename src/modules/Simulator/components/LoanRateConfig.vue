<script setup lang="ts">
import { useRates } from '../composables/useRates';

const { isTceaMode, teaValue, tceaValue, desgravamenValue, fireInsuranceValue } = useRates();
</script>

<template>
  <div class="space-y-4 pt-2 border-t border-slate-100 mt-4">
    <!-- Header with Switch -->
    <div class="flex items-center justify-between">
      <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Configuración de Tasas
      </h4>
      <div class="flex items-center gap-2">
        <span
          class="text-xs font-medium"
          :class="isTceaMode ? 'text-indigo-600' : 'text-slate-400'"
        >
          Usar TCEA
        </span>
        <button
          @click="isTceaMode = !isTceaMode"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1"
          :class="isTceaMode ? 'bg-indigo-600' : 'bg-slate-300'"
          type="button"
        >
          <span
            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm"
            :class="isTceaMode ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </button>
      </div>
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
        <div>
          <label for="teaValue" class="block text-sm font-medium text-slate-600 mb-1"
            >TEA (%)</label
          >
          <div class="relative">
            <input
              id="teaValue"
              v-model.number="teaValue"
              type="number"
              step="0.01"
              class="w-full pl-4 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-slate-800"
              placeholder="8.5"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
        </div>

        <!-- Insurances -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="desgravamenValue" class="block text-xs font-medium text-slate-500 mb-1">
              Seg. Desgravamen (Mensual %)
            </label>
            <div class="relative">
              <input
                id="desgravamenValue"
                v-model.number="desgravamenValue"
                type="number"
                step="0.001"
                class="w-full pl-3 pr-6 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >%</span
              >
            </div>
          </div>
          <div>
            <label for="fireInsuranceValue" class="block text-xs font-medium text-slate-500 mb-1">
              Seg. Inmueble (Mensual %)
            </label>
            <div class="relative">
              <input
                id="fireInsuranceValue"
                v-model.number="fireInsuranceValue"
                type="number"
                step="0.001"
                class="w-full pl-3 pr-6 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >%</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Mode: TCEA -->
      <div v-else key="tcea-mode" class="space-y-2">
        <div>
          <label for="tceaValue" class="block text-sm font-medium text-indigo-700 mb-1">
            TCEA Total (%)
          </label>
          <div class="relative">
            <input
              id="tceaValue"
              v-model.number="tceaValue"
              type="number"
              step="0.01"
              class="w-full pl-4 pr-8 py-2 border border-indigo-200 bg-indigo-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-bold text-indigo-900"
              placeholder="9.5"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 font-medium"
              >%</span
            >
          </div>
          <p class="text-xs text-indigo-500 mt-1 flex items-center gap-1">
            <iconify-icon icon="mdi:information-outline"></iconify-icon>
            Incluye todos los costos y seguros
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
