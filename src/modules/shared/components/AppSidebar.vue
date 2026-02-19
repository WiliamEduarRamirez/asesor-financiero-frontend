<script setup lang="ts">
import { RouterLink } from 'vue-router';

const props = defineProps<{
  isOpen: boolean;
  isMobile: boolean;
}>();

const emit = defineEmits(['update:isOpen']);

const toggle = () => {
  emit('update:isOpen', !props.isOpen);
};

// Navigation items
const navItems = [
  {
    to: '/',
    icon: 'mdi:calculator-variant',
    label: 'Simulador',
    exact: true,
  },
  {
    to: '/comparison',
    icon: 'mdi:compare-horizontal',
    label: 'Comparativa',
    exact: false,
  },
];
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isMobile && isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity"
      @click="toggle"
    ></div>

    <!-- Sidebar Container -->
    <aside
      class="fixed lg:relative z-40 flex flex-col transition-all duration-300 ease-in-out h-screen"
      :class="[isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0']"
    >
      <!-- Content -->
      <div
        class="h-full flex flex-col bg-slate-900 text-white shadow-2xl overflow-hidden relative border-r border-slate-800"
        :class="['backdrop-blur-xl bg-slate-900/95', 'transition-all duration-300']"
      >
        <!-- Header -->
        <div class="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div class="min-w-8 flex justify-center">
              <iconify-icon icon="mdi:home-analytics" class="text-blue-500 text-2xl"></iconify-icon>
            </div>
            <h1
              class="text-xl font-bold tracking-tight transition-opacity duration-300"
              :class="isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'"
            >
              HipoExpert AI
            </h1>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ navigate, href, isActive, isExactActive }"
          >
            <a
              :href="href"
              @click="navigate"
              class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden"
              :class="[
                (item.exact ? isExactActive : isActive)
                  ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:shadow-inner',
                { 'justify-center px-0': !isOpen && !isMobile },
              ]"
            >
              <!-- Active Indicator Glow (Background) -->
              <div
                v-if="item.exact ? isExactActive : isActive"
                class="absolute inset-0 bg-blue-400/20 blur-xl"
              ></div>

              <!-- Icon Container -->
              <div class="min-w-6 flex justify-center z-10 relative">
                <iconify-icon
                  :icon="item.icon"
                  width="24"
                  class="transition-transform duration-300"
                  :class="{
                    'scale-110': item.exact ? isExactActive : isActive,
                    'group-hover:scale-110': !(item.exact ? isExactActive : isActive),
                  }"
                ></iconify-icon>
              </div>

              <!-- Label -->
              <span
                class="font-medium whitespace-nowrap transition-all duration-300 origin-left z-10 relative"
                :class="isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden lg:hidden'"
              >
                {{ item.label }}
              </span>

              <!-- Active Pill (Right Edge Indicator) - Optional decoration -->
              <div
                v-if="(item.exact ? isExactActive : isActive) && isOpen"
                class="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm"
              ></div>

              <!-- Tooltip for collapsed state (Desktop) -->
              <div
                v-if="!isOpen && !isMobile"
                class="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border border-slate-700/50 translate-x-2 group-hover:translate-x-0"
              >
                {{ item.label }}
              </div>
            </a>
          </RouterLink>

          <!-- Divider -->
          <div class="my-4 border-t border-slate-800 mx-2"></div>

          <!-- Section Label -->
          <div
            v-if="isOpen"
            class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 transition-opacity duration-300"
          >
            Inteligencia
          </div>

          <!-- AI Advisor Button -->
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-green-400 hover:bg-slate-800/50 hover:text-green-300 text-left transition-colors group"
            :class="{ 'justify-center px-0': !isOpen && !isMobile }"
          >
            <div class="min-w-6 flex justify-center">
              <iconify-icon
                icon="mdi:robot-outline"
                width="24"
                class="group-hover:rotate-12 transition-transform"
              ></iconify-icon>
            </div>

            <span
              class="font-medium whitespace-nowrap transition-all duration-300 origin-left ml-1"
              :class="isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden lg:hidden'"
            >
              AI Advisor
            </span>
            <span
              v-if="isOpen"
              class="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse transition-opacity duration-300"
            ></span>
          </button>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/50">
          <div class="flex items-center gap-3" :class="{ 'justify-center': !isOpen && !isMobile }">
            <div
              class="w-10 h-10 min-w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-slate-800 transition-all hover:ring-blue-500 cursor-pointer"
            >
              WR
            </div>
            <div
              class="overflow-hidden transition-all duration-300"
              :class="isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
            >
              <p class="text-sm font-medium text-white truncate">Wiliam Ramirez</p>
              <p class="text-xs text-blue-400 truncate">Plan Premium</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Toggle Button -->
      <!-- Adjusted positioning for full-height sidebar -->
      <button
        v-if="!isMobile"
        @click="toggle"
        class="hidden lg:flex absolute top-6 -right-4 z-50 w-8 h-8 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white border-2 border-white shadow-lg shadow-blue-500/30 transition-all duration-300 focus:outline-none group hover:scale-110 hover:shadow-blue-500/50"
        title="Alternar barra lateral"
      >
        <iconify-icon
          icon="mdi:chevron-left"
          class="text-lg transition-transform duration-500"
          :class="{ 'rotate-180': !isOpen }"
        ></iconify-icon>
      </button>
    </aside>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
</style>
