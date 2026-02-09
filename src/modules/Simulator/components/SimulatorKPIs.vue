<script setup lang="ts">
import KpiCard from './KpiCard.vue';

defineProps<{
  monthlyPayment: number;
  termYears: number;
  salaryPercentage: number;
  riskStatus: {
    label: string;
    icon: string;
    bgClass: string;
    colorClass: string;
  };
  totalInterest: number;
  firstMonthBreakdown: { hasPrepayment: boolean };
  hasRefinancingEvents?: boolean;
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Monthly Payment -->
    <KpiCard
      title="Cuota Mensual"
      :value="formatCurrency(monthlyPayment)"
      icon="mdi:calendar-month"
      icon-class="text-blue-600"
    >
      <template #badge>
        <span v-if="firstMonthBreakdown.hasPrepayment" class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </template>

      <template #footer>
        <div
          v-if="!hasRefinancingEvents"
          class="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-1 rounded"
        >
          <iconify-icon icon="mdi:check-circle"></iconify-icon>
          Fija por {{ termYears }} años
        </div>

        <div v-else class="space-y-2">
          <div
            class="text-xs text-purple-600 flex items-center gap-1 font-medium bg-purple-50 px-2 py-1 rounded"
          >
            <iconify-icon icon="mdi:information"></iconify-icon>
            Esta es la cuota inicial
          </div>
          <p class="text-[10px] text-slate-500 leading-tight">
            Para ver la evolución de tus cuotas reducidas por compra de deuda, revisa la sección de
            <span class="font-semibold text-purple-600">Progresión de Pagos</span> abajo.
          </p>
        </div>
      </template>
    </KpiCard>

    <!-- Salary % -->
    <KpiCard
      title="% de Ingresos"
      :value="salaryPercentage.toFixed(1) + '%'"
      icon="mdi:wallet-membership"
      :icon-class="riskStatus.colorClass"
    >
      <template #value>
        <p class="text-2xl font-bold mt-1" :class="riskStatus.colorClass">
          {{ salaryPercentage.toFixed(1) }}%
        </p>
      </template>
      <template #footer>
        <div
          class="text-xs flex items-center gap-1 font-medium w-fit px-2 py-1 rounded transition-colors"
          :class="riskStatus.bgClass"
        >
          <iconify-icon :icon="riskStatus.icon"></iconify-icon>
          {{ riskStatus.label }}
        </div>
      </template>
    </KpiCard>

    <!-- Total Interest -->
    <KpiCard
      title="Interés Total"
      :value="formatCurrency(totalInterest)"
      icon="mdi:chart-pie"
      icon-class="text-indigo-600"
      subtext="Costo financiero del crédito"
    />
  </div>
</template>
