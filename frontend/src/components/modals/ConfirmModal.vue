<template>
  <BaseModal
    :show="show"
    :max-width="maxWidth"
    :close-on-backdrop="false"
    @close="handleCancel"
  >
    <template #header>
      <div class="confirm-header">
        <div class="icon-container" :class="`variant-${variant}`">
          <component :is="iconComponent" class="icon" />
        </div>
        <h3 class="title">{{ title }}</h3>
      </div>
    </template>

    <div class="confirm-message">
      {{ message }}
    </div>

    <template #footer>
      <button
        class="btn btn-secondary"
        @click="handleCancel"
        :disabled="loading"
      >
        {{ cancelText }}
      </button>
      <button
        class="btn btn-primary"
        :class="`variant-${variant}`"
        @click="handleConfirm"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner"></span>
        <span v-else>{{ confirmText }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'warning',
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  maxWidth: {
    type: String,
    default: '450px'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const iconComponent = computed(() => {
  const icons = {
    danger: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon
  };
  return icons[props.variant];
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.confirm-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container.variant-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.icon-container.variant-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.icon-container.variant-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.icon-container.variant-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.icon {
  width: 28px;
  height: 28px;
}

.icon-container.variant-danger .icon {
  color: #ef4444;
}

.icon-container.variant-warning .icon {
  color: #f59e0b;
}

.icon-container.variant-info .icon {
  color: #3b82f6;
}

.icon-container.variant-success .icon {
  color: #10b981;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0;
}

.confirm-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #d1d5db;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.3);
  border-color: rgba(107, 114, 128, 0.4);
  transform: translateY(-1px);
}

.btn-primary {
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-primary.variant-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.btn-primary.variant-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.btn-primary.variant-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.btn-primary.variant-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px);
}

.btn-primary.variant-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.btn-primary.variant-info:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-primary.variant-success {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.btn-primary.variant-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .title {
    font-size: 1.1rem;
  }
  
  .confirm-message {
    font-size: 0.95rem;
  }
  
  .btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    min-width: 90px;
  }
}
</style>
