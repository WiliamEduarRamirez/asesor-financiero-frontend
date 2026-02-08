<script setup lang="ts">
import { useMortgageStore } from './stores/useMortgageStore';
import { storeToRefs } from 'pinia';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { computed } from 'vue';
import AmortizationTable from './components/AmortizationTable.vue';
import { useMortgageCalculator } from './composables/useMortgageCalculator';
import { usePrepayments } from './composables/usePrepayments';
import PrepaymentStrategy from './components/PrepaymentStrategy.vue';

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

const { prepayments, prepaymentStrategy, addPrepayment, addRecurringPrepayment, removePrepayment } =
  usePrepayments();

// Logic moved to composable
const {
  monthlyPayment,
  totalInterest,
  salaryPercentage,
  minSalaryPercentage,
  riskStatus,
  amortizationSchedule,
  totalInterestSavings,
  monthsSaved,
  validatePrepayment,
  compareStrategies,
  firstMonthBreakdown, // Still used for Month 1 badge? Maybe not.
  globalStrategySummary,
} = useMortgageCalculator({
  price,
  downPayment,
  annualRate,
  termYears,
  monthlySalary,
  desgravamenRate,
  fireInsuranceRate,
  prepayments,
  prepaymentStrategy,
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
            <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 mt-4">
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

        <!-- Prepayment Strategy Component -->
        <PrepaymentStrategy
          v-model:prepayments="prepayments"
          v-model:prepaymentStrategy="prepaymentStrategy"
          :total-interest-savings="totalInterestSavings"
          :months-saved="monthsSaved"
          :salary-percentage="salaryPercentage"
          :min-salary-percentage="minSalaryPercentage"
          :term-years="termYears"
          :validate-prepayment="validatePrepayment"
          :compare-strategies="compareStrategies"
          @add-prepayment="addPrepayment"
          @add-recurring-prepayment="addRecurringPrepayment"
          @remove-prepayment="removePrepayment"
        />
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
            <p class="text-sm font-medium text-slate-500 relative inline-flex items-center gap-2">
              Cuota Mensual
              <span v-if="firstMonthBreakdown.hasPrepayment" class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </p>
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
                :class="riskStatus.colorClass"
              ></iconify-icon>
            </div>
            <p class="text-sm font-medium text-slate-500">% de Ingresos</p>
            <p class="text-2xl font-bold mt-1" :class="riskStatus.colorClass">
              {{ salaryPercentage.toFixed(1) }}%
            </p>
            <div
              class="text-xs mt-2 flex items-center gap-1 font-medium w-fit px-2 py-1 rounded transition-colors"
              :class="riskStatus.bgClass"
            >
              <iconify-icon :icon="riskStatus.icon"></iconify-icon>
              {{ riskStatus.label }}
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

        <!-- NEW: Global Strategy Detail Card -->
        <div
          v-if="globalStrategySummary.hasStrategy"
          class="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden transition-all hover:shadow-md"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <iconify-icon icon="mdi:finance" width="24"></iconify-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800">Resumen Global de Estrategia</h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1"
                  >
                    <iconify-icon icon="mdi:lightning-bolt" width="10"></iconify-icon>
                    Ejecutando {{ globalStrategySummary.operationsCount }} inyecciones
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left: Financial Breakdown -->
            <div class="space-y-4">
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center text-slate-600">
                  <span>Total Capital Inyectado</span>
                  <span class="font-bold text-slate-800">{{
                    formatCurrency(globalStrategySummary.totalCapitalInjected)
                  }}</span>
                </div>
                <div class="flex justify-between items-center text-slate-500 text-xs">
                  <span>Total Impuestos (ITF) Proyectados</span>
                  <span>{{ formatCurrency(globalStrategySummary.totalITF) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span class="font-bold text-emerald-800">Inversión Total en Amortización</span>
                  <span class="text-xl font-bold text-emerald-700">{{
                    formatCurrency(globalStrategySummary.totalInvestment)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Impact & Education -->
            <div class="space-y-4">
              <!-- Interest Comparison -->
              <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p class="text-[10px] uppercase font-bold text-slate-400 mb-2 text-center">
                  Interés Total a Pagar
                </p>
                <div class="flex items-end justify-between px-2">
                  <div class="text-center">
                    <p class="text-xs text-slate-500 line-through decoration-red-400 decoration-2">
                      {{ formatCurrency(globalStrategySummary.originalInterest) }}
                    </p>
                    <p class="text-[10px] text-slate-400">Original</p>
                  </div>
                  <div class="mb-1">
                    <iconify-icon
                      icon="mdi:arrow-right-bold"
                      class="text-slate-300"
                      width="16"
                    ></iconify-icon>
                  </div>
                  <div class="text-center">
                    <p class="text-sm font-bold text-emerald-600">
                      {{ formatCurrency(globalStrategySummary.strategyInterest) }}
                    </p>
                    <p class="text-[10px] text-emerald-600">Con Estrategia</p>
                  </div>
                </div>
                <div class="mt-2 text-center">
                  <span
                    class="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full shadow-sm shadow-emerald-200"
                  >
                    Ahorras {{ formatCurrency(globalStrategySummary.totalSavings) }}
                  </span>
                </div>
              </div>

              <!-- Educational Message -->
              <div
                class="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 leading-relaxed relative"
              >
                <div class="absolute top-3 left-3 text-blue-400">
                  <iconify-icon icon="mdi:lightbulb-on" width="16"></iconify-icon>
                </div>
                <div class="pl-6">
                  <span class="font-bold block mb-1 text-blue-900">Impacto Inteligente</span>
                  <span v-if="globalStrategySummary.newEndDate">
                    Tu deuda terminaría en el mes {{ globalStrategySummary.newEndDate }} en lugar
                    del {{ termYears * 12 }}, liberándote
                    {{ termYears * 12 - globalStrategySummary.newEndDate }} meses antes.
                  </span>
                  <span v-else>
                    Cada sol adelantado reduce directamente tu deuda, bajando los intereses futuros
                    y protegiendo tu patrimonio.
                  </span>
                </div>
              </div>
            </div>
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
