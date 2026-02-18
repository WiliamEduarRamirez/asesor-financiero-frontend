<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';

const route = useRoute();
const isMobile = ref(false);
const isSidebarOpen = ref(true);

const checkMobile = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 1024; // lg breakpoint

  // Only auto-adjust sidebar on strict breakpoint changes
  if (isMobile.value !== wasMobile) {
    if (isMobile.value) {
      isSidebarOpen.value = false;
    } else {
      isSidebarOpen.value = true;
    }
  }
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Close sidebar on route change on mobile
watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      isSidebarOpen.value = false;
    }
  },
);

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden relative">
    <!-- Sidebar Component -->
    <AppSidebar
      :is-open="isSidebarOpen"
      :is-mobile="isMobile"
      @update:is-open="isSidebarOpen = $event"
    />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto relative bg-slate-50 transition-all duration-300">
      <!-- Mobile/Desktop Toggle Header -->
      <header
        class="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/50 lg:hidden"
      >
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Alternar menú"
        >
          <iconify-icon icon="mdi:menu" class="text-2xl"></iconify-icon>
        </button>

        <div class="flex items-center gap-2">
          <iconify-icon icon="mdi:home-analytics" class="text-blue-600 text-xl"></iconify-icon>
          <span class="font-bold text-slate-800 tracking-tight">HipoExpert</span>
        </div>

        <div class="w-8"></div>
        <!-- Spacer for centering -->
      </header>

      <!-- Page Content -->
      <div class="max-w-7xl mx-auto p-4 lg:p-8">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
