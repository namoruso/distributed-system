<template>
  <span :class="['order-status-badge', statusClass]">
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusConfig = {
  CREADO: { text: "Created", class: "status-created" },
  PAGADO: { text: "Paid", class: "status-paid" },
  ENVIADO: { text: "Shipped", class: "status-shipped" },
  COMPLETADO: { text: "Completed", class: "status-completed" },
  CANCELADO: { text: "Cancelled", class: "status-cancelled" },
};

const statusText = computed(() => {
  return statusConfig[props.status]?.text || props.status;
});

const statusClass = computed(() => {
  return statusConfig[props.status]?.class || "status-unknown";
});
</script>

<style scoped>
.order-status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-created {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-paid {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-shipped {
  background-color: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-completed {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-unknown {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}
</style>
