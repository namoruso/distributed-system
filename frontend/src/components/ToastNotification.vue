<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="getToastClass(toast.type)"
          @click="removeToast(toast.id)"
        >
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else-if="toast.type === 'warning'" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <svg v-else width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="toast-content">
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l6 6m0-6l-6 6"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();

const getToastClass = (type) => {
  return `toast-${type}`;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--navbar-height) + var(--space-4));
  right: var(--space-4);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-error {
  border-left: 4px solid var(--color-error);
}

.toast-warning {
  border-left: 4px solid #fbbf24;
}

.toast-info {
  border-left: 4px solid var(--color-primary);
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: var(--color-error);
}

.toast-warning .toast-icon {
  color: #fbbf24;
}

.toast-info .toast-icon {
  color: var(--color-primary);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  padding: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

/* Toast Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .toast-container {
    left: var(--space-4);
    right: var(--space-4);
    max-width: none;
  }
}
</style>
