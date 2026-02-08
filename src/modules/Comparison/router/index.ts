import type { RouteRecordRaw } from 'vue-router';
import ComparisonView from '../ComparisonView.vue';

export const comparisonRoutes: RouteRecordRaw[] = [
  {
    path: 'comparison',
    name: 'comparison',
    component: ComparisonView,
  },
];
