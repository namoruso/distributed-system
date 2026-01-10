<template>
  <div class="admin-payments-page">
    <div class="container">
      <h1>Payments Management</h1>
      
      <div class="payments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ payment.id.slice(0, 8) }}</td>
              <td>{{ payment.orderId }}</td>
              <td>{{ payment.userEmail }}</td>
              <td>${{ payment.amount.toFixed(2) }}</td>
              <td>{{ payment.method }}</td>
              <td>
                <span class="badge" :class="getStatusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td>{{ formatDate(payment.createdAt) }}</td>
              <td>
                <button @click="viewDetails(payment)" class="btn btn-sm btn-ghost">
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePaymentsStore } from '../../store/payments-store';
import { useToast } from '../../composables/useToast';

const paymentsStore = usePaymentsStore();
const toast = useToast();
const payments = ref([]);

onMounted(async () => {
  try {
    await paymentsStore.fetchAllPayments();
    payments.value = paymentsStore.payments;
  } catch (error) {
    console.error('Failed to load payments:', error);
    toast.error('Failed to load payments');
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusClass = (status) => {
  const classes = {
    'COMPLETADO': 'badge-success',
    'PENDIENTE': 'badge-warning',
    'FALLIDO': 'badge-error',
    'REEMBOLSADO': 'badge-info'
  };
  return classes[status] || 'badge-info';
};

const viewDetails = (payment) => {
  alert(`Payment Details:\nID: ${payment.id}\nOrder: ${payment.orderId}\nStatus: ${payment.status}`);
};
</script>