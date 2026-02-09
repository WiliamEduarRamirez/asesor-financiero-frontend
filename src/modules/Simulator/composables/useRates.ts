import { ref, watch } from 'vue';
import { useMortgageStore } from '../stores/useMortgageStore';

const STORAGE_KEY = 'mortgage-tcea-mode';

// Singleton State
const isTceaMode = ref(false);
const teaValue = ref(0);
const tceaValue = ref(0);
const desgravamenValue = ref(0);
const fireInsuranceValue = ref(0);
const initialized = ref(false);
let watcherSetup = false;

export function useRates() {
  const store = useMortgageStore();

  const syncToStore = () => {
    if (isTceaMode.value) {
      store.annualRate = tceaValue.value;
      store.desgravamenRate = 0;
      store.fireInsuranceRate = 0;
    } else {
      store.annualRate = teaValue.value;
      store.desgravamenRate = desgravamenValue.value;
      store.fireInsuranceRate = fireInsuranceValue.value;
    }
  };

  if (!initialized.value) {
    // Initialize from Store Defaults (only once)
    teaValue.value = store.annualRate;
    tceaValue.value = store.annualRate; // Default assumption
    desgravamenValue.value = store.desgravamenRate;
    fireInsuranceValue.value = store.fireInsuranceRate;

    // Load persistence
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      isTceaMode.value = JSON.parse(stored);
    }

    // Initial Sync
    syncToStore();
    initialized.value = true;
  }

  if (!watcherSetup) {
    watch([isTceaMode, teaValue, tceaValue, desgravamenValue, fireInsuranceValue], () => {
      syncToStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isTceaMode.value));
    });
    watcherSetup = true;
  }

  const getEffectiveMonthlyRate = () => {
    const annual = store.annualRate / 100;
    return (Math.pow(1 + annual, 1 / 12) - 1) * 100;
  };

  return {
    isTceaMode,
    teaValue,
    tceaValue,
    desgravamenValue,
    fireInsuranceValue,
    getEffectiveMonthlyRate,
  };
}
