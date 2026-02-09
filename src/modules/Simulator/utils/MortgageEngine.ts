import { addMonths, startOfDay, differenceInDays } from 'date-fns';
import type { Prepayment, PrepaymentStrategy } from '../models/mortgage.model';

export interface RefinancingEvent {
  id: string;
  month: number;
  newRate: number; // Nueva TEA %
  closingCosts: number; // Gastos de cierre
  color: string; // Color identificador
  label?: string;
}

export interface MortgageEngineConfig {
  price: number;
  downPayment: number;
  annualRate: number; // TEA %
  termYears: number;
  desgravamenRate: number; // Monthly %
  fireInsuranceRate: number; // Monthly % (of price)
  prepayments: Prepayment[];
  strategy: PrepaymentStrategy;
  startDate?: Date; // Defaults to today
  monthlySalary?: number; // Required for Intelligent Strategy Phase 2
  intelligentStrategy?: boolean;
  aggressiveContinuity?: boolean; // New flag: Continue Attack even after equilibrium
  refinancingEvents?: RefinancingEvent[]; // Debt optimization events
}

export interface EngineScheduleRow {
  month: number;
  paymentDate: Date;
  daysInPeriod: number;
  tea: number;
  ted: number;

  // Financial Components
  balanceStart: number;
  interest: number;
  desgravamen: number;
  fireInsurance: number;

  // Amortization Components
  financialPayment: number; // The "Quota" (Capital + Interest) target
  amortization: number; // Capital part of the quota
  extraCapital: number; // From prepayments
  totalAmortization: number; // amortization + extraCapital

  // Totals
  itf: number;
  itfBase: number;
  itfExtra: number;
  payment: number; // Total out of pocket
  balanceEnd: number;

  // Flags & Metrics
  hasPrepayment: boolean;
  isCrossover: boolean;
  interestSavings?: number;
  status?: 'default' | 'acceleration' | 'pivot' | 'protected';

  // Refinancing
  refinancingEvent?: RefinancingEvent; // If this month has a refinancing
  backgroundColor?: string; // Color tint for this period
  periodLabel?: string; // Label for this refinancing period
}

export interface EngineResult {
  schedule: EngineScheduleRow[];
  totals: {
    totalInterest: number;
    totalCapital: number;
    totalExtra: number;
    totalInsurance: number; // Desgravamen + Fire
    totalPayment: number;
    totalITF: number;
  };
  strategyImpact: {
    originalInterest: number; // Baseline without prepayments
    savedInterest: number;
    savedMonths: number;
    newEndDate: Date;
    originalEndDate: Date;
  };
}

export class MortgageEngine {
  private config: MortgageEngineConfig;

  constructor(config: MortgageEngineConfig) {
    this.config = { ...config };
    this.config.startDate ??= startOfDay(new Date());
  }

  // --- Helpers ---

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // TED (Tasa Efectiva Diaria) = (1 + TEA)^(1/360) - 1
  private calculateTED(tea: number): number {
    return Math.pow(1 + tea / 100, 1 / 360) - 1;
  }

  // TEM (Tasa Efectiva Mensual) = (1 + TEA)^(1/12) - 1
  private calculateTEM(tea: number): number {
    return Math.pow(1 + tea / 100, 1 / 12) - 1;
  }

  // French Formula for Fixed Quota (PMT)
  private calculatePMT(principal: number, rate: number, months: number): number {
    if (months <= 0 || principal <= 0) return 0;
    if (rate === 0) return principal / months;
    const numerator = rate * Math.pow(1 + rate, months);
    const denominator = Math.pow(1 + rate, months) - 1;
    return principal * (numerator / denominator);
  }

  private getDaysInPeriod(start: Date, end: Date): number {
    return differenceInDays(end, start);
  }

  // --- Core Calculation ---

  /**
   * Calculates the minimum monthly extra payment needed to move the "Crossover" point
   * (Capital > Interest) to a specific target month (e.g. Month 24).
   */
  public calculateOptimalMonthlyExtra(targetMonth: number): number {
    let low = 0;
    let high = this.config.price; // Upper bound: pay off entire loan instantly
    let optimal = 0;

    // Binary search for precision
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;

      // Create a temp config with this recurring prepayment
      const simConfig: MortgageEngineConfig = {
        ...this.config,
        prepayments: [
          {
            amount: mid,
            frequency: 'recurring',
            interval: 1, // Monthly
            month: 1,
          },
        ],
        strategy: 'reduce_term', // Usually strategy doesn't shift crossover logic much in French system early on, but reduce_term is standard for aggressive payoff
      };

      const result = this.runSimulation(simConfig);
      // Find first crossover month
      const crossoverRow = result.schedule.find((r) => r.isCrossover);

      if (crossoverRow && crossoverRow.month <= targetMonth) {
        optimal = mid;
        high = mid; // Try smaller amount
      } else {
        low = mid; // Need more money
      }
    }
    return this.round(optimal);
  }

  public calculate(): EngineResult {
    const { termYears, startDate } = this.config;

    // Baseline Calculation (Strategy: reduce_term, no prepayments)
    const baselineResult = this.runSimulation({
      ...this.config,
      prepayments: [],
      strategy: 'reduce_term',
      intelligentStrategy: false, // Ensure baseline is without intelligent strategy
    });

    // Actual Run
    const result = this.runSimulation(this.config);

    // Enrich with Interest Savings per month (Comparing to baseline)
    result.schedule.forEach((row, index) => {
      const baselineRow = baselineResult.schedule[index];
      if (baselineRow) {
        row.interestSavings = Math.max(0, baselineRow.interest - row.interest);
      } else {
        // Loan paid off already? Savings is technically the full interest that would have been paid?
        // Or just undefined/0?
        // If the baseline loan is longer, then for months beyond the new term, the savings is "Interest avoided entirely"?
        // Table only shows rows for the current schedule.
        // So we only compare existing rows.
        // But wait, if baseline has Row 200 and we stop at Row 150.
        // Row 150 has savings = BaselineRow[150].interest - Row[150].interest.
        // The savings from months 151-240 are "Avoided Future Interest" (captured in total savings).
        // Per month savings is just the delta for that active month.
        row.interestSavings = 0;
      }
    });

    // Enhance Result with Strategy Impact
    result.strategyImpact = {
      originalInterest: baselineResult.totals.totalInterest,
      savedInterest: Math.max(0, baselineResult.totals.totalInterest - result.totals.totalInterest),
      savedMonths: Math.max(0, termYears * 12 - result.schedule.length),
      newEndDate:
        result.schedule.length > 0
          ? result.schedule[result.schedule.length - 1]!.paymentDate
          : startDate || new Date(),
      originalEndDate:
        baselineResult.schedule.length > 0
          ? baselineResult.schedule[baselineResult.schedule.length - 1]!.paymentDate
          : startDate || new Date(),
    };

    return result;
  }

  private calculateExtraCapital(month: number, prepayments: Prepayment[]): number {
    let extra = 0;
    for (const p of prepayments) {
      if (p.frequency === 'recurring') {
        const interval = p.interval || 12;
        if (month >= p.month && (month - p.month) % interval === 0) {
          extra += p.amount;
        }
      } else if (p.frequency === 'unique' && p.month === month) {
        extra += p.amount;
      }
    }
    return extra;
  }

  private runSimulation(config: MortgageEngineConfig): EngineResult {
    const {
      price,
      downPayment,
      annualRate,
      termYears,
      desgravamenRate,
      fireInsuranceRate,
      prepayments,
      strategy,
      startDate = new Date(),
      intelligentStrategy,
      aggressiveContinuity,
      refinancingEvents = [],
      // monthlySalary, // Not used in current aggressive/conservative logic, as we just stop or continue.
    } = config;

    const loanAmount = price - downPayment;
    const monthlyFireInsurance = this.round(price * (fireInsuranceRate / 100));

    // Sort refinancing events by month
    const sortedRefinancingEvents = [...refinancingEvents].sort((a, b) => a.month - b.month);

    // Track current rate (starts with base rate, changes with refinancing)
    let currentRate = annualRate;
    let currentTem = this.calculateTEM(currentRate);
    let currentTed = this.calculateTED(currentRate);

    let balance = loanAmount;
    let currentTargetQuota = this.calculatePMT(loanAmount, currentTem, termYears * 12);

    const schedule: EngineScheduleRow[] = [];
    const totals = {
      totalInterest: 0,
      totalCapital: 0,
      totalExtra: 0,
      totalInsurance: 0,
      totalPayment: 0,
      totalITF: 0,
    };

    const maxMonths = termYears * 12;
    let currentDate = startDate;
    // Intelligent Strategy State
    let isEquilibriumReached = false;

    // Track current refinancing period for color coding
    let currentPeriodColor: string | undefined = undefined;
    let currentPeriodLabel: string | undefined = undefined;

    for (let month = 1; month <= maxMonths; month++) {
      if (balance <= 0.05) break;

      const prevDate = currentDate;
      currentDate = addMonths(startDate, month);
      const daysInPeriod = this.getDaysInPeriod(prevDate, currentDate);

      // Check for refinancing event at this month
      const refinancingEvent = sortedRefinancingEvents.find((e) => e.month === month);

      if (refinancingEvent) {
        // Apply new rate
        currentRate = refinancingEvent.newRate;
        currentTem = this.calculateTEM(currentRate);
        currentTed = this.calculateTED(currentRate);

        // Recalculate quota with new rate and remaining months
        const remainingMonths = maxMonths - month + 1;
        currentTargetQuota = this.calculatePMT(balance, currentTem, remainingMonths);

        // Apply closing costs to balance
        balance += refinancingEvent.closingCosts;

        // Update period color and label
        currentPeriodColor = refinancingEvent.color;
        currentPeriodLabel =
          refinancingEvent.label || `Refinanciamiento - TEA ${refinancingEvent.newRate}%`;
      }

      const interestFactor = Math.pow(1 + currentTed, daysInPeriod) - 1;
      const interest = this.round(balance * interestFactor);
      const desgravamen = this.round(balance * (desgravamenRate / 100));

      let amortization = this.round(currentTargetQuota - interest);

      if (amortization > balance) {
        amortization = balance;
        currentTargetQuota = amortization + interest;
      }

      // Real Equilibrium Check (Based strictly on Fixed Quota)
      const isRealCrossover = amortization > interest;

      let extraCapital = 0;
      let status: 'default' | 'acceleration' | 'pivot' | 'protected' = 'default';

      if (intelligentStrategy) {
        // Calculate total prepayment for this month from ALL prepayments
        const totalPrepaymentThisMonth = this.calculateExtraCapital(month, prepayments);

        if (isEquilibriumReached) {
          // Equilibrium already reached
          if (aggressiveContinuity) {
            // Aggressive Mode: Continue with all configured prepayments
            extraCapital = totalPrepaymentThisMonth;
            if (extraCapital > 0) {
              status = 'acceleration';
            }
          } else {
            // Conservative Mode: Stop Prepayments
            extraCapital = 0;
            status = 'protected';
          }
        } else {
          // Check if we pivot NOW (First month of equilibrium)
          if (isRealCrossover && month > 1) {
            isEquilibriumReached = true;

            if (aggressiveContinuity) {
              // Continue with all configured prepayments
              extraCapital = totalPrepaymentThisMonth;
              if (extraCapital > 0) {
                status = 'acceleration';
              }
            } else {
              // STOP immediately (Pivot)
              extraCapital = 0;
              status = 'pivot'; // Mark the pivot month
            }
          } else {
            // Still in Attack Phase (Before Equilibrium)
            extraCapital = totalPrepaymentThisMonth;
            if (extraCapital > 0) {
              status = 'acceleration';
            }
          }
        }
      } else {
        // Standard Logic
        extraCapital = this.calculateExtraCapital(month, prepayments);
      }

      // Cap extra capital to balance
      if (amortization + extraCapital > balance) {
        extraCapital = Math.max(0, balance - amortization);
      }

      const totalAmortization = amortization + extraCapital;
      const balanceEnd = Math.max(0, this.round(balance - totalAmortization));

      const basePayment = interest + amortization + desgravamen + monthlyFireInsurance;
      const totalDisbursement = basePayment + extraCapital;

      // ITF
      const baseForITF = basePayment;
      const extraForITF = extraCapital;
      const itfBase = this.round(baseForITF * 0.00005);
      const itfExtra = this.round(extraForITF * 0.00005);
      const itf = itfBase + itfExtra;

      const finalPayment = totalDisbursement + itf;

      // Accumulate Totals
      totals.totalInterest += interest;
      totals.totalCapital += totalAmortization;
      totals.totalExtra += extraCapital;
      totals.totalInsurance += desgravamen + monthlyFireInsurance;
      totals.totalPayment += finalPayment;
      totals.totalITF += itf;

      // Legacy flag for compatibility, though we use status now
      const isCrossover = totalAmortization > interest;

      schedule.push({
        month,
        paymentDate: currentDate,
        daysInPeriod,
        tea: currentRate,
        ted: currentTed,
        balanceStart: balance,
        interest,
        desgravamen,
        fireInsurance: monthlyFireInsurance,
        financialPayment: currentTargetQuota,
        amortization,
        extraCapital,
        totalAmortization,
        itf,
        itfBase,
        itfExtra,
        payment: finalPayment,
        balanceEnd,
        hasPrepayment: extraCapital > 0,
        isCrossover,
        status,
        refinancingEvent,
        backgroundColor: currentPeriodColor,
        periodLabel: currentPeriodLabel,
      });

      balance = balanceEnd;

      if (extraCapital > 0 && balance > 0 && strategy === 'reduce_payment') {
        const remainingMonths = maxMonths - month;
        if (remainingMonths > 0) {
          currentTargetQuota = this.calculatePMT(balance, currentTem, remainingMonths);
        }
      }
    }

    return {
      schedule,
      totals,
      strategyImpact: {
        originalInterest: 0,
        savedInterest: 0,
        savedMonths: 0,
        newEndDate: currentDate,
        originalEndDate: currentDate,
      },
    };
  }
}
