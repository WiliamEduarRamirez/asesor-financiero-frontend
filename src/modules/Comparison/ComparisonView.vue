<script setup lang="ts">
import { ref } from 'vue';

const projects = ref([
  { id: 1, name: 'Proyecto Villarán', price: 450000, rate: 8.5, term: 20 },
  { id: 2, name: 'Residencial Camelia', price: 380000, rate: 7.9, term: 25 },
  { id: 3, name: 'Edificio Park View', price: 520000, rate: 9.1, term: 15 },
]);

// Helper to calculate payment for comparison (simplified using same store logic logic locally or repeated)
const calculatePayment = (price: number, rate: number, term: number) => {
  const downPayment = price * 0.2; // Assume 20%
  const loan = price - downPayment;
  const r = rate / 100 / 12;
  const n = term * 12;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Comparativa de Proyectos</h2>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <iconify-icon icon="mdi:plus"></iconify-icon>
        Agregar Proyecto
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider"
          >
            <th class="p-4">Proyecto</th>
            <th class="p-4">Precio Total</th>
            <th class="p-4">Tasa (TEA)</th>
            <th class="p-4">Plazo</th>
            <th class="p-4">Cuota Estimada</th>
            <th class="p-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="p in projects"
            :key="p.id"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <td class="p-4 font-medium text-slate-900 flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"
              >
                <iconify-icon icon="mdi:building" width="20"></iconify-icon>
              </div>
              {{ p.name }}
            </td>
            <td class="p-4 text-slate-600 font-medium">
              {{ formatCurrency(p.price) }}
            </td>
            <td class="p-4">
              <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-semibold"
                >{{ p.rate }}%</span
              >
            </td>
            <td class="p-4 text-slate-600">{{ p.term }} años</td>
            <td class="p-4 font-bold text-slate-800">
              {{ formatCurrency(calculatePayment(p.price, p.rate, p.term)) }}
            </td>
            <td class="p-4 text-center">
              <button
                class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
              >
                <iconify-icon icon="mdi:eye" width="20"></iconify-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
