<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import { toRefs } from 'vue';
import { usePaymentChart } from '../composables/usePaymentChart';
import { BaseTypography } from '@/core/ui';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  loanAmount: number;
  totalInterest: number;
}>();

const { loanAmount, totalInterest } = toRefs(props);
const { chartData, chartOptions } = usePaymentChart(loanAmount, totalInterest);
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col items-center justify-center relative"
  >
    <BaseTypography variant="h5" color="default" class="absolute top-6 left-6">
      Distribución de Pagos
    </BaseTypography>
    <div class="w-64 h-64">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
