<script setup lang="ts">
import type { Prepayment, PrepaymentStrategy } from '../models/mortgage.model';

defineProps<{
  show: boolean;
  prepayments: Prepayment[];
  prepaymentStrategy: PrepaymentStrategy;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:prepaymentStrategy', value: PrepaymentStrategy): void;
  (e: 'add-prepayment'): void;
  (e: 'remove-prepayment', index: number): void;
}>();

const close = () => {
  emit('update:show', false);
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal Content -->
      <div
        class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <iconify-icon icon="mdi:cash-fast" class="text-emerald-600"></iconify-icon>
            Configurar Pagos Anticipados
          </h3>
          <button
            @click="close"
            class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <iconify-icon icon="mdi:close" width="20"></iconify-icon>
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <!-- Strategy Toggle (Moved here) -->
          <div class="flex bg-slate-100 p-1 rounded-lg">
            <button
              @click="emit('update:prepaymentStrategy', 'reduce_term')"
              class="flex-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200"
              :class="
                prepaymentStrategy === 'reduce_term'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              "
            >
              Reducir Plazo
            </button>
            <button
              @click="emit('update:prepaymentStrategy', 'reduce_payment')"
              class="flex-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200"
              :class="
                prepaymentStrategy === 'reduce_payment'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              "
            >
              Reducir Cuota
            </button>
          </div>
          <div v-if="prepayments.length === 0" class="text-center py-8 text-slate-500">
            <iconify-icon
              icon="mdi:cash-multiple"
              width="48"
              class="text-slate-300 mb-2 block mx-auto"
            ></iconify-icon>
            <p class="text-sm">No hay pagos anticipados configurados.</p>
            <p class="text-xs mt-1">Agrega uno para reducir el plazo o la cuota.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(prep, index) in prepayments"
              :key="index"
              class="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group"
            >
              <div class="grid grid-cols-12 gap-3 items-end">
                <div class="col-span-3">
                  <label
                    class="block text-[10px] uppercase font-bold text-slate-400 mb-1"
                    :for="'prep-month-' + index"
                    >Mes</label
                  >
                  <input
                    :id="'prep-month-' + index"
                    v-model.number="prep.month"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none bg-white text-center"
                  />
                </div>
                <div class="col-span-5">
                  <label
                    class="block text-[10px] uppercase font-bold text-slate-400 mb-1"
                    :for="'prep-amount-' + index"
                    >Monto (S/)</label
                  >
                  <input
                    :id="'prep-amount-' + index"
                    v-model.number="prep.amount"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none bg-white font-semibold text-slate-700"
                  />
                </div>
                <div class="col-span-4">
                  <label
                    class="block text-[10px] uppercase font-bold text-slate-400 mb-1"
                    :for="'prep-frequency-' + index"
                    >Frecuencia</label
                  >
                  <select
                    :id="'prep-frequency-' + index"
                    v-model="prep.frequency"
                    class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none bg-white text-slate-600 appearance-none"
                  >
                    <option value="unique">Único</option>
                    <option value="recurring">Cada 12 m</option>
                  </select>
                </div>
              </div>
              <button
                @click="emit('remove-prepayment', index)"
                class="absolute -top-2 -right-2 bg-white text-red-500 border border-slate-200 rounded-full p-1 shadow-sm hover:bg-red-50 transition-all transform hover:scale-110 flex items-center justify-center"
                title="Eliminar pago"
              >
                <iconify-icon icon="mdi:close" width="14"></iconify-icon>
              </button>
            </div>
          </div>

          <!-- Add Button Moved to Bottom & Centered (Half Width) -->
          <div class="flex justify-center pt-2">
            <button
              @click="emit('add-prepayment')"
              class="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <iconify-icon icon="mdi:plus-circle" width="18"></iconify-icon>
              Agregar Inyección de Capital
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            @click="close"
            class="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
