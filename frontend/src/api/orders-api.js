import axios from 'axios';

const ordersAPI = axios.create({
  baseURL: import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

ordersAPI.interceptors.request.use(
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

ordersAPI.interceptors.response.use(
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
  createOrder(orderData) {
    return ordersAPI.post('/orders', orderData);
  },

  getUserOrders(params = {}) {
    return ordersAPI.get('/orders', { params });
  },

  getOrderById(orderId) {
    return ordersAPI.get(`/orders/${orderId}`);
  },
  updateOrderStatus(orderId, status) {
    return ordersAPI.put(`/orders/${orderId}/status`, { status });
  },

  getAllOrders(params = {}) {
    return ordersAPI.get('/orders/admin/all', { params });
  },

  cancelOrder(orderId) {
    return ordersAPI.put(`/orders/${orderId}/cancel`);
  },

  healthCheck() {
    return ordersAPI.get('/health');
  },
};
