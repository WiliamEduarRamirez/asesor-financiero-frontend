<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Prepayment, PrepaymentStrategy, StrategyComparison } from '../models/mortgage.model';
import PrepaymentModal from './PrepaymentModal.vue';

const props = defineProps<{
  prepayments: Prepayment[];
  prepaymentStrategy: PrepaymentStrategy;
  totalInterestSavings: number;
  monthsSaved: number;
  salaryPercentage: number;
  minSalaryPercentage: number;
  termYears: number; // For calculating total occurrences
  validatePrepayment: (
    amount: number,
    month: number,
  ) => { isValid: boolean; message?: string; isEfficient?: boolean };
  compareStrategies: (amount: number, month: number) => StrategyComparison;
  stopOnCrossover: boolean;
  aggressiveContinuity: boolean; // New prop
  calculateOptimalPrepayment: (targetMonth: number) => number;
  pivotMonth: number | null;
  maintenanceAmount: number;
}>();

const emit = defineEmits<{
  (e: 'update:prepayments', value: Prepayment[]): void;
  (e: 'update:prepaymentStrategy', value: PrepaymentStrategy): void;
  (e: 'update:stopOnCrossover', value: boolean): void;
  (e: 'update:aggressiveContinuity', value: boolean): void;
  (e: 'add-prepayment'): void;
  (e: 'add-recurring-prepayment', value: Prepayment): void;
  (e: 'remove-prepayment', index: number): void;
}>();

const showModal = ref(false);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};

const strategySummary = computed(() => {
  const recurring = props.prepayments.filter((p) => p.frequency === 'recurring');
  const unique = props.prepayments.filter((p) => p.frequency === 'unique');

  if (recurring.length === 0 && unique.length === 0) return null;

  const parts = [];
  if (recurring.length > 0) {
    // Just take the first one for summary or generic?
    // "Pago recurrente de S/ X cada Y meses"
    // If multiple, maybe "X estrategias recurrentes".
    if (recurring.length === 1) {
      const r = recurring[0];
      if (r) {
        parts.push(`Recurrente: ${formatCurrency(r.amount)} cada ${r.interval || 12} meses`);
      }
    } else {
      parts.push(`${recurring.length} reglas recurrentes`);
    }
  }

  if (unique.length > 0) {
    parts.push(`${unique.length} pago(s) único(s)`);
  }

  return parts.join(' + ');
});

const recurringRules = computed(() => {
  return props.prepayments
    .filter((p) => p.frequency === 'recurring')
    .map((p) => {
      const startNode = p.month;
      const totalMonths = props.termYears * 12; // Approximation or use actual term?
      // Calculate how many times it fits
      // (Total - Start) / Interval + 1 (if it occurs on start month)
      // interval is p.interval || 12
      const interval = p.interval || 12;
      const occurrences = Math.max(0, Math.floor((totalMonths - startNode) / interval)) + 1;
      return {
        ...p,
        occurrences,
        interval,
      };
    });
});
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
    <!-- Prepayments Summary (Count) -->
    <div v-if="strategySummary">
      <!-- Recurring Rules List -->
      <div v-if="recurringRules.length > 0" class="mb-4 space-y-2">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Reglas Recurrentes Activas
        </p>
        <div
          v-for="(rule, idx) in recurringRules"
          :key="idx"
          class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg"
        >
          <div class="bg-emerald-200 text-emerald-800 p-1.5 rounded-md">
            <iconify-icon icon="mdi:refresh-circle" width="20"></iconify-icon>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-800">
              {{ formatCurrency(rule.amount) }}
              <span class="text-slate-500 font-normal">cada {{ rule.interval }} meses</span>
            </p>
            <p class="text-[10px] text-emerald-700 font-semibold">
              Se aplicará {{ rule.occurrences }} veces en total
            </p>
          </div>
        </div>
      </div>

      <!-- Unique Payments Summary -->
      <div
        v-if="prepayments.some((p) => p.frequency === 'unique')"
        class="flex items-center gap-2 text-sm text-slate-600 mb-2"
      >
        <div class="bg-blue-100 text-blue-700 p-1 rounded-md">
          <iconify-icon icon="mdi:calendar-check" width="16"></iconify-icon>
        </div>
        <span class="font-medium text-slate-700">
          {{ prepayments.filter((p) => p.frequency === 'unique').length }} ajustes puntuales
          configurados
        </span>
      </div>

      <!-- Combined Strategy Text -->
      <div class="mt-3 pt-3 border-t border-slate-100">
        <p class="text-xs text-slate-400 mb-1">Resumen de Estrategia:</p>
        <p class="text-xs font-medium text-slate-600 italic">"{{ strategySummary }}"</p>
      </div>
    </div>
    <div
      v-else
      class="mb-4 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200"
    >
      <iconify-icon
        icon="mdi:finance"
        class="text-slate-300 mx-auto mb-2"
        width="24"
      ></iconify-icon>
      <p class="text-xs text-slate-500 font-medium">No hay pagos anticipados activos</p>
      <p class="text-[10px] text-slate-400">Define una estrategia para ahorrar intereses</p>
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
      :validate-prepayment="validatePrepayment"
      :compare-strategies="compareStrategies"
      :stop-on-crossover="stopOnCrossover"
      :aggressive-continuity="aggressiveContinuity"
      :calculate-optimal-prepayment="calculateOptimalPrepayment"
      :pivot-month="pivotMonth"
      :maintenance-amount="maintenanceAmount"
      @update:prepayment-strategy="(val) => emit('update:prepaymentStrategy', val)"
      @update:stop-on-crossover="(val) => emit('update:stopOnCrossover', val)"
      @update:aggressive-continuity="(val) => emit('update:aggressiveContinuity', val)"
      @add-prepayment="emit('add-prepayment')"
      @add-recurring-prepayment="(val) => emit('add-recurring-prepayment', val)"
      @remove-prepayment="(idx) => emit('remove-prepayment', idx)"
    />
  </div>
</template>
