<template>
  <div class="notification-bell">
    <button 
      @click="toggleDropdown" 
      class="bell-button"
      :class="{ 'has-unread': unreadCount > 0 }"
    >
      <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="isOpen" class="notifications-dropdown">
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <button 
          v-if="unreadCount > 0" 
          @click="handleMarkAllAsRead" 
          class="mark-all-btn"
        >
          Mark all as read
        </button>
      </div>

      <div v-if="loading" class="dropdown-loading">
        <p>Loading notifications...</p>
      </div>
      <div v-else-if="sortedNotifications.length === 0" class="dropdown-empty">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <p>No notifications yet</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notification in sortedNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              <span v-if="!notification.read" class="unread-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationsStore } from '../store/notifications-store';
import { useAuthStore } from '../store/auth-store';

const notificationsStore = useNotificationsStore();
const authStore = useAuthStore();

const isOpen = ref(false);

const unreadCount = computed(() => notificationsStore.unreadCount);
const sortedNotifications = computed(() => notificationsStore.sortedNotifications);
const loading = computed(() => notificationsStore.loading);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

async function handleNotificationClick(notification) {
  if (!notification.read) {
    await notificationsStore.markAsRead(notification.id);
  }
}

async function handleMarkAllAsRead() {
  await notificationsStore.markAllAsRead();
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await notificationsStore.fetchNotifications();
    notificationsStore.startAutoRefresh(30000); 
  }
});

onUnmounted(() => {
  notificationsStore.stopAutoRefresh();
});
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.bell-button:hover {
  background: var(--color-bg-tertiary);
}

.bell-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.bell-button.has-unread .bell-icon {
  color: var(--color-primary);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-danger);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 360px;
  max-height: 480px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
}

.dropdown-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.mark-all-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.mark-all-btn:hover {
  background: var(--color-bg-tertiary);
}

.dropdown-loading,
.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
  opacity: 0.3;
}

.notifications-list {
  overflow-y: auto;
  max-height: 400px;
}

.notification-item {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background: var(--color-bg-tertiary);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background: rgba(var(--color-primary-rgb), 0.05);
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

@media (max-width: 480px) {
  .notifications-dropdown {
    width: calc(100vw - var(--space-8));
    right: var(--space-4);
  }
}
</style>
