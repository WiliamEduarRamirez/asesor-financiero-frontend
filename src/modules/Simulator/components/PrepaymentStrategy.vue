<script setup lang="ts">
import { ref } from 'vue';
import type { Prepayment, PrepaymentStrategy } from '../models/mortgage.model';
import PrepaymentModal from './PrepaymentModal.vue';

defineProps<{
  prepayments: Prepayment[];
  prepaymentStrategy: PrepaymentStrategy;
  totalInterestSavings: number;
  monthsSaved: number;
  salaryPercentage: number;
  minSalaryPercentage: number;
}>();

const emit = defineEmits<{
  (e: 'update:prepayments', value: Prepayment[]): void;
  (e: 'update:prepaymentStrategy', value: PrepaymentStrategy): void;
  (e: 'add-prepayment'): void;
  (e: 'remove-prepayment', index: number): void;
}>();

const showModal = ref(false);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-700 flex items-center gap-2">
        <iconify-icon icon="mdi:cash-fast" class="text-emerald-600"></iconify-icon>
        Estrategia de Pagos Anticipados
      </h3>
      <button
        @click="showModal = true"
        class="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
      >
        <iconify-icon icon="mdi:pencil"></iconify-icon>
        Configurar
      </button>
    </div>

    <!-- Prepayments Summary (Count) -->
    <div v-if="prepayments.length > 0" class="mb-4">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <div class="bg-emerald-100 text-emerald-700 p-1 rounded-md">
          <iconify-icon icon="mdi:check-circle" width="16"></iconify-icon>
        </div>
        <span>{{ prepayments.length }} pago(s) anticipado(s) configurado(s)</span>
      </div>
    </div>
    <div
      v-else
      class="mb-4 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200"
    >
      <p class="text-xs text-slate-400">No hay pagos anticipados activos</p>
    </div>

    <!-- Impact Summary -->
    <div
      v-if="
        totalInterestSavings > 0 ||
        monthsSaved > 0 ||
        (salaryPercentage > minSalaryPercentage && minSalaryPercentage > 0)
      "
      class="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100"
    >
      <div class="flex items-center gap-2 mb-3">
        <div class="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
          <iconify-icon icon="mdi:chart-timeline-variant-shimmer"></iconify-icon>
        </div>
        <p class="text-xs font-bold text-emerald-800 uppercase tracking-wide">Impacto Proyectado</p>
      </div>
      <div class="space-y-3">
        <div class="flex justify-between items-center pb-2 border-b border-emerald-100/50">
          <p class="text-xs text-emerald-700">Ahorro en Intereses</p>
          <p class="text-sm font-bold text-emerald-900">
            {{ formatCurrency(totalInterestSavings) }}
          </p>
        </div>
        <div
          v-if="monthsSaved > 0"
          class="flex justify-between items-center pb-2 border-b border-emerald-100/50"
        >
          <p class="text-xs text-emerald-700">Tiempo Ahorrado</p>
          <p class="text-sm font-bold text-emerald-900">{{ monthsSaved }} meses</p>
        </div>
        <div
          v-if="salaryPercentage > minSalaryPercentage && minSalaryPercentage > 0"
          class="flex justify-between items-center"
        >
          <p class="text-xs text-emerald-700">Riesgo (Deuda/Ingreso)</p>
          <div class="flex items-center gap-2">
            <span class="text-xs text-emerald-600 line-through"
              >{{ salaryPercentage.toFixed(1) }}%</span
            >
            <iconify-icon icon="mdi:arrow-right" class="text-emerald-400" width="10" />
            <span
              class="text-sm font-bold"
              :class="minSalaryPercentage <= 30 ? 'text-emerald-900' : 'text-orange-600'"
            >
              {{ minSalaryPercentage.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <PrepaymentModal
      v-model:show="showModal"
      :prepayments="prepayments"
      :prepayment-strategy="prepaymentStrategy"
      @update:prepayment-strategy="(val) => emit('update:prepaymentStrategy', val)"
      @add-prepayment="emit('add-prepayment')"
      @remove-prepayment="(idx) => emit('remove-prepayment', idx)"
    />
  </div>
</template>
