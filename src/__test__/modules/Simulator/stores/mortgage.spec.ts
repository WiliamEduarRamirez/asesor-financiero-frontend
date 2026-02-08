import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMortgageStore } from '@/modules/Simulator/stores/useMortgageStore';

describe('useMortgageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('calculates monthly payment correctly using French Amortization', () => {
    const store = useMortgageStore();

    // Scenario:
    // Price: 120,000. Down Payment: 20,000. Loan: 100,000.
    // Rate: 12% Annual -> 1% Monthly.
    // Term: 1 Year -> 12 Months.

    store.price = 120000;
    store.downPayment = 20000;
    store.annualRate = 12;
    store.termYears = 1;

    // Formula check: 100,000 * (0.01 * 1.01^12) / (1.01^12 - 1)
    // Expected ~ 8884.878

    const payment = store.monthlyPayment;
    expect(payment).toBeCloseTo(8884.88, 2);
  });

  it('calculates total interest correctly', () => {
    const store = useMortgageStore();

    store.price = 120000;
    store.downPayment = 20000;
    store.annualRate = 12;
    store.termYears = 1;

    // Total Payment = 8884.88 * 12 = 106,618.56
    // Interest = 106,618.56 - 100,000 = 6,618.56

    const total = store.totalInterest;
    expect(total).toBeCloseTo(6618.53, 1); // Allow slight precision diff
  });

  it('identifies risky loans based on salary', () => {
    const store = useMortgageStore();

    // Payment ~8884
    store.price = 120000;
    store.downPayment = 20000;
    store.annualRate = 12;
    store.termYears = 1;

    // Salary 20,000 -> Ratio 44% -> Risky
    store.monthlySalary = 20000;
    expect(store.isRisky).toBe(true);
    expect(store.salaryPercentage).toBeGreaterThan(30);

    // Salary 40,000 -> Ratio 22% -> Safe
    store.monthlySalary = 40000;
    expect(store.isRisky).toBe(false);
  });
});
