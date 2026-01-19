import axios from 'axios';

const notificationsAPI = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATIONS_API_URL || 'http://localhost:5040/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

notificationsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

notificationsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  getUserNotifications() {
    return notificationsAPI.get('/notifications');
  },
  getNotificationById(id) {
    return notificationsAPI.get(`/notifications/${id}`);
  },

  markAsRead(id) {
    return notificationsAPI.put(`/notifications/${id}/read`);
  },
  healthCheck() {
    return notificationsAPI.get('/health');
  },
};
