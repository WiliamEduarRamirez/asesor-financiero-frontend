<script setup lang="ts">
import { computed } from 'vue';
import type { RefinancingEvent } from '../composables/useDebtOptimization';

const props = defineProps<{
  refinancingEvents: RefinancingEvent[];
  initialMonthlyPayment: number;
  initialRate: number;
  termMonths: number;
  amortizationSchedule: Array<{
    month: number;
    financialPayment?: number;
    tea?: number;
  }>;
}>();

interface PaymentPeriod {
  label: string;
  startMonth: number;
  endMonth: number;
  monthlyPayment: number;
  tea: number;
  color: string;
  savings: number;
}

const paymentPeriods = computed<PaymentPeriod[]>(() => {
  if (props.refinancingEvents.length === 0) {
    return [];
  }

  const sortedEvents = [...props.refinancingEvents].sort((a, b) => a.month - b.month);
  const periods: PaymentPeriod[] = [];

  // Period 1: From month 1 to first event
  const firstEvent = sortedEvents[0];
  if (firstEvent && firstEvent.month > 1) {
    periods.push({
      label: 'Tramo 1',
      startMonth: 1,
      endMonth: firstEvent.month - 1,
      monthlyPayment: props.initialMonthlyPayment,
      tea: props.initialRate,
      color: '#ffffff',
      savings: 0,
    });
  }

  // Subsequent periods
  sortedEvents.forEach((event, index) => {
    const nextEvent = sortedEvents[index + 1];
    const endMonth = nextEvent ? nextEvent.month - 1 : props.termMonths;

    // Find the monthly payment for this period from the schedule
    const sampleRow = props.amortizationSchedule.find((row) => row.month === event.month);
    const monthlyPayment = sampleRow?.financialPayment || props.initialMonthlyPayment;

    periods.push({
      label: `Tramo ${periods.length + 1}`,
      startMonth: event.month,
      endMonth,
      monthlyPayment,
      tea: event.newRate,
      color: event.color,
      savings: props.initialMonthlyPayment - monthlyPayment,
    });
  });

  return periods;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

<template>
  <div
    v-if="paymentPeriods.length > 0"
    class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-700 flex items-center gap-2">
        <iconify-icon icon="mdi:timeline-clock" class="text-purple-600"></iconify-icon>
        Progresión de Cuotas y Optimización
      </h3>
      <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
        {{ paymentPeriods.length }} Tramos
      </span>
    </div>

    <p class="text-sm text-slate-600 mb-4">
      Evolución de tu pago mensual a medida que optimizas tu deuda con mejores tasas
    </p>

    <div class="space-y-3">
      <div
        v-for="(period, index) in paymentPeriods"
        :key="index"
        class="relative rounded-lg border-2 p-4 transition-all hover:shadow-md"
        :style="{
          backgroundColor: period.color,
          borderColor: period.color === '#ffffff' ? '#e2e8f0' : period.color,
        }"
      >
        <!-- Period Header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              {{ period.label }}
              <span
                class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal"
              >
                Mes {{ period.startMonth }} - {{ period.endMonth }}
              </span>
            </h4>
            <p class="text-xs text-slate-500 mt-1">
              {{ period.endMonth - period.startMonth + 1 }} meses en este tramo
            </p>
          </div>

          <div
            v-if="period.savings > 0"
            class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <iconify-icon icon="mdi:arrow-down-circle"></iconify-icon>
            Ahorras {{ formatCurrency(period.savings) }}/mes
          </div>
        </div>

        <!-- Payment Details -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white/70 rounded-lg p-3 border border-slate-200">
            <p class="text-xs text-slate-500 mb-1">Pago Mensual</p>
            <p class="text-xl font-bold text-slate-900">
              {{ formatCurrency(period.monthlyPayment) }}
            </p>
          </div>

          <div class="bg-white/70 rounded-lg p-3 border border-slate-200">
            <p class="text-xs text-slate-500 mb-1">Tasa Efectiva Anual</p>
            <p class="text-xl font-bold text-purple-700">{{ period.tea.toFixed(2) }}%</p>
          </div>
        </div>

        <!-- Connector Line -->
        <div
          v-if="index < paymentPeriods.length - 1"
          class="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10"
        >
          <div class="bg-purple-500 text-white rounded-full p-1">
            <iconify-icon icon="mdi:arrow-down" class="text-sm"></iconify-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div
      class="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200"
    >
      <div class="flex items-center gap-2 mb-2">
        <iconify-icon icon="mdi:lightbulb-on" class="text-purple-600 text-xl"></iconify-icon>
        <h4 class="text-sm font-bold text-purple-900">Beneficio Total</h4>
      </div>
      <p class="text-xs text-purple-700 leading-relaxed">
        Al optimizar tu deuda con {{ paymentPeriods.length - 1 }} compra(s) de deuda, reduces
        progresivamente tu cuota mensual y pagas menos intereses a lo largo del tiempo. Los colores
        de cada tramo coinciden con los de la tabla de amortización para fácil identificación.
      </p>
    </div>
  </div>
</template>
