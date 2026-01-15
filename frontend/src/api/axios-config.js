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

export const ordersAPI = axios.create({
  baseURL: import.meta.env.VITE_ORDERS_API_URL || 'http://localhost:8003/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const paymentsAPI = axios.create({
  baseURL: import.meta.env.VITE_PAYMENTS_API_URL || 'http://localhost:8002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  
  }
});

const addAuthToken = (config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

[productsAPI, inventoryAPI, ordersAPI, paymentsAPI].forEach(api => {
  api.interceptors.request.use(addAuthToken, error => Promise.reject(error));
});

const handleGenericResponseError = (error) => {
  console.error(' API Error:', error.config?.url, error.response?.status, error.message);
  
  if (error.response) {
    const { status, data } = error.response;
    
    if (status === 401) {
      console.log(' 401 Unauthorized - Token invalid or missing');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    let errorMessage = data.message || data.error || `HTTP ${status} error occurred`;
    
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
      errors: data.errors || null,
      data
    });
  } else if (error.request) {
    console.error(' No response received:', error.request);
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: null
    });
  } else {
    console.error(' Request setup error:', error.message);
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null
    });
  }
};

const handlePaymentsResponseError = (error) => {
  console.error(' Payments API Error:', error.config?.url, error.response?.status, error.message);
  
  if (error.response) {
    const { status, data } = error.response;
    
    console.error(' Payments Error details:', {
      status,
      url: error.config?.url,
      data
    });
    
    let errorMessage = data.message || data.error || `HTTP ${status} error occurred`;
    
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
      errors: data.errors || null,
      data
    });
  } else if (error.request) {
    console.error(' No response received from payments:', error.request);
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: null
    });
  } else {
    console.error(' Payments request setup error:', error.message);
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: null
    });
  }
};

[authAPI, productsAPI, inventoryAPI, ordersAPI].forEach(api => {
  api.interceptors.response.use(
    (response) => {
      console.log('API Success:', response.config.url, response.status);
      return response;
    },
    handleGenericResponseError
  );
});

paymentsAPI.interceptors.response.use(
  (response) => {
    console.log('Payments API Success:', response.config.url, response.status);
    return response;
  },
  handlePaymentsResponseError
);

export default {
  authAPI,
  productsAPI,
  inventoryAPI,
  ordersAPI,
  paymentsAPI
};