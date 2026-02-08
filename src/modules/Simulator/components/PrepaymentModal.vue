<script setup lang="ts">
import { ref } from 'vue';
import type { Prepayment, PrepaymentStrategy, StrategyComparison } from '../models/mortgage.model';

const props = defineProps<{
  show: boolean;
  prepayments: Prepayment[];
  prepaymentStrategy: PrepaymentStrategy;
  validatePrepayment: (
    amount: number,
    month: number,
  ) => { isValid: boolean; message?: string; isEfficient?: boolean };
  compareStrategies: (amount: number, month: number) => StrategyComparison;
}>();

const comparisonResults = ref<Record<number, StrategyComparison>>({});
const showComparison = ref<Record<number, boolean>>({});

const toggleComparison = (index: number, amount: number, month: number) => {
  if (showComparison.value[index]) {
    showComparison.value[index] = false;
    return;
  }
  const result = props.compareStrategies(amount, month);
  comparisonResults.value[index] = result;
  showComparison.value[index] = true;
};

const getValidation = (amount: number, month: number) => {
  if (!amount || !month) return { isValid: true };
  return props.validatePrepayment(amount, month);
};

const activeTab = ref<'manual' | 'recurring'>('recurring');

// Recurring Form State
const recurringForm = ref({
  amount: 0,
  startMonth: 1,
  interval: 6, // Default every 6 months
});

const addRecurringPrepayment = () => {
  if (recurringForm.value.amount <= 0) return;

  // Check if there is already a recurring rule? The prompt implies "The motor must autocomplete...".
  // If we add it to the list, we treat it as just another prepayment object but with frequency='recurring'.
  // We can allow multiple recurring rules theoretically, but maybe UI should simplify.
  // "Crea una interfaz donde el usuario ingrese un Monto y una Frecuencia...".

  // Let's add it to the list.
  emit('add-recurring-prepayment', {
    amount: recurringForm.value.amount,
    month: recurringForm.value.startMonth,
    frequency: 'recurring',
    interval: recurringForm.value.interval,
  });

  // Reset form? Or keep it?
  recurringForm.value.amount = 0;
};

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:prepaymentStrategy', value: PrepaymentStrategy): void;
  (e: 'add-prepayment'): void;
  (e: 'add-recurring-prepayment', value: Prepayment): void;
  (e: 'remove-prepayment', index: number): void;
}>();

const close = () => {
  emit('update:show', false);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
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

        <!-- Tabs Header -->
        <div class="flex border-b border-slate-100">
          <button
            @click="activeTab = 'recurring'"
            class="flex-1 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'recurring' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
            "
          >
            Regla Recurrente
            <div
              v-if="activeTab === 'recurring'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
            ></div>
          </button>
          <button
            @click="activeTab = 'manual'"
            class="flex-1 py-3 text-sm font-medium transition-colors relative"
            :class="
              activeTab === 'manual' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
            "
          >
            Ajustes Puntuales
            <div
              v-if="activeTab === 'manual'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
            ></div>
          </button>
        </div>

        <!-- Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          <!-- RECURRING TAB -->
          <div v-if="activeTab === 'recurring'" class="space-y-6">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <iconify-icon icon="mdi:autorenew" class="text-emerald-600"></iconify-icon>
                Configurar Inyección Automática
              </h4>

              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label
                    for="rec-amount"
                    class="block text-xs font-bold text-slate-500 uppercase mb-1"
                    >Monto a Inyectar (S/)</label
                  >
                  <input
                    id="rec-amount"
                    v-model.number="recurringForm.amount"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label
                    for="rec-interval"
                    class="block text-xs font-bold text-slate-500 uppercase mb-1"
                    >Cada Cuánto</label
                  >
                  <select
                    id="rec-interval"
                    v-model.number="recurringForm.interval"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 bg-white"
                  >
                    <option :value="1">Cada mes</option>
                    <option :value="3">Cada 3 meses</option>
                    <option :value="6">Cada 6 meses</option>
                    <option :value="12">Cada año</option>
                  </select>
                </div>
                <div>
                  <label
                    for="rec-start"
                    class="block text-xs font-bold text-slate-500 uppercase mb-1"
                    >Desde el Mes</label
                  >
                  <input
                    id="rec-start"
                    v-model.number="recurringForm.startMonth"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700"
                  />
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  @click="addRecurringPrepayment"
                  :disabled="recurringForm.amount <= 0"
                  class="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <iconify-icon icon="mdi:plus"></iconify-icon>
                  Aplicar Regla
                </button>
              </div>
            </div>

            <!-- List of Active Recurring Rules (Filtered from prepayments) -->
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Reglas Activas</h4>
              <div
                v-if="prepayments.filter((p) => p.frequency === 'recurring').length === 0"
                class="text-center py-6 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200"
              >
                No hay reglas recurrentes activas.
              </div>
              <div v-else class="space-y-3">
                <div v-for="(prep, index) in prepayments" :key="'rec-' + index">
                  <div
                    v-if="prep.frequency === 'recurring'"
                    class="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm relative group"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-full bg-emerald-100 text-emerald-600">
                        <iconify-icon icon="mdi:refresh"></iconify-icon>
                      </div>
                      <div>
                        <p class="font-bold text-slate-800 text-sm">
                          {{ formatCurrency(prep.amount) }}
                        </p>
                        <p class="text-xs text-slate-500">
                          Cada {{ prep.interval }} meses • Desde mes {{ prep.month }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="emit('remove-prepayment', index)"
                      class="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <iconify-icon icon="mdi:delete" width="18"></iconify-icon>
                    </button>

                    <!-- Validation for Recurring too? Technically yes, check against first occurrence -->
                    <div
                      v-if="!getValidation(prep.amount, prep.month).isValid"
                      class="absolute -bottom-2 left-4 right-4 text-[10px] text-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shadow-sm border border-amber-200"
                    >
                      {{ getValidation(prep.amount, prep.month).message }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MANUAL TAB -->
          <div v-else class="space-y-6">
            <!-- Strategy Toggle (Moved here) -->
            <div class="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                @click="emit('update:prepaymentStrategy', 'reduce_term')"
                class="flex-1 text-xs font-medium py-1.5 rounded-md transition-all duration-200"
                :class="
                  prepaymentStrategy === 'reduce_term'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
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
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-slate-500 hover:text-slate-700'
                "
              >
                Reducir Cuota
              </button>
            </div>

            <div
              v-if="prepayments.filter((p) => p.frequency === 'unique').length === 0"
              class="text-center py-8 text-slate-500"
            >
              <iconify-icon
                icon="mdi:cash-multiple"
                width="48"
                class="text-slate-300 mb-2 block mx-auto"
              ></iconify-icon>
              <p class="text-sm">No hay pagos puntuales configurados.</p>
              <p class="text-xs mt-1">Agrega uno para un mes específico.</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="(prep, index) in prepayments" :key="index">
                <div
                  v-if="prep.frequency === 'unique'"
                  class="bg-white p-4 rounded-xl border border-slate-200 relative group shadow-sm transition-shadow hover:shadow-md"
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
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 text-center font-medium"
                      />
                    </div>
                    <div class="col-span-9">
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
                        class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 font-bold text-slate-700"
                      />
                    </div>
                    <!-- Frequency Dropdown Removed for Unique Tab context -->
                  </div>
                  <button
                    @click="emit('remove-prepayment', index)"
                    class="absolute -top-2 -right-2 bg-white text-red-500 border border-slate-200 rounded-full p-1 shadow-sm hover:bg-red-50 transition-all transform hover:scale-110 flex items-center justify-center"
                    title="Eliminar pago"
                  >
                    <iconify-icon icon="mdi:close" width="14"></iconify-icon>
                  </button>

                  <!-- Validation Message -->
                  <div
                    v-if="!getValidation(prep.amount, prep.month).isValid"
                    class="mt-2 text-xs text-amber-600 flex items-center gap-1 bg-amber-50 p-1.5 rounded"
                  >
                    <iconify-icon icon="mdi:alert" width="14"></iconify-icon>
                    {{ getValidation(prep.amount, prep.month).message }}
                  </div>

                  <!-- Analysis Toggle -->
                  <div class="mt-2 flex justify-end">
                    <button
                      @click="toggleComparison(index, prep.amount, prep.month)"
                      class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                    >
                      <iconify-icon
                        :icon="showComparison[index] ? 'mdi:chevron-up' : 'mdi:chart-box-outline'"
                      ></iconify-icon>
                      {{ showComparison[index] ? 'Ocultar Análisis' : 'Analizar Impacto' }}
                    </button>
                  </div>

                  <!-- Comparison Panel -->
                  <div
                    v-if="showComparison[index] && comparisonResults[index]"
                    class="mt-3 bg-slate-50 rounded-lg border border-slate-200 p-3 text-xs shadow-inner"
                  >
                    <div class="grid grid-cols-2 gap-3">
                      <!-- Scenario A -->
                      <div class="p-2 bg-white rounded border border-emerald-100 shadow-sm">
                        <p class="font-bold text-emerald-800 mb-1 border-b border-emerald-50 pb-1">
                          Reducir Plazo
                        </p>
                        <div class="space-y-1">
                          <p class="text-slate-500 flex justify-between">
                            <span>Ahorro:</span>
                            <span class="font-bold text-emerald-600">{{
                              formatCurrency(comparisonResults[index].scenarioA.savings)
                            }}</span>
                          </p>
                          <p class="text-slate-500 flex justify-between">
                            <span>Fin:</span>
                            <span class="font-bold text-slate-700"
                              >{{ comparisonResults[index].scenarioA.newEndDate }} meses</span
                            >
                          </p>
                        </div>
                      </div>
                      <!-- Scenario B -->
                      <div class="p-2 bg-white rounded border border-blue-100 shadow-sm">
                        <p class="font-bold text-blue-800 mb-1 border-b border-blue-50 pb-1">
                          Reducir Cuota
                        </p>
                        <div class="space-y-1">
                          <p class="text-slate-500 flex justify-between">
                            <span>Ahorro:</span>
                            <span class="font-bold text-blue-600">{{
                              formatCurrency(comparisonResults[index].scenarioB.savings)
                            }}</span>
                          </p>
                          <p class="text-slate-500 flex justify-between">
                            <span>Cuota:</span>
                            <span class="font-bold text-slate-700">{{
                              formatCurrency(comparisonResults[index].scenarioB.newMonthlyPayment)
                            }}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Button Moved to Bottom & Centered (Half Width) -->
            <div class="flex justify-center pt-2">
              <button
                @click="emit('add-prepayment')"
                class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <iconify-icon icon="mdi:plus-circle" width="18"></iconify-icon>
                Agregar Ajuste Puntual
              </button>
            </div>
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
