import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useMortgageStore = defineStore('mortgage', () => {
  // State
  const price = ref(300000); // Default value
  const downPayment = ref(60000); // Default 20%
  const annualRate = ref(8.5); // Default TEA
  const termYears = ref(20); // Default years
  const monthlySalary = ref(5000); // Added for KPI calculation

  // Getters / Computed
  const loanAmount = computed(() => price.value - downPayment.value);

  // French Amortization Calculation
  const monthlyPayment = computed(() => {
    const principal = loanAmount.value;
    const monthlyRate = annualRate.value / 100 / 12;
    const numberOfPayments = termYears.value * 12;

    if (monthlyRate === 0) return principal / numberOfPayments;

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
    const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

    return principal * (numerator / denominator);
  });

  const totalPayment = computed(() => monthlyPayment.value * (termYears.value * 12));
  const totalInterest = computed(() => totalPayment.value - loanAmount.value);

  // KPIs
  const salaryPercentage = computed(() => {
    if (monthlySalary.value === 0) return 0;
    return (monthlyPayment.value / monthlySalary.value) * 100;
  });

  const isRisky = computed(() => salaryPercentage.value > 30); // Standard rule: >30% income is risky

  return {
    // State
    price,
    downPayment,
    annualRate,
    termYears,
    monthlySalary,
    // Computed
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    salaryPercentage,
    isRisky,
  };
});
