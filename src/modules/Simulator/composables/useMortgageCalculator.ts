import { computed, type Ref, unref } from 'vue';

import type {
  AmortizationRow,
  Prepayment,
  PrepaymentStrategy,
  StrategyComparison,
} from '../models/mortgage.model';

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
        const interval = p.interval ?? 12;
        isApplicable = currentMonth >= p.month && (currentMonth - p.month) % interval === 0;
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

      // ITF Calculation (0.005% of Total Quota + Anticipated Payment)
      // Total Quota = Principal + Interest + Desgravamen + Fire Insurance
      // Base for ITF = Total Quota + Extra Capital
      const baseForITF = currentFinancialPayment + desgravamen + fireInsurance + extraCapital;
      const itf = baseForITF * 0.00005;

      const rowPayment = baseForITF + itf;

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
        itf: itf,
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
  const firstMonthBreakdown = computed(() => {
    if (amortizationSchedule.value.length === 0) {
      return {
        fixed: 0,
        extra: 0,
        total: 0,
        itf: 0,
        hasPrepayment: false,
      };
    }

    // Check for prepayment in Month 1 specifically
    const extra = prepayments?.value?.find((p) => p.month === 1)?.amount || 0;
    const actualRow = amortizationSchedule.value[0];
    const baseRow = baselineSchedule.value[0]; // The pure bank quota without extra stuff

    // In case actualRow doesn't exist (e.g. empty schedule or paid off immediately?), default to zeros
    if (!actualRow) {
      return {
        fixed: 0,
        extra: 0,
        total: 0,
        itf: 0,
        hasPrepayment: false,
      };
    }

    return {
      fixed: baseRow ? baseRow.payment : 0, // Using baseline for "Cuota Fija Banco"
      extra: extra,
      total: actualRow.payment, // This includes everything: Capital + Interest + Insurance + Extra + ITF
      itf: actualRow.itf,
      hasPrepayment: extra > 0,
    };
  });

  const firstMonthPayment = computed(() => firstMonthBreakdown.value.fixed); // Backward compatibility for chart/other uses if they want just the fixed part

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

  const isRisky = computed(() => salaryPercentage.value >= 40);

  const riskStatus = computed(() => {
    const p = salaryPercentage.value;
    if (p > 50) {
      return {
        label: 'Crítico (>50%)',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50 text-red-600',
        icon: 'mdi:alert-octagon',
      };
    }
    if (p >= 40) {
      return {
        label: 'Riesgo Alto (40-50%)',
        colorClass: 'text-orange-600',
        bgClass: 'bg-orange-50 text-orange-600',
        icon: 'mdi:alert',
      };
    }
    if (p >= 30) {
      return {
        label: 'Aceptable (30-40%)',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50 text-amber-600',
        icon: 'mdi:check-circle',
      };
    }
    return {
      label: 'Saludable (<30%)',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50 text-emerald-600',
      icon: 'mdi:thumb-up',
    };
  });

  const riskColorClass = computed(() => riskStatus.value.colorClass);

  // Validation function
  const validatePrepayment = (amount: number, month: number) => {
    // Check against BASELINE to see the original expected quota
    const row = baselineSchedule.value.find((r) => r.month === month);
    if (!row) return { isValid: false, message: 'Mes no encontrado' };

    // Cuota Pura = Capital + Interest
    const cuotaPura = row.capital + row.interest;

    // Allow a small tolerance or strict comparison? Strict is fine.
    if (amount < cuotaPura) {
      return {
        isValid: false,
        message:
          'El monto es menor a la cuota pura (Capital + Interés). Se recomienda ahorrar más para un impacto real.',
        isEfficient: false,
      };
    }
    return { isValid: true, isEfficient: true };
  };

  // Strategy Comparator
  const compareStrategies = (extraAmount: number, month: number): StrategyComparison => {
    const currentList = prepayments?.value ? [...prepayments.value] : [];
    // Remove existing for this month if any, to simulate "what if I change it or add it"
    // The requirement says "compareStrategies(montoExtra, mes)".
    // Assuming adding a NEW one or replacing.
    // Let's assume adding/replacing for that month.
    const scenarioPrepayments = currentList.filter((p) => p.month !== month);
    scenarioPrepayments.push({ month, amount: extraAmount, frequency: 'unique' });

    // Scenario A: Reduce Term
    const scheduleA = generateSchedule(scenarioPrepayments, 'reduce_term');
    const interestA = scheduleA.reduce((sum, item) => sum + item.interest, 0);
    const savingsA = Math.max(0, baselineTotalInterest.value - interestA);

    // Scenario B: Reduce Payment
    const scheduleB = generateSchedule(scenarioPrepayments, 'reduce_payment');
    const interestB = scheduleB.reduce((sum, item) => sum + item.interest, 0);
    const savingsB = Math.max(0, baselineTotalInterest.value - interestB);

    // For Scenario B, finding the new monthly payment.
    // Use the month AFTER the prepayment (month + 1) to see the effect.
    const nextRow = scheduleB.find((r) => r.month === month + 1);
    const newMonthlyPayment = nextRow
      ? nextRow.financialPayment + nextRow.desgravamen + nextRow.fireInsurance + nextRow.itf
      : 0;

    return {
      scenarioA: {
        savings: savingsA,
        newEndDate: scheduleA.length, // info on months
        interestTotal: interestA,
      },
      scenarioB: {
        savings: savingsB,
        newMonthlyPayment: newMonthlyPayment,
        interestTotal: interestB,
      },
    };
  };

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

  // Global Strategy Summary
  const globalStrategySummary = computed(() => {
    const schedule = amortizationSchedule.value;
    const hasStrategy = prepayments?.value && prepayments.value.length > 0;

    if (!hasStrategy) {
      return {
        hasStrategy: false,
        totalCapitalInjected: 0,
        totalITF: 0,
        totalInvestment: 0,
        operationsCount: 0,
        originalInterest: baselineTotalInterest.value,
        strategyInterest: totalInterest.value,
        totalSavings: 0,
        newEndDate: null,
      };
    }

    // Calculate totals from the actual schedule where extra payments were applied
    let totalCapitalInjected = 0;
    let operationsCount = 0;

    schedule.forEach((row) => {
      if (row.capital - (row.financialPayment - row.interest) > 1) {
        // Logic check: extraPayment is not explicitly in AmortizationRow interface provided in earlier steps.
        // Standard row has: payment, financialPayment, interest, capital, ...
        // capital = (financialPayment - interest) + extraCapital.
        // So extraCapital = capital - (financialPayment - interest).
        // Let's use that.
        const normalCapital = Math.max(0, row.financialPayment - row.interest);
        const extra = Math.max(0, row.capital - normalCapital);

        // However, `row.payment` = `financialPayment + itf`.
        // If extra capital was added, `row.payment` would typically reflect it if we tracked it?
        // In `generateSchedule`:
        // `capital += extraCapital; // For display`
        // `financialPayment` is unaffected by extra calc in that specific month (it's the value BEFORE extra).
        // So `row.capital` includes extra.
        // `row.financialPayment` is the base payment.
        // `row.interest` is interest.
        // So `row.capital - (row.financialPayment - row.interest)` should be the extra.

        if (extra > 1) {
          // Tolerance
          totalCapitalInjected += extra;
          operationsCount++;
        }
      }
    });

    const totalITF = totalCapitalInjected * 0.00005;
    const totalInvestment = totalCapitalInjected + totalITF;
    const totalSavings = Math.max(0, baselineTotalInterest.value - totalInterest.value);

    // Calculate new end date (approx)
    // Original term is termYears * 12.
    // New term is amortizationSchedule.value.length.
    const originalEndMonth = termYears.value * 12;
    const newEndMonth = schedule.length;
    // We can return the Date object or just the month index/year.
    // Let's return the simplified month count.

    return {
      hasStrategy: true,
      totalCapitalInjected,
      totalITF,
      totalInvestment,
      operationsCount,
      originalInterest: baselineTotalInterest.value,
      strategyInterest: totalInterest.value,
      totalSavings,
      newEndDate: newEndMonth < originalEndMonth ? newEndMonth : null,
    };
  });

  return {
    loanAmount,
    monthlyRate,
    financialMonthlyPayment: initialFinancialMonthlyPayment,
    amortizationSchedule,
    monthlyPayment: firstMonthPayment,
    firstMonthBreakdown,
    minMonthlyPayment,
    totalPayment,
    totalInterest,
    totalInterestSavings,
    monthsSaved,
    salaryPercentage,
    minSalaryPercentage,
    isRisky,
    riskStatus,
    riskColorClass,
    validatePrepayment,
    compareStrategies,
    globalStrategySummary,
  };
}
