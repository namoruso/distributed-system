import axios from 'axios';

export const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const productsAPI = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const inventoryAPI = axios.create({
  baseURL: import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const paymentsAPI = axios.create({
  baseURL: import.meta.env.VITE_PAYMENTS_SERVICE_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
const addAuthToken = (config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

[productsAPI, inventoryAPI].forEach(api => {
  api.interceptors.request.use(addAuthToken, error => Promise.reject(error));
});

const handleResponseError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    let errorMessage = data.message || data.error || 'An error occurred';
    
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
      } else {
        errorMessage = data.detail;
      }
    }

    return Promise.reject({
      status,
      message: errorMessage,
      errors: data.errors || null
    });
  } else if (error.request) {
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: null
    });
  } else {
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null
    });
  }
};

[authAPI, productsAPI, inventoryAPI].forEach(api => {
  api.interceptors.response.use(
    response => response,
    handleResponseError
  );
});

paymentsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default {
  authAPI,
  productsAPI,
  inventoryAPI,
  paymentsAPI
};
