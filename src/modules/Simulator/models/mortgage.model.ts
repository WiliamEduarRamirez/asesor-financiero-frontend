export interface AmortizationRow {
  month: number;
  payment: number;
  financialPayment: number;
  interest: number;
  capital: number;
  desgravamen: number;
  fireInsurance: number;
  balance: number;
}

export interface Prepayment {
  month: number;
  amount: number;
  frequency: 'unique' | 'recurring'; // Recurring sends payment every 12 months
}

export type PrepaymentStrategy = 'reduce_term' | 'reduce_payment';
