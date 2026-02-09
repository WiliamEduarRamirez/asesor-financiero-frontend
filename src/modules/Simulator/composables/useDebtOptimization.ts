import { ref, computed } from 'vue';

export interface RefinancingEvent {
  id: string;
  month: number;
  newRate: number; // Nueva TEA %
  closingCosts: number; // Gastos de cierre en soles
  color: string; // Color identificador (hex)
  label?: string; // Etiqueta opcional
}

export function useDebtOptimization() {
  // State
  const refinancingEvents = ref<RefinancingEvent[]>([]);

  // Computed
  const sortedEvents = computed(() => {
    return [...refinancingEvents.value].sort((a, b) => a.month - b.month);
  });

  const hasEvents = computed(() => refinancingEvents.value.length > 0);

  // Methods
  const addEvent = (event: Omit<RefinancingEvent, 'id'>) => {
    const newEvent: RefinancingEvent = {
      ...event,
      id: `refi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    refinancingEvents.value.push(newEvent);
  };

  const removeEvent = (id: string) => {
    const index = refinancingEvents.value.findIndex((e) => e.id === id);
    if (index !== -1) {
      refinancingEvents.value.splice(index, 1);
    }
  };

  const updateEvent = (id: string, updates: Partial<Omit<RefinancingEvent, 'id'>>) => {
    const event = refinancingEvents.value.find((e) => e.id === id);
    if (event) {
      Object.assign(event, updates);
    }
  };

  const clearEvents = () => {
    refinancingEvents.value = [];
  };

  const getEventForMonth = (month: number): RefinancingEvent | undefined => {
    return sortedEvents.value.find((e) => e.month === month);
  };

  const getActiveRateForMonth = (month: number, baseRate: number): number => {
    // Find the most recent refinancing event before or at this month
    const applicableEvents = sortedEvents.value.filter((e) => e.month <= month);
    if (applicableEvents.length === 0) {
      return baseRate;
    }
    const lastEvent = applicableEvents[applicableEvents.length - 1];
    return lastEvent?.newRate ?? baseRate;
  };

  const getColorForMonth = (month: number): string | undefined => {
    // Find which refinancing period this month belongs to
    const applicableEvents = sortedEvents.value.filter((e) => e.month <= month);
    if (applicableEvents.length === 0) {
      return undefined;
    }
    const lastEvent = applicableEvents[applicableEvents.length - 1];
    return lastEvent?.color;
  };

  return {
    // State
    refinancingEvents,

    // Computed
    sortedEvents,
    hasEvents,

    // Methods
    addEvent,
    removeEvent,
    updateEvent,
    clearEvents,
    getEventForMonth,
    getActiveRateForMonth,
    getColorForMonth,
  };
}
