import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useMortgageStore = defineStore('mortgage', () => {
  // State
  const price = ref(300000); // Default value
  const downPayment = ref(60000); // Default 20%
  const annualRate = ref(8.5); // TEA
  const termYears = ref(20); // Default years
  const monthlySalary = ref(6500); // Added for KPI calculation

  // Insurances (Monthly Rates %)
  const desgravamenRate = ref(0.049); // Initial rough average
  const fireInsuranceRate = ref(0.029); // Initial rough average

  // Getters / Computed
  const loanAmount = computed(() => price.value - downPayment.value);

  // Financial Calculations
  const monthlyRate = computed(() => {
    // Convert TEA to TEM (Geometric)
    // Formula: (1 + TEA)^(1/12) - 1
    return Math.pow(1 + annualRate.value / 100, 1 / 12) - 1;
  });

  const financialMonthlyPayment = computed(() => {
    const principal = loanAmount.value;
    const rate = monthlyRate.value;
    const numberOfPayments = termYears.value * 12;

    if (rate === 0) return principal / numberOfPayments;

    const numerator = rate * Math.pow(1 + rate, numberOfPayments);
    const denominator = Math.pow(1 + rate, numberOfPayments) - 1;

    return principal * (numerator / denominator);
  });

  const amortizationSchedule = computed(() => {
    const schedule = [];
    let balance = loanAmount.value;
    const rate = monthlyRate.value;
    const financialPayment = financialMonthlyPayment.value;
    const totalMonths = termYears.value * 12;

    // Fixed Fire Insurance (based on Property Value)
    const fireInsurance = price.value * (fireInsuranceRate.value / 100);

    for (let i = 1; i <= totalMonths; i++) {
      const interest = balance * rate;
      const capital = financialPayment - interest;

      // Desgravamen (based on Balance)
      const desgravamen = balance * (desgravamenRate.value / 100);

      const totalPayment = financialPayment + desgravamen + fireInsurance;

      balance -= capital;
      if (balance < 0) balance = 0;

      // Avoid negative capital in last installment adjustments if any (simple guarding)

      schedule.push({
        month: i,
        payment: totalPayment,
        financialPayment: financialPayment,
        interest: interest,
        capital: capital,
        desgravamen: desgravamen,
        fireInsurance: fireInsurance,
        balance: balance,
      });
    }
    return schedule;
  });

  // KPIs
  // Use the FIRST month's total payment for KPIs as it's the highest/initial burden
  const firstMonthPayment = computed(() => {
    if (amortizationSchedule.value.length === 0) return 0;
    return amortizationSchedule.value[0]?.payment ?? 0;
  });

  const totalPayment = computed(() => {
    return amortizationSchedule.value.reduce((acc, curr) => acc + curr.payment, 0);
  });

  const totalInterest = computed(() => {
    return amortizationSchedule.value.reduce((acc, curr) => acc + curr.interest, 0);
  });

  const salaryPercentage = computed(() => {
    if (monthlySalary.value === 0) return 0;
    return (firstMonthPayment.value / monthlySalary.value) * 100;
  });

  const isRisky = computed(() => salaryPercentage.value > 30);

  return {
    // State
    price,
    downPayment,
    annualRate,
    termYears,
    monthlySalary,
    desgravamenRate,
    fireInsuranceRate,
    // Computed
    loanAmount,
    monthlyPayment: firstMonthPayment, // Expose total payment for backward cap
    financialMonthlyPayment,
    totalPayment,
    totalInterest,
    salaryPercentage,
    isRisky,
    amortizationSchedule,
  };
});
