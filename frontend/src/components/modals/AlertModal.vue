<template>
  <BaseModal
    :show="show"
    :max-width="maxWidth"
    @close="handleClose"
  >
    <div class="alert-content">
      <div class="icon-container" :class="`type-${type}`">
        <component :is="iconComponent" class="icon" />
      </div>
      
      <div class="alert-text">
        <h3 v-if="title" class="alert-title">{{ title }}</h3>
        <p class="alert-message">{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <button
        class="btn btn-primary"
        :class="`type-${type}`"
        @click="handleClose"
      >
        {{ buttonText }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import BaseModal from './BaseModal.vue';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  buttonText: {
    type: String,
    default: 'OK'
  },
  maxWidth: {
    type: String,
    default: '420px'
  },
  autoClose: {
    type: Number,
    default: 0 // 0 means no auto-close
  }
});

const emit = defineEmits(['close']);

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon
  };
  return icons[props.type];
});

const handleClose = () => {
  emit('close');
};

// Auto-close functionality
watch(() => props.show, (newVal) => {
  if (newVal && props.autoClose > 0) {
    setTimeout(() => {
      handleClose();
    }, props.autoClose);
  }
});
</script>

<style scoped>
.alert-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container.type-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
}

.icon-container.type-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}

.icon-container.type-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.icon-container.type-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}

.icon {
  width: 32px;
  height: 32px;
}

.icon-container.type-success .icon {
  color: #10b981;
}

.icon-container.type-error .icon {
  color: #ef4444;
}

.icon-container.type-info .icon {
  color: #3b82f6;
}

.icon-container.type-warning .icon {
  color: #f59e0b;
}

.alert-text {
  flex: 1;
  padding-top: 0.25rem;
}

.alert-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 0.5rem 0;
}

.alert-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #d1d5db;
  margin: 0;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-primary.type-success {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.btn-primary.type-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.btn-primary.type-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.btn-primary.type-error:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.btn-primary.type-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.btn-primary.type-info:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-primary.type-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.btn-primary.type-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .alert-content {
    gap: 1rem;
  }
  
  .icon-container {
    width: 48px;
    height: 48px;
  }
  
  .icon {
    width: 28px;
    height: 28px;
  }
  
  .alert-title {
    font-size: 1.1rem;
  }
  
  .alert-message {
    font-size: 0.95rem;
  }
  
  .btn {
    padding: 0.65rem 1.5rem;
    font-size: 0.9rem;
    min-width: 100px;
  }
}
</style>
