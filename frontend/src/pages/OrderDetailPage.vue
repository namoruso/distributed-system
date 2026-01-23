<template>
  <div class="order-detail-page">
    <div class="container">
      <div v-if="loading" class="loading-state card">
        <p>Loading order details...</p>
      </div>

      <div v-else-if="error" class="error-state card">
        <p class="error-message">{{ error }}</p>
        <router-link to="/orders" class="btn btn-primary">Back to Orders</router-link>
      </div>
      <div v-else-if="order" class="order-details">
        <div class="order-header">
          <div>
            <h1>Order #{{ order.id }}</h1>
            <p class="order-date">Placed on {{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="header-actions">
            <router-link to="/orders" class="btn btn-outline">← Back to Orders</router-link>
          </div>
        </div>
        <div class="card timeline-card">
          <h2>Order Status</h2>
          <div class="status-timeline">
            <div 
              v-for="(step, index) in statusSteps" 
              :key="step.status"
              class="timeline-step"
              :class="{ 
                'active': isStatusActive(step.status),
                'completed': isStatusCompleted(step.status),
                'cancelled': order.status === 'CANCELADO' && index > currentStepIndex
              }"
            >
              <div class="step-indicator">
                <div class="step-circle">
                  <svg v-if="isStatusCompleted(step.status)" class="icon-check" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div v-if="index < statusSteps.length - 1" class="step-line"></div>
              </div>
              <div class="step-content">
                <h3>{{ step.label }}</h3>
                <p>{{ step.description }}</p>
                <p v-if="step.date" class="step-date">{{ formatDate(step.date) }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card items-card">
          <h2>Order Items</h2>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-details">
                <h3>{{ item.productName }}</h3>
                <p class="item-sku">SKU: {{ item.productSku }}</p>
                <p class="item-quantity">Quantity: {{ item.quantity }}</p>
              </div>
              <div class="item-pricing">
                <p class="item-price">${{ formatPrice(item.unitPrice) }} each</p>
                <p class="item-subtotal">${{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <div class="order-total">
            <span>Total:</span>
            <span class="total-amount">${{ formatPrice(order.totalAmount) }}</span>
          </div>
        </div>
        <div class="card info-card">
          <h2>Order Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Order ID:</span>
              <span class="info-value">#{{ order.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <OrderStatusBadge :status="order.status" />
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ order.userEmail }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDateTime(order.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ formatDateTime(order.updatedAt) }}</span>
            </div>
            <div v-if="order.notes" class="info-item full-width">
              <span class="info-label">Notes:</span>
              <span class="info-value">{{ order.notes }}</span>
            </div>
          </div>
        </div>
        <div class="order-actions" v-if="canCancelOrder">
          <button 
            @click="showCancelDialog = true" 
            class="btn btn-danger"
            :disabled="cancelling"
          >
            {{ cancelling ? 'Cancelling...' : 'Cancel Order' }}
          </button>
        </div>
      </div>
      <ConfirmDialog
        v-model="showCancelDialog"
        title="Cancel Order"
        :message="`Are you sure you want to cancel Order #${orderId}? This action cannot be undone.`"
        type="danger"
        confirm-text="Yes, Cancel Order"
        @confirm="handleCancelOrder"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ordersAPI from '../api/orders-api';
import { useProductsStore } from '../store/products-store';
import { useToast } from '../composables/useToast';
import OrderStatusBadge from '../components/OrderStatusBadge.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const productsStore = useProductsStore();

const orderId = ref(route.params.id);
const order = ref(null);
const loading = ref(true);
const error = ref(null);
const cancelling = ref(false);
const showCancelDialog = ref(false);

const statusSteps = [
  { status: 'CREADO', label: 'Order Created', description: 'Your order has been placed successfully' },
  { status: 'PAGADO', label: 'Payment Confirmed', description: 'Your payment has been processed' },
  { status: 'SHIPPED', label: 'Shipped', description: 'Your order is on its way' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered' }
];

const statusOrder = ['CREADO', 'PAGADO', 'SHIPPED', 'DELIVERED', 'CANCELADO'];

const currentStepIndex = computed(() => {
  if (!order.value) return -1;
  return statusOrder.indexOf(order.value.status);
});

const canCancelOrder = computed(() => {
  if (!order.value) return false;
  return order.value.status === 'CREADO' || order.value.status === 'PAGADO';
});

const isStatusActive = (status) => {
  return order.value?.status === status;
};

const isStatusCompleted = (status) => {
  if (!order.value) return false;
  if (order.value.status === 'CANCELADO') return false;
  
  const currentIndex = statusOrder.indexOf(order.value.status);
  const stepIndex = statusOrder.indexOf(status);
  return currentIndex >= stepIndex;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

const fetchOrderDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await ordersAPI.getOrderById(orderId.value);
    
    if (response.data.success) {
      order.value = response.data.data;
    } else {
      error.value = response.data.message || 'Failed to load order details';
    }
  } catch (err) {
    console.error('Error fetching order:', err);
    if (err.response?.status === 404) {
      error.value = 'Order not found';
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view this order';
    } else {
      error.value = 'Failed to load order details. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

const handleCancelOrder = async () => {
  try {
    cancelling.value = true;

    await ordersAPI.cancelOrder(orderId.value);
    
    toast.success('Order cancelled successfully');

    await fetchOrderDetails();

    await productsStore.fetchProducts();
    
  } catch (err) {
    console.error('Error cancelling order:', err);
    const errorMessage = err.response?.data?.message || 'Failed to cancel order. Please try again.';
    toast.error(errorMessage);
    error.value = errorMessage;
  } finally {
    cancelling.value = false;
    showCancelDialog.value = false;
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.order-detail-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-12);
}

.error-message {
  color: var(--color-danger);
  margin-bottom: var(--space-4);
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-4);
}

.order-header h1 {
  margin-bottom: var(--space-2);
}

.order-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Timeline Styles */
.timeline-card {
  padding: var(--space-6);
}

.timeline-card h2 {
  margin-bottom: var(--space-6);
}

.status-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
  width: 100%;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  border: 3px solid var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

.timeline-step.completed .step-circle {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.timeline-step.active .step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
}

.timeline-step.cancelled .step-circle {
  background: var(--color-bg-secondary);
  border-color: var(--color-divider);
  opacity: 0.5;
}

.step-line {
  flex: 1;
  height: 3px;
  background: var(--color-divider);
  margin-left: var(--space-2);
  transition: all 0.3s ease;
}

.timeline-step.completed .step-line {
  background: var(--color-success);
}

.icon-check {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.step-content {
  text-align: center;
}

.step-content h3 {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-1);
  color: var(--color-text-muted);
}

.timeline-step.active .step-content h3,
.timeline-step.completed .step-content h3 {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.step-content p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.step-date {
  font-size: var(--font-size-xs);
  margin-top: var(--space-1);
}

/* Items Card */
.items-card {
  padding: var(--space-6);
}

.items-card h2 {
  margin-bottom: var(--space-6);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: var(--space-4);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.item-details h3 {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-2);
}

.item-sku,
.item-quantity {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-1) 0;
}

.item-pricing {
  text-align: right;
}

.item-price {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.item-subtotal {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 2px solid var(--color-divider);
  font-size: var(--font-size-lg);
}

.total-amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* Info Card */
.info-card {
  padding: var(--space-6);
}

.info-card h2 {
  margin-bottom: var(--space-6);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

/* Actions */
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
}

/* Responsive */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .status-timeline {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-step {
    flex-direction: row;
    width: 100%;
  }

  .step-indicator {
    flex-direction: column;
    width: auto;
    margin-right: var(--space-4);
  }

  .step-line {
    width: 3px;
    height: 40px;
    margin: var(--space-2) 0;
    margin-left: 0;
  }

  .step-content {
    text-align: left;
    flex: 1;
  }

  .order-item {
    flex-direction: column;
    gap: var(--space-3);
  }

  .item-pricing {
    text-align: left;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
