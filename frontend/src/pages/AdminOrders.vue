<template>
  <div class="admin-orders-page">
    <div class="container">
      <div class="page-header">
        <h1>Manage Orders</h1>
        <p class="subtitle">View and update order statuses</p>
      </div>

      <div class="filters card">
        <div class="filter-group">
          <label>Status Filter:</label>
          <select v-model="selectedStatus" @change="fetchOrders" class="status-filter">
            <option value="">All Orders</option>
            <option value="CREADO">Created</option>
            <option value="PAGADO">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELADO">Cancelled</option>
          </select>
        </div>
        <div class="stats">
          <span>Total: {{ pagination.totalElements }} orders</span>
        </div>
      </div>

      <div v-if="!loading && orders.length > 0" class="orders-table-container card">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="order-id">#{{ order.id }}</td>
              <td class="user-email">{{ order.userEmail }}</td>
              <td class="items-count">{{ order.items.length }} item(s)</td>
              <td class="total-amount">${{ order.totalAmount.toFixed(2) }}</td>
              <td>
                <OrderStatusBadge :status="order.status" />
              </td>
              <td class="order-date">{{ formatDate(order.createdAt) }}</td>
              <td class="actions">
                <select 
                  v-model="order.newStatus" 
                  @change="updateStatus(order)" 
                  class="status-select"
                  :disabled="order.status === 'DELIVERED' || order.status === 'CANCELADO'"
                >
                  <option :value="order.status">{{ getStatusText(order.status) }}</option>
                  <option v-for="status in getAvailableStatuses(order.status)" 
                          :key="status" 
                          :value="status">
                    {{ getStatusText(status) }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="loading-state card">
        <p>Loading orders...</p>
      </div>

      <div v-if="!loading && orders.length === 0" class="empty-state card">
        <p>No orders found</p>
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(pagination.page - 1)" 
          :disabled="pagination.page === 0"
          class="btn btn-sm btn-outline"
        >
          ← Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page + 1 }} of {{ pagination.totalPages }}
        </span>
        <button 
          @click="changePage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.totalPages - 1"
          class="btn btn-sm btn-outline"
        >
          Next →
        </button>
      </div>
    </div>
    
    <!-- Confirm Modal -->
    <ConfirmModal
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      :variant="confirmState.variant"
      :loading="confirmState.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
    
    <!-- Alert Modal -->
    <AlertModal
      :show="alertState.show"
      :message="alertState.message"
      :type="alertState.type"
      :title="alertState.title"
      @close="closeAlert"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import ordersAPI from '../api/orders-api';
import OrderStatusBadge from '../components/OrderStatusBadge.vue';
import { useModal } from '../composables/useModal';
import ConfirmModal from '../components/modals/ConfirmModal.vue';
import AlertModal from '../components/modals/AlertModal.vue';

const orders = ref([]);
const loading = ref(false);
const selectedStatus = ref('');
const pagination = reactive({
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0
});

const { alertState, showAlert, closeAlert, confirmState, showConfirm, handleConfirm, handleCancel } = useModal();

const statusTransitions = {
  'CREADO': ['PAGADO', 'CANCELADO'],
  'PAGADO': ['SHIPPED', 'CANCELADO'],
  'SHIPPED': ['DELIVERED'],
  'DELIVERED': [],
  'CANCELADO': []
};

const statusLabels = {
  'CREADO': 'Created',
  'PAGADO': 'Paid',
  'SHIPPED': 'Shipped',
  'DELIVERED': 'Delivered',
  'CANCELADO': 'Cancelled'
};

const getStatusText = (status) => {
  return statusLabels[status] || status;
};

const getAvailableStatuses = (currentStatus) => {
  return statusTransitions[currentStatus] || [];
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      status: selectedStatus.value || undefined,
      sortBy: 'createdAt',
      sortDir: 'DESC'
    };

    const response = await ordersAPI.getAllOrders(params);
    
    if (response.data.success) {
      const pageData = response.data.data;
      orders.value = pageData.content.map(order => ({
        ...order,
        newStatus: order.status
      }));
      pagination.page = pageData.number;
      pagination.size = pageData.size;
      pagination.totalElements = pageData.totalElements;
      pagination.totalPages = pageData.totalPages;
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    await showAlert('Failed to load orders. Please try again.', {
      type: 'error',
      title: 'Error Loading Orders'
    });
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (order) => {
  if (order.newStatus === order.status) {
    return;
  }

  const confirmed = await showConfirm(
    `Update order #${order.id} from ${getStatusText(order.status)} to ${getStatusText(order.newStatus)}?`,
    {
      title: 'Confirm Status Update',
      confirmText: 'Update',
      cancelText: 'Cancel',
      variant: 'info'
    }
  );

  if (!confirmed) {
    order.newStatus = order.status;
    return;
  }

  try {
    const response = await ordersAPI.updateOrderStatus(order.id, order.newStatus);
    
    if (response.data.success) {
      order.status = order.newStatus;
      await showAlert(`Order #${order.id} updated successfully`, {
        type: 'success',
        title: 'Status Updated'
      });
      await fetchOrders();
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    await showAlert(
      `Failed to update order: ${error.response?.data?.message || error.message}`,
      {
        type: 'error',
        title: 'Update Failed'
      }
    );
    order.newStatus = order.status;
  }
};

const changePage = (newPage) => {
  pagination.page = newPage;
  fetchOrders();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.admin-orders-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

.subtitle {
  color: var(--color-text-muted);
  margin: 0;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.filter-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.status-filter {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.stats {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.orders-table-container {
  overflow-x: auto;
  padding: 0;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead {
  background: var(--color-bg-tertiary);
}

.orders-table th {
  padding: var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-divider);
}

.orders-table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text-primary);
}

.order-id {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.items-count {
  font-size: var(--font-size-sm);
}

.total-amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.order-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.status-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  min-width: 120px;
}

.status-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-muted);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.page-info {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .orders-table {
    font-size: var(--font-size-sm);
  }

  .orders-table th,
  .orders-table td {
    padding: var(--space-2);
  }
}
</style>
