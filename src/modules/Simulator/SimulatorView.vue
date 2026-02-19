<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMortgageStore } from './stores/useMortgageStore';
import { storeToRefs } from 'pinia';
import AmortizationTable from './components/AmortizationTable.vue';
import { useMortgageCalculator } from './composables/useMortgageCalculator';
import { usePrepayments } from './composables/usePrepayments';
import { useDebtOptimization } from './composables/useDebtOptimization';
import PrepaymentStrategy from './components/PrepaymentStrategy.vue';
import LoanParameters from './components/LoanParameters.vue';
import SimulatorKPIs from './components/SimulatorKPIs.vue';
import StrategyImpactCard from './components/StrategyImpactCard.vue';
import PaymentDistributionChart from './components/PaymentDistributionChart.vue';
import EquilibriumChart from './components/EquilibriumChart.vue';
import PaymentProgression from './components/PaymentProgression.vue';
import TermReductionPlan from './components/TermReductionPlan.vue';
import DebtOptimization from './components/DebtOptimization.vue';
import { BaseTabs } from '@/core/ui';
import { useRates } from './composables/useRates';

useRates(); // Initialize rates logic

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

// Debt Optimization
const {
  refinancingEvents,
  addEvent: addRefinancingEvent,
  removeEvent: removeRefinancingEvent,
  updateEvent: updateRefinancingEvent,
} = useDebtOptimization();

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
  firstMonthBreakdown,
  globalStrategySummary,
  stopOnCrossover,
  aggressiveContinuity,
  calculateOptimalPrepayment,
  pivotMonth,
  maintenanceAmount,
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
  refinancingEvents,
});

// Computed for UI flags
const hasRefinancingEvents = computed(() => refinancingEvents.value.length > 0);

// Handle Term Reduction Plan
const handleApplyPlan = (payload: { amount: number; interval: number }) => {
  // Clear existing prepayments
  while (prepayments.value.length > 0) {
    removePrepayment(0);
  }

  // Add new recurring prepayment based on plan
  // Start at interval + 1 (e.g., if saving takes 3 months, first payment is month 4)
  // Interval is also + 1 to account for full cycle (save 3 months, pay on 4th, repeat)
  addRecurringPrepayment({
    amount: payload.amount,
    month: payload.interval + 1,
    frequency: 'recurring',
    interval: payload.interval + 1,
  });

  // Activate intelligent strategy with aggressive continuity
  stopOnCrossover.value = true;
  aggressiveContinuity.value = true;
};

const tabs = [
  { value: 'config', label: 'Resumen Inicial', icon: 'heroicons:document-text' },
  { value: 'strategies', label: 'Estrategias de Pago', icon: 'heroicons:banknotes' },
  { value: 'table', label: 'Análisis Detallado', icon: 'heroicons:table-cells' },
];
const activeTab = ref('config');
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Hipoteca Inteligente</h2>
      <span
        class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200"
      >
        Simulación en Tiempo Real
      </span>
    </div>

    <!-- Tabs Navigation -->
    <BaseTabs v-model="activeTab" :tabs="tabs" class="mb-4" />

    <!-- Tab 1: Configuration -->
    <div
      v-if="activeTab === 'config'"
      class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div class="lg:col-span-5 space-y-6">
        <LoanParameters :monthly-payment="monthlyPayment" />
      </div>
      <div class="lg:col-span-7 space-y-6">
        <SimulatorKPIs
          :monthly-payment="monthlyPayment"
          :term-years="termYears"
          :salary-percentage="salaryPercentage"
          :risk-status="riskStatus"
          :total-interest="totalInterest"
          :first-month-breakdown="firstMonthBreakdown"
          :has-refinancing-events="hasRefinancingEvents"
        />
        <PaymentDistributionChart :loan-amount="loanAmount" :total-interest="totalInterest" />
      </div>
    </div>

    <!-- Tab 2: Strategies -->
    <div
      v-if="activeTab === 'strategies'"
      class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div class="lg:col-span-5 space-y-6">
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
          v-model:stop-on-crossover="stopOnCrossover"
          v-model:aggressive-continuity="aggressiveContinuity"
          :calculate-optimal-prepayment="calculateOptimalPrepayment"
          :pivot-month="pivotMonth"
          :maintenance-amount="maintenanceAmount"
          @add-prepayment="addPrepayment"
          @add-recurring-prepayment="addRecurringPrepayment"
          @remove-prepayment="removePrepayment"
        />

        <TermReductionPlan
          :monthly-salary="monthlySalary"
          :monthly-payment="monthlyPayment || 0"
          @apply-plan="handleApplyPlan"
        />

        <DebtOptimization
          :refinancing-events="refinancingEvents || []"
          @add-event="addRefinancingEvent"
          @remove-event="removeRefinancingEvent"
          @update-event="updateRefinancingEvent"
        />
      </div>
      <div class="lg:col-span-7 space-y-6">
        <StrategyImpactCard :summary="globalStrategySummary" :term-years="termYears" />
        <PaymentProgression
          :refinancing-events="refinancingEvents"
          :initial-monthly-payment="monthlyPayment"
          :initial-rate="annualRate"
          :term-months="termYears * 12"
          :amortization-schedule="amortizationSchedule"
        />
      </div>
    </div>

    <!-- Tab 3: Detailed Analysis -->
    <div
      v-if="activeTab === 'table'"
      class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <EquilibriumChart :schedule="amortizationSchedule" :monthly-salary="monthlySalary" />
      <AmortizationTable :schedule="amortizationSchedule" />
    </div>
  </div>
</template>
