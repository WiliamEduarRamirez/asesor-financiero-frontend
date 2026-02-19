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
import {
  BaseTabs,
  BaseTab,
  BaseTabsWindow,
  BaseTabsWindowItem,
  BaseTypography,
  BaseIcon,
} from '@/core/ui';
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

const activeTab = ref('config');
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
      <BaseTypography variant="h2" class="text-slate-800 tracking-tight text-2xl sm:text-3xl"
        >Hipoteca Inteligente</BaseTypography
      >
      <span
        class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200"
      >
        Simulación en Tiempo Real
      </span>
    </div>

    <!-- Tabs Navigation -->
    <BaseTabs v-model="activeTab" class="mb-4">
      <BaseTab value="config">
        <BaseIcon icon="heroicons:document-text" class="mr-2 opacity-80" />
        Resumen Inicial
      </BaseTab>
      <BaseTab value="strategies">
        <BaseIcon icon="heroicons:banknotes" class="mr-2 opacity-80" />
        Estrategias de Pago
      </BaseTab>
      <BaseTab value="table">
        <BaseIcon icon="heroicons:table-cells" class="mr-2 opacity-80" />
        Análisis Detallado
      </BaseTab>
    </BaseTabs>

    <!-- Tab Windows Content -->
    <BaseTabsWindow v-model="activeTab">
      <!-- Tab 1: Configuration -->
      <BaseTabsWindowItem value="config" class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
        <div class="lg:col-span-5 xl:col-span-4 space-y-6">
          <LoanParameters :monthly-payment="monthlyPayment" />
        </div>
        <div class="lg:col-span-7 xl:col-span-8 space-y-6">
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
      </BaseTabsWindowItem>

      <!-- Tab 2: Strategies -->
      <BaseTabsWindowItem
        value="strategies"
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8"
      >
        <div class="lg:col-span-5 xl:col-span-4 space-y-6">
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
        <div class="lg:col-span-7 xl:col-span-8 space-y-6">
          <StrategyImpactCard :summary="globalStrategySummary" :term-years="termYears" />
          <PaymentProgression
            :refinancing-events="refinancingEvents"
            :initial-monthly-payment="monthlyPayment"
            :initial-rate="annualRate"
            :term-months="termYears * 12"
            :amortization-schedule="amortizationSchedule"
          />
        </div>
      </BaseTabsWindowItem>

      <!-- Tab 3: Detailed Analysis -->
      <BaseTabsWindowItem value="table" class="space-y-8">
        <EquilibriumChart :schedule="amortizationSchedule" :monthly-salary="monthlySalary" />
        <AmortizationTable :schedule="amortizationSchedule" />
      </BaseTabsWindowItem>
    </BaseTabsWindow>
  </div>
</template>
