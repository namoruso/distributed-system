import { defineStore } from 'pinia';
import { ref } from 'vue';
import paymentsAPI from '../api/payments-api';

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref([]);
  const userPayments = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const createPayment = async (orderId, paymentData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await paymentsAPI.createPayment(orderId, paymentData);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Payment failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserPayments = async () => {
    try {
      loading.value = true;
      const response = await paymentsAPI.getUserPayments();
      userPayments.value = response.data || [];
    } catch (err) {
      console.error('Failed to fetch user payments:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchAllPayments = async () => {
    try {
      loading.value = true;
      const response = await paymentsAPI.getAllPayments();
      payments.value = response.data || [];
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    payments,
    userPayments,
    loading,
    error,
    createPayment,
    fetchUserPayments,
    fetchAllPayments
  };
});