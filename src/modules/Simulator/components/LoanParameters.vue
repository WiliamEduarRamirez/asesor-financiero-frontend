<script setup lang="ts">
import { useLoanParameters } from '../composables/useLoanParameters';
import LoanRateConfig from './LoanRateConfig.vue';
import TermReductionPlan from './TermReductionPlan.vue';

const { price, downPayment, termYears, monthlySalary, downPaymentPercentage } = useLoanParameters();

defineProps<{
  monthlyPayment?: number;
}>();

type ApplyPlanPayload = { amount: number; interval: number };
const emit = defineEmits<{
  'apply-plan': [payload: ApplyPlanPayload];
}>();
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-md"
  >
    <h3 class="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <iconify-icon icon="mdi:form-select" class="text-blue-600"></iconify-icon>
      Parámetros del Préstamo
    </h3>

    <div class="space-y-5">
      <!-- Property Price -->
      <div>
        <label for="price" class="block text-sm font-medium text-slate-600 mb-1"
          >Precio del Inmueble (S/)</label
        >
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">S/</span>
          <input
            id="price"
            v-model.number="price"
            type="number"
            class="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-slate-800"
            placeholder="300000"
          />
        </div>
      </div>

      <!-- Down Payment -->
      <div>
        <label for="downPayment" class="block text-sm font-medium text-slate-600 mb-1"
          >Cuota Inicial (S/)</label
        >
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">S/</span>
          <input
            id="downPayment"
            v-model.number="downPayment"
            type="number"
            class="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-slate-800"
          />
        </div>
        <p class="text-xs text-slate-400 mt-1 text-right">{{ downPaymentPercentage }}% del valor</p>
      </div>

      <!-- Term (Plazo) -->
      <div>
        <label for="termYears" class="block text-sm font-medium text-slate-600 mb-1"
          >Plazo (Años)</label
        >
        <input
          id="termYears"
          v-model.number="termYears"
          type="number"
          class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-slate-800"
        />
      </div>

      <!-- Rate Configuration -->
      <LoanRateConfig />

      <!-- Salary for KPI -->
      <div class="pt-4 border-t border-slate-100">
        <label for="monthlySalary" class="block text-sm font-medium text-slate-600 mb-1"
          >Ingreso Mensual Neto (S/)</label
        >
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">S/</span>
          <input
            id="monthlySalary"
            v-model.number="monthlySalary"
            type="number"
            class="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-semibold text-slate-800"
          />
        </div>
      </div>

      <!-- Term Reduction Plan -->
      <TermReductionPlan
        :monthly-salary="monthlySalary"
        :monthly-payment="monthlyPayment || 0"
        @apply-plan="(payload) => emit('apply-plan', payload)"
      />
    </div>
  </div>
</template>
