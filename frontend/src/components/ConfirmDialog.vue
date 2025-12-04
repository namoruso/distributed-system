<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="confirm-overlay" @click="handleCancel">
        <div class="confirm-dialog card" @click.stop>
          <div class="confirm-icon" :class="iconClass">
            <svg v-if="type === 'danger'" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div class="confirm-content">
            <h3 class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>

          <div class="confirm-actions">
            <button @click="handleCancel" class="btn btn-ghost">
              {{ cancelText }}
            </button>
            <button @click="handleConfirm" class="btn" :class="confirmButtonClass">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const iconClass = computed(() => {
  return {
    'icon-danger': props.type === 'danger',
    'icon-warning': props.type === 'warning',
    'icon-info': props.type === 'info'
  };
});

const confirmButtonClass = computed(() => {
  return props.type === 'danger' ? 'btn-danger' : 'btn-primary';
});

const handleConfirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: var(--space-4);
}

.confirm-dialog {
  max-width: 450px;
  width: 100%;
  padding: var(--space-8);
  animation: slideUp 0.3s ease-out;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-6);
}

.icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.icon-warning {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.confirm-content {
  text-align: center;
  margin-bottom: var(--space-6);
}

.confirm-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.confirm-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.confirm-actions .btn {
  flex: 1;
  max-width: 150px;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .confirm-dialog,
.modal-fade-leave-active .confirm-dialog {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .confirm-dialog,
.modal-fade-leave-to .confirm-dialog {
  transform: scale(0.9);
}
</style>
