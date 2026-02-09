<script setup lang="ts">
interface StrategySummary {
  hasStrategy: boolean;
  totalSavings: number;
  newEndDate: number | null;
  operationsCount: number;
  totalInvestment: number;
  originalInterest: number;
  strategyInterest: number;
  totalITF: number;
  totalCapitalInjected: number;
}

defineProps<{
  summary: StrategySummary;
  termYears: number;
}>();

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(val);
};
</script>

<template>
  <div
    v-if="summary.hasStrategy"
    class="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden transition-all hover:shadow-md"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <iconify-icon icon="mdi:finance" width="24"></iconify-icon>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-800">Resumen Global de Estrategia</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span
              class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1"
            >
              <iconify-icon icon="mdi:lightning-bolt" width="10"></iconify-icon>
              Ejecutando {{ summary.operationsCount }} inyecciones
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: Financial Breakdown -->
      <div class="space-y-4">
        <div class="space-y-3 text-sm">
          <div class="flex justify-between items-center text-slate-600">
            <span>Total Capital Inyectado</span>
            <span class="font-bold text-slate-800">{{
              formatCurrency(summary.totalCapitalInjected)
            }}</span>
          </div>
          <div class="flex justify-between items-center text-slate-500 text-xs">
            <span>Total Impuestos (ITF) Proyectados</span>
            <span>{{ formatCurrency(summary.totalITF) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
            <span class="font-bold text-emerald-800">Inversión Total en Amortización</span>
            <span class="text-xl font-bold text-emerald-700">{{
              formatCurrency(summary.totalInvestment)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Impact & Education -->
      <div class="space-y-4">
        <!-- Interest Comparison -->
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <p class="text-[10px] uppercase font-bold text-slate-400 mb-2 text-center">
            Interés Total a Pagar
          </p>
          <div class="flex items-end justify-between px-2">
            <div class="text-center">
              <p class="text-xs text-slate-500 line-through decoration-red-400 decoration-2">
                {{ formatCurrency(summary.originalInterest) }}
              </p>
              <p class="text-[10px] text-slate-400">Original</p>
            </div>
            <div class="mb-1">
              <iconify-icon
                icon="mdi:arrow-right-bold"
                class="text-slate-300"
                width="16"
              ></iconify-icon>
            </div>
            <div class="text-center">
              <p class="text-sm font-bold text-emerald-600">
                {{ formatCurrency(summary.strategyInterest) }}
              </p>
              <p class="text-[10px] text-emerald-600">Con Estrategia</p>
            </div>
          </div>
          <div class="mt-2 text-center">
            <span
              class="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full shadow-sm shadow-emerald-200"
            >
              Ahorras {{ formatCurrency(summary.totalSavings) }}
            </span>
          </div>
        </div>

        <!-- Educational Message -->
        <div
          class="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 leading-relaxed relative"
        >
          <div class="absolute top-3 left-3 text-blue-400">
            <iconify-icon icon="mdi:lightbulb-on" width="16"></iconify-icon>
          </div>
          <div class="pl-6">
            <span class="font-bold block mb-1 text-blue-900">Impacto Inteligente</span>
            <span v-if="summary.newEndDate">
              Tu deuda terminaría en el mes {{ summary.newEndDate }} en lugar del
              {{ termYears * 12 }}, liberándote {{ termYears * 12 - summary.newEndDate }} meses
              antes.
            </span>
            <span v-else>
              Cada sol adelantado reduce directamente tu deuda, bajando los intereses futuros y
              protegiendo tu patrimonio.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
