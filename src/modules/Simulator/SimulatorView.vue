<script setup lang="ts">
import { useMortgageStore } from './stores/useMortgageStore';
import { storeToRefs } from 'pinia';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { computed } from 'vue';
import AmortizationTable from './components/AmortizationTable.vue';
import { useMortgageCalculator } from './composables/useMortgageCalculator';

ChartJS.register(ArcElement, Tooltip, Legend);

const store = useMortgageStore();
const {
  price,
  downPayment,
  annualRate,
  termYears,
  monthlySalary,
  loanAmount,
  desgravamenRate,
  fireInsuranceRate,
} = storeToRefs(store);

// Logic moved to composable
const { monthlyPayment, totalInterest, salaryPercentage, isRisky, amortizationSchedule } =
  useMortgageCalculator({
    price,
    downPayment,
    annualRate,
    termYears,
    monthlySalary,
    desgravamenRate,
    fireInsuranceRate,
  });

const chartData = computed(() => ({
  labels: ['Principal', 'Interés Total'],
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#10b981'], // blue-500, green-500
      data: [loanAmount.value, totalInterest.value],
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Hipoteca Inteligente</h2>
      <span
        class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200"
      >
        Simulación en Tiempo Real
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Form -->
      <div class="lg:col-span-5 space-y-6">
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
              <p class="text-xs text-slate-400 mt-1 text-right">
                {{ ((downPayment / price) * 100).toFixed(1) }}% del valor
              </p>
            </div>

            <!-- Interest Rate & Term -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="annualRate" class="block text-sm font-medium text-slate-600 mb-1"
                  >TEA (%)</label
                >
                <div class="relative">
                  <input
                    id="annualRate"
                    v-model.number="annualRate"
                    type="number"
                    step="0.1"
                    class="w-full pl-4 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-semibold text-slate-800"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
              </div>
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
            </div>

            <!-- Insurances -->
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label for="desgravamenRate" class="block text-xs font-medium text-slate-500 mb-1"
                  >Seg. Desgravamen (Mensual %)</label
                >
                <div class="relative">
                  <input
                    id="desgravamenRate"
                    v-model.number="desgravamenRate"
                    type="number"
                    step="0.001"
                    class="w-full pl-3 pr-6 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                    >%</span
                  >
                </div>
              </div>
              <div>
                <label for="fireInsuranceRate" class="block text-xs font-medium text-slate-500 mb-1"
                  >Seg. Inmueble (Mensual %)</label
                >
                <div class="relative">
                  <input
                    id="fireInsuranceRate"
                    v-model.number="fireInsuranceRate"
                    type="number"
                    step="0.001"
                    class="w-full pl-3 pr-6 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                    >%</span
                  >
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </div>

      <!-- Right Column: KPIs & Charts -->
      <div class="lg:col-span-7 space-y-6">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Monthly Payment -->
          <div
            class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div
              class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
            >
              <iconify-icon
                icon="mdi:calendar-month"
                width="60"
                class="text-blue-600"
              ></iconify-icon>
            </div>
            <p class="text-sm font-medium text-slate-500">Cuota Mensual</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">
              {{ formatCurrency(monthlyPayment) }}
            </p>
            <div
              class="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-1 rounded"
            >
              <iconify-icon icon="mdi:check-circle"></iconify-icon>
              Fija por {{ termYears }} años
            </div>
          </div>

          <!-- Salary % -->
          <div
            class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div
              class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
            >
              <iconify-icon
                icon="mdi:wallet-membership"
                width="60"
                :class="isRisky ? 'text-red-500' : 'text-green-500'"
              ></iconify-icon>
            </div>
            <p class="text-sm font-medium text-slate-500">% de Ingresos</p>
            <p class="text-2xl font-bold mt-1" :class="isRisky ? 'text-red-600' : 'text-slate-900'">
              {{ salaryPercentage.toFixed(1) }}%
            </p>
            <div
              v-if="isRisky"
              class="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium bg-red-50 w-fit px-2 py-1 rounded"
            >
              <iconify-icon icon="mdi:alert-circle"></iconify-icon>
              Alto Riesgo (>30%)
            </div>
            <div
              v-else
              class="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-1 rounded"
            >
              <iconify-icon icon="mdi:thumb-up"></iconify-icon>
              Saludable
            </div>
          </div>

          <!-- Total Interest -->
          <div
            class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div
              class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
            >
              <iconify-icon icon="mdi:chart-pie" width="60" class="text-indigo-600"></iconify-icon>
            </div>
            <p class="text-sm font-medium text-slate-500">Interés Total</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">
              {{ formatCurrency(totalInterest) }}
            </p>
            <p class="text-xs text-slate-400 mt-2">Costo financiero del crédito</p>
          </div>
        </div>

        <!-- Chart -->
        <div
          class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col items-center justify-center relative"
        >
          <h3 class="absolute top-6 left-6 text-lg font-semibold text-slate-700">
            Distribución de Pagos
          </h3>
          <div class="w-64 h-64">
            <Doughnut :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Amortization Table -->
    <AmortizationTable :schedule="amortizationSchedule" />
  </div>
</template>
