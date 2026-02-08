import { computed, type Ref } from 'vue';

import type { AmortizationRow } from '../models/mortgage.model';

interface MortgageCalculatorParams {
  price: Ref<number>;
  downPayment: Ref<number>;
  annualRate: Ref<number>; // TEA
  termYears: Ref<number>;
  monthlySalary: Ref<number>;
  desgravamenRate: Ref<number>; // Monthly %
  fireInsuranceRate: Ref<number>; // Monthly %
}

export function useMortgageCalculator({
  price,
  downPayment,
  annualRate,
  termYears,
  monthlySalary,
  desgravamenRate,
  fireInsuranceRate,
}: MortgageCalculatorParams) {
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

  const amortizationSchedule = computed<AmortizationRow[]>(() => {
    const schedule: AmortizationRow[] = [];
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
      const desgravamenRateVal = desgravamenRate.value || 0;
      const desgravamen = balance * (desgravamenRateVal / 100);

      const totalPayment = financialPayment + desgravamen + fireInsurance;

      balance -= capital;
      if (balance < 0) balance = 0;

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
    loanAmount,
    monthlyRate,
    financialMonthlyPayment,
    amortizationSchedule,
    monthlyPayment: firstMonthPayment, // expose for backward compatibility/UI
    totalPayment,
    totalInterest,
    salaryPercentage,
    isRisky,
  };
}
