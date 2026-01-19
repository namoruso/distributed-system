import { defineStore } from 'pinia';
import { ref } from 'vue';
import paymentsAPI from '../api/payments-api';

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref([]);
  const userPayments = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const processPayment = async (paymentData) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await paymentsAPI.createPayment(paymentData);
      
      return response;
    } catch (err) {
      error.value = err.message || 'Payment failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserPayments = async (page = 1, limit = 10) => {
    try {
      loading.value = true;
      const response = await paymentsAPI.getUserPayments(page, limit);
      userPayments.value = response.pagos || [];
      return response.paginacion;
    } catch (err) {
      console.error('Failed to fetch user payments:', err);
      error.value = err.message || 'Failed to fetch payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllPayments = async (page = 1, limit = 100) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await paymentsAPI.getUserPayments(page, limit);
      payments.value = response.pagos || [];
      return response;
    } catch (err) {
      console.error('Failed to fetch all payments:', err);
      error.value = err.message || 'Failed to fetch payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    payments,
    userPayments,
    loading,
    error,
    processPayment,
    fetchUserPayments,
    fetchAllPayments
  };
});