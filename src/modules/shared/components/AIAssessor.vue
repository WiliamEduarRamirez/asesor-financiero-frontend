<script setup lang="ts">
import { ref } from 'vue';

const recommendations = ref([
  {
    id: 1,
    title: 'Optimización de Cuota',
    text: 'Si incrementas tu inicial en S/ 5,000, tu cuota mensual bajaría en aprox. S/ 85.',
    type: 'suggestion',
    timestamp: 'Hace 2 min',
  },
  {
    id: 2,
    title: 'Tendencia de Mercado',
    text: 'Las tasas de interés han bajado 0.5% esta semana. Es un buen momento para fijar tasa.',
    type: 'insight',
    timestamp: 'Hace 1 hora',
  },
  {
    id: 3,
    title: 'Alerta de Riesgo',
    text: 'Tu cuota mensual supera el 30% de tus ingresos. Considera extender el plazo a 25 años.',
    type: 'warning',
    timestamp: 'Hace 5 min',
  },
]);

const getIcon = (type: string) => {
  switch (type) {
    case 'suggestion':
      return 'mdi:lightbulb-on-outline';
    case 'insight':
      return 'mdi:trending-down';
    case 'warning':
      return 'mdi:alert-octagon-outline';
    default:
      return 'mdi:information-outline';
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'suggestion':
      return 'text-blue-500 bg-blue-50 border-blue-100';
    case 'insight':
      return 'text-green-500 bg-green-50 border-green-100';
    case 'warning':
      return 'text-amber-500 bg-amber-50 border-amber-100';
    default:
      return 'text-slate-500 bg-slate-50 border-slate-100';
  }
};
</script>

<template>
  <div
    class="h-full bg-white border-l border-slate-200 flex flex-col shadow-xl w-80 fixed right-0 top-0 bottom-0 z-30 transform transition-transform duration-300"
  >
    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <iconify-icon icon="mdi:robot-excited" class="text-blue-600 text-xl"></iconify-icon>
        Asesor AI
      </h3>
      <button class="text-slate-400 hover:text-slate-600">
        <iconify-icon icon="mdi:close"></iconify-icon>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="item in recommendations"
        :key="item.id"
        class="p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer"
        :class="getColor(item.type)"
      >
        <div class="flex items-start gap-3">
          <div class="mt-1">
            <iconify-icon :icon="getIcon(item.type)" class="text-xl"></iconify-icon>
          </div>
          <div>
            <h4 class="font-semibold text-sm mb-1 opacity-90">
              {{ item.title }}
            </h4>
            <p class="text-xs opacity-80 leading-relaxed">{{ item.text }}</p>
            <span class="text-[10px] font-medium mt-2 block opacity-60 uppercase tracking-wide">{{
              item.timestamp
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-slate-100 bg-slate-50">
      <button
        class="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
      >
        <iconify-icon icon="mdi:sparkles"></iconify-icon>
        Generar Nuevo Reporte
      </button>
    </div>
  </div>
</template>
