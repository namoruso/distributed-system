import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import notificationsAPI from '../api/notifications-api';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const autoRefreshInterval = ref(null);
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length;
  });

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });

  async function fetchNotifications() {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await notificationsAPI.getUserNotifications();
      
      if (response.data.success) {
        notifications.value = response.data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(id) {
    try {
      const response = await notificationsAPI.markAsRead(id);
      
      if (response.data.success) {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
          notification.read = true;
          notification.updatedAt = new Date().toISOString();
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  async function markAllAsRead() {
    const unreadNotifications = notifications.value.filter(n => !n.read);
    
    try {
      await Promise.all(
        unreadNotifications.map(notification => markAsRead(notification.id))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }

  function startAutoRefresh(intervalMs = 30000) {
    if (autoRefreshInterval.value) {
      stopAutoRefresh();
    }
    
    autoRefreshInterval.value = setInterval(() => {
      fetchNotifications();
    }, intervalMs);
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value);
      autoRefreshInterval.value = null;
    }
  }

  function reset() {
    notifications.value = [];
    loading.value = false;
    error.value = null;
    stopAutoRefresh();
  }

  return {
    notifications,
    loading,
    error,
    
    unreadCount,
    sortedNotifications,
    
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startAutoRefresh,
    stopAutoRefresh,
    reset,
  };
});
