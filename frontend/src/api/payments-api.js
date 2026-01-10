import { paymentsAPI } from './axios-config.js';


const mockPayments = {
  createPayment: async (orderId, paymentData) => {
    console.log('Mock: Creating payment for order', orderId, paymentData);
    
  
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: `pay_${Date.now()}`,
            orderId,
            amount: paymentData.amount,
            method: paymentData.method,
            status: 'COMPLETADO',
            transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          }
        });
      }, 1000);
    });
  },

  getPaymentByOrderId: async (orderId) => {
    console.log('Mock: Fetching payment for order', orderId);
    return {
      success: true,
      data: {
        id: `pay_${orderId}`,
        orderId,
        amount: 111.00,
        method: 'card',
        status: 'COMPLETADO',
        createdAt: new Date().toISOString()
      }
    };
  },

  getUserPayments: async () => {
    return {
      success: true,
      data: []
    };
  },

  getAllPayments: async () => {
    return {
      success: true,
      data: []
    };
  }
};


const isPaymentsServiceActive = async () => {
  try {
    await paymentsAPI.get('/health');
    return true;
  } catch (error) {
    console.warn('Payments service not available, using mock data');
    return false;
  }
};


export const createPayment = async (orderId, paymentData) => {
  const isActive = await isPaymentsServiceActive();
  
  if (isActive) {
    const response = await paymentsAPI.post('/payments', {
      orderId,
      ...paymentData
    });
    return response.data;
  } else {
    return mockPayments.createPayment(orderId, paymentData);
  }
};

export const getPaymentByOrderId = async (orderId) => {
  const isActive = await isPaymentsServiceActive();
  
  if (isActive) {
    const response = await paymentsAPI.get(`/payments/order/${orderId}`);
    return response.data;
  } else {
    return mockPayments.getPaymentByOrderId(orderId);
  }
};

export const getUserPayments = async () => {
  const isActive = await isPaymentsServiceActive();
  
  if (isActive) {
    const response = await paymentsAPI.get('/payments/user');
    return response.data;
  } else {
    return mockPayments.getUserPayments();
  }
};

export const getAllPayments = async () => {
  const isActive = await isPaymentsServiceActive();
  
  if (isActive) {
    const response = await paymentsAPI.get('/payments');
    return response.data;
  } else {
    return mockPayments.getAllPayments();
  }
};

export default {
  createPayment,
  getPaymentByOrderId,
  getUserPayments,
  getAllPayments
};