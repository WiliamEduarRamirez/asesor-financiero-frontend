import { createRouter, createWebHistory } from 'vue-router';
import { dashboardRoutes } from '@/modules/Dashboard/router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...dashboardRoutes],
});

export default router;
