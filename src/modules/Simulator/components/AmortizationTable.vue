<script setup lang="ts">
import { type PropType } from 'vue';
import type { AmortizationRow } from '../models/mortgage.model';

defineProps({
  schedule: {
    type: Array as PropType<AmortizationRow[]>,
    default: () => [],
  },
});

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
      Cronograma Detallado (SBS)
    </h3>
    <div class="overflow-x-auto">
      <div
        class="max-h-[600px] overflow-y-auto border rounded-xl border-slate-200 shadow-inner custom-scrollbar"
      >
        <table class="w-full text-sm text-left text-slate-600 relative border-collapse">
          <thead
            class="bg-slate-50 text-xs text-slate-700 uppercase sticky top-0 z-20 shadow-sm font-semibold tracking-wider"
          >
            <tr>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-center w-16">Mes</th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right">
                Cuota Fija<br /><span class="text-[10px] text-slate-400 font-normal normal-case"
                  >(Banco + ITF)</span
                >
              </th>
              <th
                class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-emerald-600 bg-emerald-50/30"
              >
                Amort. Extra
              </th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-slate-500">
                ITF Extra
              </th>
              <th
                class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right font-bold text-slate-800 bg-slate-100/50"
              >
                Total Mes
              </th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right">Capital</th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-blue-600">
                Interés
              </th>
              <th
                class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-orange-600"
              >
                Seguros
              </th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-right text-slate-400">
                Saldo
              </th>
              <th class="px-4 py-3 bg-slate-50 border-b border-slate-200 text-center">Hitos</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in schedule"
              :key="row.month"
              class="transition-colors duration-150"
              :class="[
                row.extraCapital > 0
                  ? 'bg-emerald-50/50 hover:bg-emerald-100/50'
                  : 'hover:bg-slate-50',
              ]"
            >
              <td
                class="px-4 py-3 text-center font-medium text-slate-500 bg-white/50 sticky left-0"
              >
                {{ row.month }}
              </td>

              <!-- Cuota Fija Banco: (Financial + Insurances + Base ITF) -->
              <td class="px-4 py-3 text-right font-mono text-slate-700">
                {{
                  formatCurrency(
                    (row.financialPayment || 0) +
                      (row.desgravamen || 0) +
                      (row.fireInsurance || 0) +
                      (row.itfBase || 0),
                  )
                }}
              </td>

              <!-- Amortización Extra -->
              <td
                class="px-4 py-3 text-right font-mono font-medium"
                :class="row.extraCapital > 0 ? 'text-emerald-600' : 'text-slate-300'"
              >
                {{ row.extraCapital > 0 ? formatCurrency(row.extraCapital) : '-' }}
              </td>

              <!-- ITF Prepago -->
              <td class="px-4 py-3 text-right font-mono text-xs text-slate-500">
                {{ row.itfExtra > 0 ? formatCurrency(row.itfExtra) : '-' }}
              </td>

              <!-- Total Mes -->
              <td class="px-4 py-3 text-right font-mono font-bold text-slate-900 bg-slate-50/30">
                {{ formatCurrency(row.payment) }}
              </td>

              <!-- Breakdown -->
              <td class="px-4 py-3 text-right font-mono text-slate-500 text-xs">
                {{ formatCurrency(row.capital) }}
              </td>
              <td class="px-4 py-3 text-right font-mono text-blue-600 text-xs">
                {{ formatCurrency(row.interest) }}
              </td>
              <td class="px-4 py-3 text-right font-mono text-orange-600 text-xs">
                {{ formatCurrency((row.desgravamen || 0) + (row.fireInsurance || 0)) }}
              </td>
              <td class="px-4 py-3 text-right font-mono text-slate-400 text-xs">
                {{ formatCurrency(row.balance) }}
              </td>

              <!-- Hitos -->
              <td class="px-2 py-3 text-center align-middle">
                <div class="flex flex-col items-center justify-center gap-1">
                  <!-- Acceleration Badge -->
                  <span
                    v-if="row.status === 'acceleration'"
                    title="Inyección de Ataque Activa"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    <iconify-icon icon="mdi:rocket-launch" class="mr-1"></iconify-icon> Aceleración
                  </span>

                  <!-- Pivot Badge -->
                  <span
                    v-if="row.status === 'pivot'"
                    title="¡Punto de Equilibrio Alcanzado! Cambio a estrategia de mantenimiento."
                    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 ring-2 ring-purple-50"
                  >
                    <iconify-icon icon="mdi:swap-horizontal-bold" class="mr-1"></iconify-icon> Pivot
                  </span>

                  <!-- Protected Badge -->
                  <span
                    v-if="row.status === 'protected'"
                    title="Equilibrio Protegido: Manteniendo liquidez"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200"
                  >
                    <iconify-icon icon="mdi:shield-check" class="mr-1"></iconify-icon> Protegido
                  </span>

                  <!-- Legacy Crossover (Only if not handled by status) -->
                  <span
                    v-if="row.isCrossover && !row.status"
                    title="Punto de Quiebre: Capital supera Interés"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600"
                  >
                    Cross
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
