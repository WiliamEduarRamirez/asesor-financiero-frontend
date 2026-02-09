<script setup lang="ts">
import { ref } from 'vue';
import type { RefinancingEvent } from '../composables/useDebtOptimization';

const props = defineProps<{
  refinancingEvents: RefinancingEvent[];
}>();

const emit = defineEmits<{
  'add-event': [event: Omit<RefinancingEvent, 'id'>];
  'remove-event': [id: string];
  'update-event': [id: string, updates: Partial<Omit<RefinancingEvent, 'id'>>];
}>();

// Form state
const showForm = ref(false);
const eventForm = ref({
  month: 12,
  newRate: 8.5,
  closingCosts: 5000,
  color: '#e0f2fe', // Light blue tint
  label: '',
});

// Predefined color palette
const colorPalette = [
  { name: 'Azul Claro', value: '#e0f2fe' },
  { name: 'Verde Claro', value: '#dcfce7' },
  { name: 'Amarillo Claro', value: '#fef9c3' },
  { name: 'Rosa Claro', value: '#fce7f3' },
  { name: 'Púrpura Claro', value: '#f3e8ff' },
  { name: 'Naranja Claro', value: '#ffedd5' },
];

const addEvent = () => {
  emit('add-event', {
    month: eventForm.value.month,
    newRate: eventForm.value.newRate,
    closingCosts: eventForm.value.closingCosts,
    color: eventForm.value.color,
    label: eventForm.value.label || `Compra de Deuda - Mes ${eventForm.value.month}`,
  });

  // Reset form
  eventForm.value = {
    month: eventForm.value.month + 12,
    newRate: 8.5,
    closingCosts: 5000,
    color: '#e0f2fe',
    label: '',
  };
  showForm.value = false;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(val);
};
</script>

<template>
  <div class="pt-5 border-t border-slate-100 mt-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <iconify-icon icon="mdi:swap-horizontal-circle" class="text-purple-600"></iconify-icon>
        Optimización por Compra de Deuda
      </h3>

      <button
        @click="showForm = !showForm"
        class="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
      >
        <iconify-icon :icon="showForm ? 'mdi:minus-circle' : 'mdi:plus-circle'"></iconify-icon>
        {{ showForm ? 'Cancelar' : '+ Añadir Optimización' }}
      </button>
    </div>

    <!-- Add Event Form -->
    <div
      v-if="showForm"
      class="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100 space-y-3"
    >
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-purple-800 uppercase mb-1">
            Mes de Aplicación
          </label>
          <input
            v-model.number="eventForm.month"
            type="number"
            min="1"
            class="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-md focus:ring-1 focus:ring-purple-500 outline-none text-purple-900 bg-white"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-purple-800 uppercase mb-1">
            Nueva TEA (%)
          </label>
          <div class="relative">
            <input
              v-model.number="eventForm.newRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              class="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-md focus:ring-1 focus:ring-purple-500 outline-none text-purple-900 font-bold bg-white"
            />
            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs"
              >%</span
            >
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-purple-800 uppercase mb-1">
          Gastos de Cierre
        </label>
        <div class="relative">
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs">S/</span>
          <input
            v-model.number="eventForm.closingCosts"
            type="number"
            min="0"
            class="w-full pl-6 pr-2 py-1.5 text-sm border border-purple-200 rounded-md focus:ring-1 focus:ring-purple-500 outline-none text-purple-900 font-bold bg-white"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-purple-800 uppercase mb-1">
          Color Identificador
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="color in colorPalette"
            :key="color.value"
            @click="eventForm.color = color.value"
            :class="[
              'px-3 py-2 rounded-md border-2 text-xs font-semibold transition-all',
              eventForm.color === color.value
                ? 'border-purple-600 ring-2 ring-purple-200'
                : 'border-transparent hover:border-purple-300',
            ]"
            :style="{ backgroundColor: color.value }"
          >
            {{ color.name }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-purple-800 uppercase mb-1">
          Etiqueta (Opcional)
        </label>
        <input
          v-model="eventForm.label"
          type="text"
          placeholder="Ej: Refinanciamiento BCP"
          class="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-md focus:ring-1 focus:ring-purple-500 outline-none text-purple-900 bg-white"
        />
      </div>

      <button
        @click="addEvent"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
      >
        <iconify-icon icon="mdi:check-circle"></iconify-icon>
        Añadir Evento
      </button>
    </div>

    <!-- Events List -->
    <div v-if="refinancingEvents.length > 0" class="space-y-2">
      <div
        v-for="event in refinancingEvents"
        :key="event.id"
        class="rounded-lg p-3 border-2 flex items-center justify-between"
        :style="{ backgroundColor: event.color, borderColor: event.color }"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold text-slate-700"> 🔄 Mes {{ event.month }} </span>
            <span
              class="text-xs bg-white/70 px-2 py-0.5 rounded-full font-semibold text-purple-700"
            >
              TEA: {{ event.newRate }}%
            </span>
          </div>
          <div class="text-[10px] text-slate-600">
            <span class="font-semibold">Gastos:</span> {{ formatCurrency(event.closingCosts) }}
            <span v-if="event.label" class="ml-2">• {{ event.label }}</span>
          </div>
        </div>

        <button
          @click="emit('remove-event', event.id)"
          class="ml-3 text-red-500 hover:text-red-700 transition-colors"
        >
          <iconify-icon icon="mdi:delete-circle" class="text-xl"></iconify-icon>
        </button>
      </div>
    </div>

    <div
      v-else-if="!showForm"
      class="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg"
    >
      <iconify-icon icon="mdi:information-outline" class="text-2xl mb-2"></iconify-icon>
      <p>No hay eventos de optimización configurados</p>
      <p class="text-[10px] mt-1">Haz clic en "+ Añadir Optimización" para crear uno</p>
    </div>
  </div>
</template>
