export interface AmortizationRow {
  month: number;
  payment: number;
  financialPayment: number;
  interest: number;
  capital: number;
  desgravamen: number;
  fireInsurance: number;
  itf: number;
  balance: number;
}

export interface Prepayment {
  month: number;
  amount: number;
  frequency: 'unique' | 'recurring'; // Recurring sends payment every 'interval' months
  interval?: number; // e.g. 1, 3, 6, 12
}

export type PrepaymentStrategy = 'reduce_term' | 'reduce_payment';

export interface StrategyComparison {
  scenarioA: {
    savings: number;
    newEndDate: number;
    interestTotal: number;
  };
  scenarioB: {
    savings: number;
    newMonthlyPayment: number;
    interestTotal: number;
  };
}
