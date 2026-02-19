<script setup lang="ts">
import { useLoanParameters } from '../composables/useLoanParameters';
import LoanRateConfig from './LoanRateConfig.vue';
import { BaseCard, BaseInput, BaseIcon } from '@/core/ui';

const { price, downPayment, termYears, monthlySalary, downPaymentPercentage } = useLoanParameters();

defineProps<{
  monthlyPayment?: number;
}>();
</script>

<template>
  <BaseCard>
    <h3 class="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <BaseIcon icon="mdi:form-select" class="text-blue-600" />
      Parámetros del Préstamo
    </h3>

    <div class="space-y-5">
      <!-- Property Price -->
      <BaseInput
        id="price"
        v-model.number="price"
        type="number"
        label="Precio del Inmueble (S/)"
        prefix="S/"
        placeholder="300000"
      />

      <!-- Down Payment -->
      <div>
        <BaseInput
          id="downPayment"
          v-model.number="downPayment"
          type="number"
          label="Cuota Inicial (S/)"
          prefix="S/"
        />
        <p class="text-xs text-slate-400 mt-1 text-right">{{ downPaymentPercentage }}% del valor</p>
      </div>

      <!-- Term (Plazo) -->
      <BaseInput id="termYears" v-model.number="termYears" type="number" label="Plazo (Años)" />

      <!-- Rate Configuration -->
      <LoanRateConfig />

      <!-- Salary for KPI -->
      <div class="pt-4 border-t border-slate-100">
        <BaseInput
          id="monthlySalary"
          v-model.number="monthlySalary"
          type="number"
          label="Ingreso Mensual Neto (S/)"
          prefix="S/"
          class="bg-slate-50"
        />
      </div>
    </div>
  </BaseCard>
</template>
