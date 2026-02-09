import { computed, type Ref, unref } from 'vue';

export function usePaymentChart(
  loanAmount: Ref<number> | number,
  totalInterest: Ref<number> | number,
) {
  const chartData = computed(() => ({
    labels: ['Principal', 'Interés Total'],
    datasets: [
      {
        backgroundColor: ['#3b82f6', '#10b981'], // blue-500, green-500
        data: [unref(loanAmount), unref(totalInterest)],
      },
    ],
  }));

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          color: '#334155', // slate-700
        },
      },
    },
  };

  return {
    chartData,
    chartOptions,
  };
}
