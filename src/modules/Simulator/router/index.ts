import type { RouteRecordRaw } from 'vue-router';
import SimulatorView from '../SimulatorView.vue';

export const simulatorRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'simulator',
    component: SimulatorView,
  },
];
