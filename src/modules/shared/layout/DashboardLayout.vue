<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
      <div class="p-6 border-b border-slate-800">
        <h1 class="text-xl font-bold flex items-center gap-2 tracking-tight">
          <iconify-icon icon="mdi:home-analytics" class="text-blue-500 text-2xl"></iconify-icon>
          <span>HipoExpert AI</span>
        </h1>
      </div>

      <nav class="flex-1 px-3 py-6 space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50"
        >
          <iconify-icon
            icon="mdi:calculator-variant"
            width="20"
            class="group-hover:scale-110 transition-transform"
          ></iconify-icon>
          <span class="font-medium">Simulador</span>
        </RouterLink>

        <RouterLink
          to="/comparison"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/50"
        >
          <iconify-icon
            icon="mdi:compare-horizontal"
            width="20"
            class="group-hover:scale-110 transition-transform"
          ></iconify-icon>
          <span class="font-medium">Comparativa</span>
        </RouterLink>

        <div class="my-4 border-t border-slate-800 mx-2"></div>
        <div class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Inteligencia
        </div>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-green-400 hover:bg-slate-800 hover:text-green-300 text-left transition-colors group"
        >
          <iconify-icon
            icon="mdi:robot-outline"
            width="20"
            class="group-hover:rotate-12 transition-transform"
          ></iconify-icon>
          <span class="font-medium">AI Advisor</span>
          <span class="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </button>
      </nav>

      <div class="p-4 border-t border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-slate-800"
          >
            WR
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-medium text-white truncate">Wiliam Ramirez</p>
            <p class="text-xs text-blue-400 truncate">Plan Premium</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto relative bg-slate-50">
      <div class="max-w-7xl mx-auto p-8">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
