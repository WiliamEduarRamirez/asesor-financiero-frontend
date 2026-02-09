import { computed, type Ref, ref } from 'vue';

import type {
  AmortizationRow,
  Prepayment,
  PrepaymentStrategy,
  StrategyComparison,
} from '../models/mortgage.model';

import { MortgageEngine, type MortgageEngineConfig } from '../utils/MortgageEngine';

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
  startDate?: Date;
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
  const enableIntelligentStrategy = ref(false);
  const aggressiveContinuity = ref(false);

  // Financial Calculations
  const monthlyRate = computed(() => {
    // Convert TEA to TEM (Geometric)
    // Formula: (1 + TEA)^(1/12) - 1
    return Math.pow(1 + annualRate.value / 100, 1 / 12) - 1;
  });

  // 1. & 2. Engine Integration
  const engineResult = computed(() => {
    const config: MortgageEngineConfig = {
      price: price.value,
      downPayment: downPayment.value,
      annualRate: annualRate.value,
      termYears: termYears.value,
      desgravamenRate: desgravamenRate.value,
      fireInsuranceRate: fireInsuranceRate.value,
      prepayments: prepayments?.value || [],
      strategy: prepaymentStrategy?.value || 'reduce_term',
      startDate: new Date(), // Could be parameterized
      intelligentStrategy: enableIntelligentStrategy.value,
      aggressiveContinuity: aggressiveContinuity.value,
      monthlySalary: monthlySalary.value,
    };

    const engine = new MortgageEngine(config);
    return engine.calculate();
  });

  const amortizationSchedule = computed<AmortizationRow[]>(() => {
    return engineResult.value.schedule.map((row) => ({
      ...row,
      capital: row.totalAmortization,
      balance: row.balanceEnd,
    }));
  });

  const baselineSchedule = computed(() => {
    // We can't easily get baseline schedule from here without running engine again or exposing it.
    // In MortgageEngine, we run baseline internally.
    // Maybe we should expose baseline result in EngineResult?
    // Yes, let's update EngineResult if needed, or run a separate baseline instance.
    // Running a separate instance is cleaner for now to avoid changing Engine interface too much if not planned.
    // BUT, the engine does run baseline internally to calculate savings.
    // Let's rely on `strategyImpact` for savings data, but if UI needs the full baseline schedule (e.g. for charts), we might need it.
    // For now, let's just run a second engine for baseline if needed, strictly.
    const config: MortgageEngineConfig = {
      price: price.value,
      downPayment: downPayment.value,
      annualRate: annualRate.value,
      termYears: termYears.value,
      desgravamenRate: desgravamenRate.value,
      fireInsuranceRate: fireInsuranceRate.value,
      prepayments: [],
      strategy: 'reduce_term',
      startDate: new Date(),
    };
    return new MortgageEngine(config).calculate().schedule.map((row) => ({
      ...row,
      capital: row.totalAmortization,
      balance: row.balanceEnd,
    }));
  });

  const globalStrategySummary = computed(() => {
    const res = engineResult.value;
    const hasStrategy = (prepayments?.value && prepayments.value.length > 0) || false;

    return {
      hasStrategy,
      totalCapitalInjected: res.totals.totalExtra,
      totalITF: res.totals.totalITF,
      totalInvestment: res.totals.totalExtra + res.totals.totalExtra * 0.00005, // Approximate ITF on extra
      operationsCount: res.schedule.filter((r) => r.hasPrepayment).length,
      originalInterest: res.strategyImpact.originalInterest,
      strategyInterest: res.totals.totalInterest,
      totalSavings: res.strategyImpact.savedInterest,
      newEndDate: res.strategyImpact.savedMonths
        ? termYears.value * 12 - res.strategyImpact.savedMonths
        : null,
      // Wait, UI expects a number "Month X".
      // The engine returns a Date for newEndDate.
      // We need to convert it to "Month Index" relative to start?
      // Let's use `savedMonths` from impact.
      // `originalTermMonths` = termYears * 12.
      // `newTermMonths` = originalTermMonths - savedMonths.
    };
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

  const totalInterestSavings = computed(() => engineResult.value.strategyImpact.savedInterest);
  const monthsSaved = computed(() => engineResult.value.strategyImpact.savedMonths);

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

    // Base Scenario A: reduce_term
    const configA: MortgageEngineConfig = {
      price: price.value,
      downPayment: downPayment.value,
      annualRate: annualRate.value,
      termYears: termYears.value,
      desgravamenRate: desgravamenRate.value,
      fireInsuranceRate: fireInsuranceRate.value,
      prepayments: scenarioPrepayments,
      strategy: 'reduce_term',
      startDate: new Date(),
    };

    // Base Scenario B: reduce_payment
    const configB = { ...configA, strategy: 'reduce_payment' as const };

    const engineA = new MortgageEngine(configA);
    const resultA = engineA.calculate();

    const engineB = new MortgageEngine(configB);
    const resultB = engineB.calculate();

    // For Scenario B new monthly payment, we look at month after prepayment.
    // If multiple prepayments, it's roughly the average or the new stable payment?
    // Let's just take the payment from the month after the specific extra payment month we are checking,
    // OR just use the last payment if it's stable.
    // Ideally, find the row for (month + 1).
    const nextRowB =
      resultB.schedule.find((r) => r.month === month + 1) ||
      resultB.schedule[resultB.schedule.length - 1];

    // We need "New Monthly Payment" = Financial + Insurances.
    // Engine row has `payment` which includes ITF.
    // Let's use `financialPayment + desgravamen + fireInsurance`.
    const newMonthlyPayment = nextRowB
      ? nextRowB.financialPayment + nextRowB.desgravamen + nextRowB.fireInsurance
      : 0;

    return {
      scenarioA: {
        savings: resultA.strategyImpact.savedInterest,
        newEndDate: resultA.schedule.length,
        interestTotal: resultA.totals.totalInterest,
      },
      scenarioB: {
        savings: resultB.strategyImpact.savedInterest,
        newMonthlyPayment: newMonthlyPayment,
        interestTotal: resultB.totals.totalInterest,
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

  // Backward compatibility wrapper for financialMonthlyPayment
  // In Engine, we return a computed property or just use the first month's financial payment from result?
  // Or recalculate purely?
  // Engine calculates it internally.
  // We can just expose a quick calc similar to Engine's internal method if needed, OR just return 0 if schedule empty.
  // However, `initialFinancialMonthlyPayment` was exported.
  // Let's use `engineResult.value.schedule[0].financialPayment` if available.
  const financialMonthlyPayment = computed(() => {
    const first = engineResult.value.schedule[0];
    return first ? first.financialPayment : 0;
  });

  const calculateOptimalPrepayment = (targetMonth: number) => {
    // Create a temporary engine just for this calc to avoid reactivity loops?
    // Or use the current config but override prepayments?
    // The Engine method `calculateOptimalMonthlyExtra` does its own temp config logic.
    // So we just need an instance.
    // We can use the current engine instance if we exposed it?
    // `engineResult` is computed, it returns the RESULT, not the engine instance.
    // So we must instantiate a new engine.
    const config: MortgageEngineConfig = {
      price: price.value,
      downPayment: downPayment.value,
      annualRate: annualRate.value,
      termYears: termYears.value,
      desgravamenRate: desgravamenRate.value,
      fireInsuranceRate: fireInsuranceRate.value,
      prepayments: [], // We start fresh for optimal calc? Or add to existing? Prompt says "monto mínimo... necesario". Usually relative to baseline.
      // Assuming we want to find the SINGLE Recurring Prepayment that achieves the goal, ignoring current ones?
      // Or adding to current ones?
      // "Sugiera... el monto mínimo...".
      // Let's assume on top of nothing (fresh start) to give a clean number.
      strategy: 'reduce_term',
      startDate: new Date(),
      intelligentStrategy: false,
      monthlySalary: monthlySalary.value,
    };
    const engine = new MortgageEngine(config);
    return engine.calculateOptimalMonthlyExtra(targetMonth);
  };

  const pivotMonth = computed(() => {
    const row = engineResult.value.schedule.find((r) => r.status === 'pivot');
    return row ? row.month : null;
  });

  const maintenanceAmount = computed(() => {
    if (!monthlySalary.value) return 0;
    // financialMonthlyPayment might be from computed
    // We want the theoretical limit
    const riskCeiling = monthlySalary.value * 0.4;
    return Math.max(0, riskCeiling - financialMonthlyPayment.value);
  });

  return {
    loanAmount,
    stopOnCrossover: enableIntelligentStrategy, // Exposed alias for easier refactoring in views if needed, or rename
    aggressiveContinuity,
    calculateOptimalPrepayment, // Exposed
    monthlyRate,
    financialMonthlyPayment, // was initialFinancialMonthlyPayment
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
    pivotMonth,
    maintenanceAmount,
  };
}
