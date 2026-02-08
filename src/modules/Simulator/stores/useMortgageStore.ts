import { defineStore } from 'pinia';

export const useMortgageStore = defineStore('mortgage', {
  state: () => ({
    price: 300000,
    downPayment: 60000, // Default 20%
    annualRate: 8.5, // TEA
    termYears: 20,
    monthlySalary: 6550,
    desgravamenRate: 0.049, // Monthly %
    fireInsuranceRate: 0.029, // Monthly %
  }),
  getters: {
    loanAmount: (state) => state.price - state.downPayment,
  },
  actions: {
    // Actions can be added here if complex state mutations are needed
  },
});
