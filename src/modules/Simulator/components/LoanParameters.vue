<script setup lang="ts">
import { useLoanParameters } from '../composables/useLoanParameters';
import LoanRateConfig from './LoanRateConfig.vue';
import { BaseCard, BaseInput, BaseIcon, BaseTypography } from '@/core/ui';

const { price, downPayment, termYears, monthlySalary, downPaymentPercentage } = useLoanParameters();

defineProps<{
  monthlyPayment?: number;
}>();
</script>

<template>
  <BaseCard>
    <BaseTypography variant="h5" color="default" class="mb-4 flex items-center gap-2">
      <BaseIcon icon="mdi:form-select" class="text-blue-600" />
      Parámetros del Préstamo
    </BaseTypography>

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
        <BaseTypography variant="caption" color="muted" class="mt-1 text-right"
          >{{ downPaymentPercentage }}% del valor</BaseTypography
        >
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
