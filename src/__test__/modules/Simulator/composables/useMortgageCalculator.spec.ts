import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useMortgageCalculator } from '@/modules/Simulator/composables/useMortgageCalculator';

describe('useMortgageCalculator', () => {
  it('calculates monthly payment correctly using French Amortization with TEA conversion', () => {
    // Scenario:
    // Price: 120,000. Down Payment: 20,000. Loan: 100,000.
    // Annual Rate (TEA): 12.68% -> (1+12.68%)^(1/12)-1 = 1% Monthly approx.
    // Let's use exactly 1% monthly effective for easy calc -> TEA = (1.01)^12 - 1 = 12.6825%
    // Term: 1 Year -> 12 Months.

    // For simplicity in test, let's trust the calculator handles TEA -> TEM conversion.
    // If TEA = 0, Rate = 0.
    // If TEA = 12, TEM = (1.12)^(1/12) - 1 = 0.009488...

    const price = ref(120000);
    const downPayment = ref(20000);
    const annualRate = ref(12.682503); // TEA that gives exactly 1% TEM
    const termYears = ref(1);
    const monthlySalary = ref(20000);
    const desgravamenRate = ref(0);
    const fireInsuranceRate = ref(0);

    const { monthlyPayment, totalInterest } = useMortgageCalculator({
      price,
      downPayment,
      annualRate,
      termYears,
      monthlySalary,
      desgravamenRate,
      fireInsuranceRate,
    });

    // TEM = 1%
    // Loan = 100,000
    // N = 12
    // PMT = 100000 * (0.01 * 1.01^12) / (1.01^12 - 1) = 8884.878...
    expect(monthlyPayment.value).toBeCloseTo(8884.88, 1);

    // Total Interest = (8884.88 * 12) - 100,000 = 6618.56
    expect(totalInterest.value).toBeCloseTo(6618.53, 0);
  });

  it('identifies risky loans based on salary', () => {
    const price = ref(120000);
    const downPayment = ref(20000);
    const annualRate = ref(12.6825);
    const termYears = ref(1);
    const monthlySalary = ref(20000);
    const desgravamenRate = ref(0);
    const fireInsuranceRate = ref(0);

    const { isRisky, salaryPercentage } = useMortgageCalculator({
      price,
      downPayment,
      annualRate,
      termYears,
      monthlySalary,
      desgravamenRate,
      fireInsuranceRate,
    });

    // Payment ~8884
    // Salary 20,000 -> Ratio 44% -> Risky
    expect(isRisky.value).toBe(true);
    expect(salaryPercentage.value).toBeGreaterThan(30);

    // Salary 40,000 -> Ratio 22% -> Safe
    monthlySalary.value = 40000;
    expect(isRisky.value).toBe(false);
  });
});
