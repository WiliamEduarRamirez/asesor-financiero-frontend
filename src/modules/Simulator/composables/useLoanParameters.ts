import { storeToRefs } from 'pinia';
import { useMortgageStore } from '../stores/useMortgageStore';
import { computed } from 'vue';

export function useLoanParameters() {
  const store = useMortgageStore();
  const { price, downPayment, termYears, monthlySalary } = storeToRefs(store);

  const downPaymentPercentage = computed(() => {
    if (price.value === 0) return 0;
    return ((downPayment.value / price.value) * 100).toFixed(1);
  });

  return {
    price,
    downPayment,
    termYears,
    monthlySalary,
    downPaymentPercentage,
  };
}
