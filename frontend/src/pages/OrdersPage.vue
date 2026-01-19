<template>
  <div class="orders-page">
    <div class="container">
      <h1>My Orders</h1>

      <div v-if="ordersStore.orders.length > 0" class="orders-list">
        <div v-for="order in ordersStore.orders" :key="order.id" class="order-card card">
          <div class="order-header">
            <div>
              <h3>Order #{{ order.id }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>

            <div class="order-status">
              <OrderStatusBadge :status="order.status" />
              <span v-if="order.status === 'PAGADO'" class="payment-info">
                (Paid on {{ formatDate(order.updatedAt) }})
              </span>
            </div>
            
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">${{ (parseFloat(item.unitPrice) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>Total:</span>
              <span class="total-amount">${{ order.totalAmount.toFixed(2) }}</span>
            </div>
            
            <div class="order-actions">
              <router-link
                :to="`/orders/${order.id}`"
                class="btn btn-sm btn-outline"
              >
                View Details
              </router-link>
              <button
                v-if="order.status === 'CREADO'"
                @click="goToPayment(order.id)"
                class="btn btn-sm btn-primary"
                :disabled="ordersStore.loading"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <p>You haven't placed any orders yet</p>
        <router-link to="/catalog" class="btn btn-primary">Start Shopping</router-link>
      </div>

      <ConfirmDialog
        v-model="showReturnConfirm"
        title="Return Order"
        :message="`Are you sure you want to return Order #${orderToReturn}? This action will process a refund.`"
        type="warning"
        confirm-text="Return Order"
        @confirm="handleReturnConfirm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrdersStore } from '../store/orders-store';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import OrderStatusBadge from '../components/OrderStatusBadge.vue';


const router = useRouter();
const ordersStore = useOrdersStore();
const showReturnConfirm = ref(false);
const orderToReturn = ref(null);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'badge-success';
    case 'returned':
      return 'badge-info';
    default:
      return 'badge-warning';
  }
};
const goToPayment = (orderId) => {
  router.push(`/payment/${orderId}`);
};

const handleReturn = (orderId) => {
  orderToReturn.value = orderId;
  showReturnConfirm.value = true;
};

const handleReturnConfirm = async () => {
  if (orderToReturn.value) {
    try {
      await ordersStore.updateOrderStatus(orderToReturn.value, 'RETURNED');
      orderToReturn.value = null;
      
      await ordersStore.fetchOrders();
    } catch (error) {
      console.error('Failed to return order:', error);
    }
  }
};

onMounted(async () => {
  try {
    await ordersStore.fetchOrders();
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
});
</script>

<style scoped>
.orders-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.orders-page h1 {
  margin-bottom: var(--space-8);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.order-card {
  padding: var(--space-6);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
}

.order-header h3 {
  margin-bottom: var(--space-2);
}

.order-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.order-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.item-name {
  color: var(--color-text-primary);
}

.item-quantity {
  color: var(--color-text-muted);
}

.item-price {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-divider);
}

.order-total {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.total-amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .order-footer {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .order-item {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
</style>
