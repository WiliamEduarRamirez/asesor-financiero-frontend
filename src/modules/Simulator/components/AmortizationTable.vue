<script setup lang="ts">
import { useMortgageStore } from '../stores/useMortgageStore';
import { storeToRefs } from 'pinia';

const store = useMortgageStore();
const { amortizationSchedule } = storeToRefs(store);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <h3 class="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
      <iconify-icon icon="mdi:table-clock" class="text-blue-600"></iconify-icon>
      Cronograma de Pagos (Sistema Francés)
    </h3>
    <div class="overflow-x-auto">
      <div class="max-h-96 overflow-y-auto border rounded-xl border-slate-200">
        <table class="w-full text-sm text-left text-slate-600">
          <thead class="bg-slate-50 text-xs text-slate-700 uppercase sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 border-b border-slate-200">Mes</th>
              <th class="px-4 py-3 border-b border-slate-200">Cuota Total</th>
              <th class="px-4 py-3 border-b border-slate-200 text-slate-500">Capital</th>
              <th class="px-4 py-3 border-b border-slate-200 text-blue-600">Interés</th>
              <th class="px-4 py-3 border-b border-slate-200 text-orange-600">Seg. Desg.</th>
              <th class="px-4 py-3 border-b border-slate-200 text-orange-600">Seg. Inm.</th>
              <th class="px-4 py-3 border-b border-slate-200">Saldo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in amortizationSchedule"
              :key="row.month"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3 font-medium">{{ row.month }}</td>
              <td class="px-4 py-3 font-bold text-slate-800">{{ formatCurrency(row.payment) }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatCurrency(row.capital) }}</td>
              <td class="px-4 py-3 text-blue-600">{{ formatCurrency(row.interest) }}</td>
              <td class="px-4 py-3 text-orange-600 text-xs">
                {{ formatCurrency(row.desgravamen) }}
              </td>
              <td class="px-4 py-3 text-orange-600 text-xs">
                {{ formatCurrency(row.fireInsurance) }}
              </td>
              <td class="px-4 py-3 text-slate-400 text-xs">{{ formatCurrency(row.balance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
