import { computed, type Ref, unref } from 'vue';

import type { AmortizationRow, Prepayment, PrepaymentStrategy } from '../models/mortgage.model';

interface MortgageCalculatorParams {
  price: Ref<number>;
  downPayment: Ref<number>;
  annualRate: Ref<number>; // TEA
  termYears: Ref<number>;
  monthlySalary: Ref<number>;
  desgravamenRate: Ref<number>; // Monthly %
  fireInsuranceRate: Ref<number>; // Monthly %
  prepayments?: Ref<Prepayment[]>;
  prepaymentStrategy?: Ref<PrepaymentStrategy>;
}

export function useMortgageCalculator({
  price,
  downPayment,
  annualRate,
  termYears,
  monthlySalary,
  desgravamenRate,
  fireInsuranceRate,
  prepayments,
  prepaymentStrategy,
}: MortgageCalculatorParams) {
  // Getters / Computed
  const loanAmount = computed(() => price.value - downPayment.value);

  // Financial Calculations
  const monthlyRate = computed(() => {
    // Convert TEA to TEM (Geometric)
    // Formula: (1 + TEA)^(1/12) - 1
    return Math.pow(1 + annualRate.value / 100, 1 / 12) - 1;
  });

  // Base calculation function
  const calculatePMT = (principal: number, rate: number, months: number) => {
    if (months <= 0 || principal <= 0) return 0;
    if (rate === 0) return principal / months;
    const numerator = rate * Math.pow(1 + rate, months);
    const denominator = Math.pow(1 + rate, months) - 1;
    return principal * (numerator / denominator);
  };

  const initialFinancialMonthlyPayment = computed(() => {
    return calculatePMT(loanAmount.value, monthlyRate.value, termYears.value * 12);
  });

  // Helper to calculate applicable extra payment for a given month
  const calculateExtraPayment = (prepayments: Prepayment[], currentMonth: number): number => {
    let totalExtra = 0;
    prepayments.forEach((p) => {
      let isApplicable = false;
      if (p.frequency === 'unique') {
        isApplicable = p.month === currentMonth;
      } else if (p.frequency === 'recurring') {
        isApplicable = currentMonth >= p.month && (currentMonth - p.month) % 12 === 0;
      }

      if (isApplicable) {
        totalExtra += p.amount;
      }
    });
    return totalExtra;
  };

  // Helper to standard financial formula
  const generateSchedule = (
    currentPrepayments: Prepayment[],
    currentStrategy: PrepaymentStrategy,
  ): AmortizationRow[] => {
    const schedule: AmortizationRow[] = [];
    let balance = loanAmount.value;
    const rate = monthlyRate.value;
    let currentFinancialPayment = initialFinancialMonthlyPayment.value;

    const totalMonths = termYears.value * 12;

    // Fixed Fire Insurance (based on Property Value)
    const fireInsurance = price.value * (fireInsuranceRate.value / 100);
    const desgravamenRateVal = desgravamenRate.value || 0;

    for (let i = 1; i <= totalMonths; i++) {
      if (balance <= 0.01) break; // Loan paid off

      const interest = balance * rate;
      let capital = currentFinancialPayment - interest;

      // Ensure capital doesn't exceed balance for the last payment
      if (capital > balance) {
        capital = balance;
        currentFinancialPayment = interest + capital;
      }

      // Desgravamen (based on reduced Balance)
      const desgravamen = balance * (desgravamenRateVal / 100);

      // Calculate applicable extra capital
      const extraCapital = calculateExtraPayment(currentPrepayments, i);

      let nextBalance = balance - capital;

      // Apply extra capital
      if (extraCapital > 0) {
        nextBalance -= extraCapital;
        capital += extraCapital; // For display

        // STRATEGY RECALCULATION
        if (currentStrategy === 'reduce_payment' && nextBalance > 0) {
          const remainingMonths = totalMonths - i;
          if (remainingMonths > 0) {
            currentFinancialPayment = calculatePMT(nextBalance, rate, remainingMonths);
          } else {
            currentFinancialPayment = 0;
          }
        }
      }

      const rowPayment = currentFinancialPayment + desgravamen + fireInsurance + extraCapital;

      balance = nextBalance;
      if (balance < 0) balance = 0;

      schedule.push({
        month: i,
        payment: rowPayment,
        financialPayment: currentFinancialPayment,
        interest: interest,
        capital: capital,
        desgravamen: desgravamen,
        fireInsurance: fireInsurance,
        balance: balance,
      });
    }
    return schedule;
  };

  // 1. Baseline Schedule (No prepayments)
  const baselineSchedule = computed(() => generateSchedule([], 'reduce_term'));

  // 2. Actual Schedule (With prepayments)
  const amortizationSchedule = computed(() => {
    return generateSchedule(
      prepayments ? unref(prepayments) : [],
      prepaymentStrategy ? unref(prepaymentStrategy) : 'reduce_term',
    );
  });

  // KPIs
  const firstMonthPayment = computed(() => {
    if (amortizationSchedule.value.length === 0) return 0;
    const row = amortizationSchedule.value[0];
    const extra = prepayments?.value?.find((p) => p.month === 1)?.amount || 0;
    return (row?.payment ?? 0) - extra;
  });

  const totalPayment = computed(() => {
    return amortizationSchedule.value.reduce((acc, curr) => acc + curr.payment, 0);
  });

  const totalInterest = computed(() => {
    return amortizationSchedule.value.reduce((acc, curr) => acc + curr.interest, 0);
  });

  const baselineTotalInterest = computed(() => {
    return baselineSchedule.value.reduce((acc, curr) => acc + curr.interest, 0);
  });

  const totalInterestSavings = computed(() => {
    return Math.max(0, baselineTotalInterest.value - totalInterest.value);
  });

  const monthsSaved = computed(() => {
    return Math.max(0, baselineSchedule.value.length - amortizationSchedule.value.length);
  });

  const salaryPercentage = computed(() => {
    if (monthlySalary.value === 0) return 0;
    return (firstMonthPayment.value / monthlySalary.value) * 100;
  });

  const isRisky = computed(() => salaryPercentage.value > 30);

  const minMonthlyPayment = computed(() => {
    if (amortizationSchedule.value.length === 0) return 0;
    // Find the minimum payment that is not 0 (last payment might be partial, but we usually want the 'quota' level)
    // Actually, french system sets a target quota.
    // If reduce_payment is used, the quota drops.
    // Let's take the payment of the last full month or just the min entry.
    // But last payment is often small adjustment.
    // Let's filter out the very last payment if it's < 10% of the previous one?
    // For simplicity, let's just take the minimum non-zero payment, it shows the potential relief.
    const payments = amortizationSchedule.value.map(
      (r) => r.financialPayment + r.desgravamen + r.fireInsurance,
    );
    return Math.min(...payments);
  });

  const minSalaryPercentage = computed(() => {
    if (monthlySalary.value === 0) return 0;
    return (minMonthlyPayment.value / monthlySalary.value) * 100;
  });

  return {
    loanAmount,
    monthlyRate,
    financialMonthlyPayment: initialFinancialMonthlyPayment,
    amortizationSchedule,
    monthlyPayment: firstMonthPayment,
    minMonthlyPayment,
    totalPayment,
    totalInterest,
    totalInterestSavings,
    monthsSaved,
    salaryPercentage,
    minSalaryPercentage,
    isRisky,
  };
}
