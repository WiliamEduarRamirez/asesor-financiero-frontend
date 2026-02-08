import { ref } from 'vue';
import type { Prepayment, PrepaymentStrategy } from '../models/mortgage.model';

export function usePrepayments() {
  const prepayments = ref<Prepayment[]>([]);
  const prepaymentStrategy = ref<PrepaymentStrategy>('reduce_term');

  const addPrepayment = () => {
    prepayments.value.push({
      month: 1,
      amount: 1000,
      frequency: 'unique',
    });
  };

  const removePrepayment = (index: number) => {
    prepayments.value.splice(index, 1);
  };

  return {
    prepayments,
    prepaymentStrategy,
    addPrepayment,
    removePrepayment,
  };
}
