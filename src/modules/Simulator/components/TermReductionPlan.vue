<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseCard, BaseIcon } from '@/core/ui';

const props = defineProps<{
  monthlySalary: number;
  monthlyPayment: number;
}>();

type ApplyPlanPayload = { amount: number; interval: number };
const emit = defineEmits<{
  'apply-plan': [payload: ApplyPlanPayload];
}>();

// State
const rentalIncomeActive = ref(false);
const rentalIncome = ref(600);
const startMonth = ref(1);
const endMonth = ref(60);
const annualIncrease = ref(0);
const savingsPercentage = ref(50); // Default 50% of surplus for savings

// Computed
const surplus = computed(() => {
  if (!props.monthlySalary || !props.monthlyPayment) return 0;
  return Math.max(0, props.monthlySalary - props.monthlyPayment);
});

// Helper function to round to nearest 100
const roundToNearestHundred = (value: number): number => {
  return Math.round(value / 100) * 100;
};

// Simulation Logic
const simulationResult = computed(() => {
  if (!props.monthlyPayment || props.monthlyPayment === 0) return null;

  const rawTargetAmount = props.monthlyPayment * 2; // Dynamic: double the monthly payment
  const targetAmount = roundToNearestHundred(rawTargetAmount); // Round to nearest 100
  const savingsAllocation = surplus.value * (savingsPercentage.value / 100);

  // Simulate accumulation
  let accumulated = 0;
  let months = 0;
  let currentRentalAmount = rentalIncome.value;

  // Safety break
  while (accumulated < targetAmount && months < 120) {
    months++;

    // Calculate rental income for this month
    let monthlyRental = 0;
    if (rentalIncomeActive.value) {
      // Check range
      if (months >= startMonth.value && months <= endMonth.value) {
        monthlyRental = currentRentalAmount;
      }

      // Apply annual increase if enabled
      if (months % 12 === 0 && annualIncrease.value > 0) {
        currentRentalAmount = currentRentalAmount * (1 + annualIncrease.value / 100);
      }
    }

    accumulated += savingsAllocation + monthlyRental;
  }

  return {
    interval: months,
    targetAmount: targetAmount,
    monthlySavings:
      savingsAllocation +
      (rentalIncomeActive.value && 1 >= startMonth.value ? rentalIncome.value : 0), // Approximate first month savings for display
  };
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(val);
};

const applyPlan = () => {
  if (!simulationResult.value) return;

  emit('apply-plan', {
    amount: simulationResult.value.targetAmount,
    interval: simulationResult.value.interval,
  });
};
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <BaseIcon icon="mdi:rocket-launch" class="text-indigo-600" />
        Plan de Reducción de Plazo
      </h3>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-500">Coliving / Alquiler</span>
        <button
          @click="rentalIncomeActive = !rentalIncomeActive"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          :class="rentalIncomeActive ? 'bg-indigo-600' : 'bg-slate-300'"
        >
          <span
            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
            :class="rentalIncomeActive ? 'translate-x-4' : 'translate-x-0.5'"
          />
        </button>
      </div>
    </div>

    <!-- Rental Config (Conditional) -->
    <div
      v-if="rentalIncomeActive"
      class="bg-indigo-50 rounded-lg p-3 mb-4 border border-indigo-100 space-y-3"
    >
      <div>
        <label class="block text-xs font-bold text-indigo-800 uppercase mb-1"
          >Ingreso Mensual Extra</label
        >
        <div class="relative">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">S/</span>
          <input
            v-model.number="rentalIncome"
            type="number"
            class="w-full pl-6 pr-2 py-1.5 text-sm border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-900 font-bold bg-white"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[10px] font-bold text-indigo-700 uppercase mb-1"
            >Inicio (Mes)</label
          >
          <input
            v-model.number="startMonth"
            type="number"
            min="1"
            class="w-full px-2 py-1.5 text-sm border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-900 bg-white"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-indigo-700 uppercase mb-1"
            >Fin (Mes)</label
          >
          <input
            v-model.number="endMonth"
            type="number"
            min="1"
            class="w-full px-2 py-1.5 text-sm border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-indigo-700 uppercase mb-1"
          >Incremento Anual (%)</label
        >
        <div class="relative">
          <input
            v-model.number="annualIncrease"
            type="number"
            min="0"
            class="w-full px-2 py-1.5 text-sm border border-indigo-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-indigo-900 font-bold bg-white"
          />
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 text-xs">%</span>
        </div>
      </div>
    </div>

    <!-- Savings Percentage Configuration -->
    <div class="bg-white rounded-lg p-3 border border-slate-200 mt-4">
      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">
        Porcentaje de Ahorro del Excedente
      </label>
      <div class="relative">
        <input
          v-model.number="savingsPercentage"
          type="number"
          min="0"
          max="100"
          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold bg-white"
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
      </div>
      <p class="text-[10px] text-slate-400 mt-1">
        Porcentaje del excedente mensual destinado al ahorro (por defecto 50%)
      </p>
    </div>

    <!-- Simulation Summary -->
    <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-500">Excedente (Ingreso - Cuota)</span>
        <span class="font-bold text-slate-700">{{ formatCurrency(surplus) }}</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-500">Destinado al Ahorro ({{ savingsPercentage }}%)</span>
        <span class="font-bold text-emerald-600">{{
          formatCurrency(surplus * (savingsPercentage / 100))
        }}</span>
      </div>
      <div class="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
        <span class="text-slate-600 font-semibold">💰 Disponible para Vivir</span>
        <span class="font-bold text-indigo-600">{{
          formatCurrency(surplus * (1 - savingsPercentage / 100))
        }}</span>
      </div>

      <div class="mt-2 pt-2 border-t border-slate-200">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-slate-600">Meta (Doble Cuota)</span>
          <span class="text-xs font-bold text-slate-800">{{
            simulationResult ? formatCurrency(simulationResult.targetAmount) : '—'
          }}</span>
        </div>

        <div
          v-if="simulationResult"
          class="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-200"
        >
          <BaseIcon icon="mdi:clock-fast" class="text-indigo-500" />
          <span class="text-xs text-slate-600">
            Logras la meta cada
            <span class="font-bold text-indigo-700">{{ simulationResult.interval }} meses</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="applyPlan"
      class="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
    >
      <BaseIcon icon="mdi:check-decagram" />
      ¡Proceder con el Plan!
    </button>
  </BaseCard>
</template>
