<script setup lang="ts">
import { useMortgageStore } from './stores/useMortgageStore';
import { storeToRefs } from 'pinia';
import AmortizationTable from './components/AmortizationTable.vue';
import { useMortgageCalculator } from './composables/useMortgageCalculator';
import { usePrepayments } from './composables/usePrepayments';
import PrepaymentStrategy from './components/PrepaymentStrategy.vue';
import LoanParameters from './components/LoanParameters.vue';
import SimulatorKPIs from './components/SimulatorKPIs.vue';
import StrategyImpactCard from './components/StrategyImpactCard.vue';
import PaymentDistributionChart from './components/PaymentDistributionChart.vue';
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
});
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
        <!-- Loan Parameters Component -->
        <LoanParameters />

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
          v-model:stop-on-crossover="stopOnCrossover"
          v-model:aggressive-continuity="aggressiveContinuity"
          :calculate-optimal-prepayment="calculateOptimalPrepayment"
          :pivot-month="pivotMonth"
          :maintenance-amount="maintenanceAmount"
          @add-prepayment="addPrepayment"
          @add-recurring-prepayment="addRecurringPrepayment"
          @remove-prepayment="removePrepayment"
        />
      </div>

      <!-- Right Column: KPIs & Charts -->
      <div class="lg:col-span-7 space-y-6">
        <!-- KPI Cards -->
        <SimulatorKPIs
          :monthly-payment="monthlyPayment"
          :term-years="termYears"
          :salary-percentage="salaryPercentage"
          :risk-status="riskStatus"
          :total-interest="totalInterest"
          :first-month-breakdown="firstMonthBreakdown"
        />

        <!-- Global Strategy Detail Card -->
        <StrategyImpactCard :summary="globalStrategySummary" :term-years="termYears" />

        <!-- Chart -->
        <PaymentDistributionChart :loan-amount="loanAmount" :total-interest="totalInterest" />
      </div>
    </div>

    <!-- Amortization Table -->
    <AmortizationTable :schedule="amortizationSchedule" />
  </div>
</template>
