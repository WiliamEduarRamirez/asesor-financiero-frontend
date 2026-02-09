<script setup lang="ts">
import { computed } from 'vue';
import type { ChartOptions, TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import type { AmortizationRow } from '../models/mortgage.model';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps<{
  schedule: AmortizationRow[];
  monthlySalary?: number;
}>();

// Helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(val);
};

// Compute Chart Data
const chartData = computed(() => {
  const labels = props.schedule.map((row) => `Mes ${row.month}`);

  const interestData = props.schedule.map((row) => row.interest);
  const fixedCapitalData = props.schedule.map((row) => row.capital - row.extraCapital);
  const totalCapitalData = props.schedule.map((row) => row.capital);

  // Income & Safety Data
  const salary = props.monthlySalary || 0;
  const incomeData = props.schedule.map(() => salary);
  const safetyData = props.schedule.map(() => salary * 0.3);

  const datasets: any[] = [
    {
      label: 'Interés',
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue-500 equivalent
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      data: interestData,
      fill: true,
      tension: 0.4,
      order: 3,
    },
    {
      label: 'Amortización Fija',
      borderColor: '#94a3b8', // Slate-400
      pointBackgroundColor: '#94a3b8',
      borderDash: [5, 5],
      data: fixedCapitalData,
      tension: 0.4,
      order: 2,
    },
    {
      label: 'Amortización Total (Inteligente)',
      borderColor: '#10b981', // Emerald-500
      pointBackgroundColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: totalCapitalData,
      fill: false,
      tension: 0.4,
      order: 1,
    },
  ];

  if (salary > 0) {
    datasets.push({
      label: 'Zona de Confort (30%)',
      borderColor: 'rgba(74, 222, 128, 0)', // Transparent border
      backgroundColor: 'rgba(74, 222, 128, 0.1)', // Green-400 equivalent very light
      pointRadius: 0,
      data: safetyData,
      fill: 'start', // Fill to bottom
      order: 5, // Back layer
    });

    datasets.push({
      label: 'Ingresos Netos',
      borderColor: '#f97316', // Orange-500
      borderDash: [2, 2],
      pointRadius: 0,
      borderWidth: 1,
      data: incomeData,
      fill: false,
      order: 4,
    });
  }

  return {
    labels,
    datasets,
  };
});

// Configure Chart Options
const chartOptions = computed<ChartOptions<'line'>>(() => {
  // Find Equilibrium Month (First month where Fixed Capital > Interest)
  const equilibriumRow = props.schedule.find(
    (row) => row.capital - row.extraCapital > row.interest,
  );
  const equilibriumMonth = equilibriumRow ? equilibriumRow.month : null;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            let label = context.dataset.label || '';
            // Skip showing value for safety zone tooltip if desired, or keep it
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
          afterBody: (tooltipItems: TooltipItem<'line'>[]) => {
            const lines: string[] = [];

            const item = tooltipItems[0];
            if (!item) return;
            const dataIndex = item.dataIndex;
            const row = props.schedule[dataIndex];
            if (!row) return;
            const month = row.month;

            // Equilibrium Message
            if (equilibriumMonth && month === equilibriumMonth) {
              lines.push(
                `\n🎉 ¡Victoria Financiera!\nEn el mes ${month}, tu cuota fija ahora construye\nmás patrimonio del que regalas en intereses.`,
              );
            }

            // Payment Ratio Message
            if (props.monthlySalary && props.monthlySalary > 0) {
              const paymentRatio = (row.payment / props.monthlySalary) * 100;
              lines.push(`\n📊 Ratio de Pago: ${paymentRatio.toFixed(1)}% de tus ingresos`);

              // High Payment Warning/Info
              if (row.payment > props.monthlySalary) {
                lines.push(`🚀 Inversión de Capital Extra detectada`);
              }
            }

            return lines.join('\n');
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value: string | number) => {
            const val = Number(value);
            if (val >= 1000) return `S/ ${val / 1000}k`;
            return `S/ ${val}`;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxTicksLimit: 12, // Show roughly one per year if many months
        },
      },
    },
  };
});
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <iconify-icon icon="mdi:scale-balance" class="text-emerald-500" width="24"></iconify-icon>
          Punto de Equilibrio Financiero
        </h3>
        <p class="text-sm text-slate-500 mt-1">
          Visualiza el momento exacto donde dejas de trabajar para el banco y empiezas a construir
          tu patrimonio.
        </p>
      </div>
    </div>

    <div class="h-[400px] w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
