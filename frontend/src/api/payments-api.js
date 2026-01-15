import { paymentsAPI } from './axios-config.js';

export const createPayment = async (paymentData) => {
  try {
    console.log('Sending payment request to:', '/pagos/procesar');
    const maskedData = {
      ...paymentData,
      numTarjeta: '***' + (paymentData.numTarjeta || '').slice(-4),
      cvv: '***'
    };
    console.log('Payment data being sent (masked for security):', maskedData);
    
    const response = await paymentsAPI.post('/pagos/procesar', paymentData);
    
    console.log('Payment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Payment API error details:');
    
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
      console.error('  Headers:', error.response.headers);
      console.error('  Backend message:', error.response.data?.err || error.response.data?.message);
    } else if (error.request) {
      console.error('  No response received:', error.request);
    } else {
      console.error('  Error setting up request:', error.message);
    }
    
    console.error('  Config URL:', error.config?.url);
    console.error('  Config method:', error.config?.method);
    console.error('  Config data:', error.config?.data);
    
    const enhancedError = new Error(
      error.response?.data?.err || 
      error.response?.data?.message || 
      error.message || 
      'Payment failed'
    );
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    throw enhancedError;
  }
};

export const getUserPayments = async (page = 1, limit = 10) => {
  const response = await paymentsAPI.get('/pagos/mis-pagos', {
    params: { page, limit }
  });
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await paymentsAPI.get(`/pagos/${paymentId}`);
  return response.data;
};

export const getOrderPayments = async (orderId, page = 1, limit = 10) => {
  const response = await paymentsAPI.get(`/pagos/pedido/${orderId}`, {
    params: { page, limit }
  });
  return response.data;
};

export const getPaymentStats = async () => {
  const response = await paymentsAPI.get('/pagos/estadisticas');
  return response.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const response = await paymentsAPI.put(`/pagos/${paymentId}`, { estado: status });
  return response.data;
};

export const getCurrentToken = () => {
  return localStorage.getItem('jwt_token');
};

export default {
  createPayment,
  getUserPayments,
  getPaymentById,
  getOrderPayments,
  getPaymentStats,
  updatePaymentStatus,
  getCurrentToken
};