import type { RouteRecordRaw } from 'vue-router';
import DashboardLayout from '../../shared/layout/DashboardLayout.vue';
import { simulatorRoutes } from '@/modules/Simulator/router';
import { comparisonRoutes } from '@/modules/Comparison/router';

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DashboardLayout,
    children: [...simulatorRoutes, ...comparisonRoutes],
  },
];
