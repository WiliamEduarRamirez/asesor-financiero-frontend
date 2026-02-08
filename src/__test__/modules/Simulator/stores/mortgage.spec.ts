import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMortgageStore } from '@/modules/Simulator/stores/useMortgageStore';

describe('useMortgageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('calculates loan amount correctly', () => {
    const store = useMortgageStore();

    store.price = 120000;
    store.downPayment = 20000;

    expect(store.loanAmount).toBe(100000);
  });
});
