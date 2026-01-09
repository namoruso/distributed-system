import axios from 'axios';

const ordersAPI = axios.create({
  baseURL: import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar JWT token
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

// Response interceptor para manejar errores
ordersAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Orders API Methods
export default {
  // Create a new order
  createOrder(orderData) {
    return ordersAPI.post('/orders', orderData);
  },

  // Get user's orders with pagination and filters
  getUserOrders(params = {}) {
    return ordersAPI.get('/orders', { params });
  },

  // Get specific order details
  getOrderById(orderId) {
    return ordersAPI.get(`/orders/${orderId}`);
  },

  // Update order status (admin only)
  updateOrderStatus(orderId, status) {
    return ordersAPI.put(`/orders/${orderId}/status`, { status });
  },

  // Health check
  healthCheck() {
    return ordersAPI.get('/health');
  },
};
