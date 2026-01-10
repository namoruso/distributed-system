<template>
  <div class="payment-page">
    <div class="container">
      <div v-if="order" class="payment-content">
        
        <div class="order-summary card" v-if="step === 1">
          <h2>Review Your Order</h2>
          
          <div class="order-details">
            <div class="order-info">
              <h3>Order #{{ order.id }}</h3>
              <p>Date: {{ formatDate(order.createdAt) }}</p>
            </div>
            
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="order-total">
              <span>Total:</span>
              <span class="total-amount">${{ (order.totalAmount || order.total || 0).toFixed(2) }}</span>
            </div>
          </div>
          
          <button @click="step = 2" class="btn btn-primary btn-lg">
            Proceed to Payment
          </button>
        </div>

        
        <div class="payment-methods card" v-if="step === 2">
          <h2>Select Payment Method</h2>
          
          <div class="methods-grid">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="method-card"
              :class="{ selected: selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <div class="method-icon">{{ method.icon }}</div>
              <div class="method-info">
                <h3>{{ method.name }}</h3>
                <p>{{ method.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="payment-actions">
            <button @click="step = 1" class="btn btn-ghost">Back</button>
            <button @click="step = 3" class="btn btn-primary" :disabled="!selectedMethod">
              Continue
            </button>
          </div>
        </div>

        
        <div class="payment-details card" v-if="step === 3">
          <h2>Payment Details</h2>
          
          <form @submit.prevent="processPayment" class="payment-form">
            <div v-if="selectedMethod === 'card'">
              <div class="form-group">
                <label>Card Number</label>
                <input 
                  v-model="cardDetails.number" 
                  placeholder="1234 5678 9012 3456"
                  class="form-input"
                  required
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input 
                    v-model="cardDetails.expiry" 
                    placeholder="MM/YY"
                    class="form-input"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label>CVV</label>
                  <input 
                    v-model="cardDetails.cvv" 
                    placeholder="123"
                    type="password"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Cardholder Name</label>
                <input 
                  v-model="cardDetails.name" 
                  placeholder="John Doe"
                  class="form-input"
                  required
                />
              </div>
            </div>
            
            <div class="payment-actions">
              <button type="button" @click="step = 2" class="btn btn-ghost">Back</button>
              <button type="submit" class="btn btn-primary" :disabled="paymentsStore.loading">
                <LoadingSpinner v-if="paymentsStore.loading" message="" />
                <span v-else>Pay ${{ (order.totalAmount || order.total || 0).toFixed(2) }}</span>
              </button>
            </div>
          </form>
        </div>

        
        <div class="confirmation card" v-if="step === 4">
          <div class="confirmation-content">
            <div class="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            
            <div class="confirmation-details">
              <p><strong>Order ID:</strong> {{ order.id }}</p>
              <p><strong>Amount Paid:</strong> ${{ (order.totalAmount || order.total || 0).toFixed(2) }}</p>
              <p><strong>Payment Method:</strong> {{ getMethodName(selectedMethod) }}</p>
              <p><strong>Date:</strong> {{ formatDate(new Date()) }}</p>
            </div>
            
            <div class="confirmation-actions">
              <router-link to="/orders" class="btn btn-primary">
                View My Orders
              </router-link>
              <router-link to="/catalog" class="btn btn-ghost">
                Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <LoadingSpinner message="Loading order details..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentsStore } from '../store/payments-store';
import { useCartStore } from '../store/cart-store';
import { useOrdersStore } from '../store/orders-store';
import { useToast } from '../composables/useToast';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const paymentsStore = usePaymentsStore();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const toast = useToast();

const step = ref(1);
const order = ref(null);
const selectedMethod = ref('card');

const paymentMethods = [
  { 
    id: 'card', 
    name: 'Credit/Debit Card', 
    icon: '', 
    description: 'Pay securely with your Visa, Mastercard or other card'
  }
];
const cardDetails = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
});

onMounted(async () => {
  const orderId = route.params.orderId;
  console.log('Order ID from route:', orderId);
  
  if (!orderId) {
    toast.error('No order specified');
    router.push('/orders');
    return;
  }

  try {
    
    const cartStore = useCartStore();
    const localOrder = cartStore.getOrderById(orderId);
    
    if (localOrder) {
      console.log('Found order in cartStore:', localOrder);
      order.value = {
        id: localOrder.id,
        total: localOrder.total,
        items: localOrder.items,
        status: localOrder.status || 'created',
        createdAt: localOrder.date || new Date().toISOString()
      };
    } 
   
    else {
      console.log('Order not found locally, fetching from backend...');
      const response = await ordersStore.fetchOrderById(orderId);
      order.value = response;
    }
    
    console.log('Order loaded for payment:', order.value);
    
    
    if (order.value.status === 'PAID' || order.value.status === 'PAID') {
      toast.info('This order is already paid');
      router.push('/orders');
    }
  } catch (error) {
    console.error('Failed to load order:', error);
    
   
    toast.warning('Using mock order for testing');
    order.value = {
      id: orderId,
      total: 111.00,
      items: [
        { id: 1, name: 'Audifones', price: 111.00, quantity: 1 }
      ],
      status: 'created',
      createdAt: new Date().toISOString()
    };
  }
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getMethodName = (methodId) => {
  const method = paymentMethods.find(m => m.id === methodId);
  return method ? method.name : 'Unknown';
};

const processPayment = async () => {
   try {
    const paymentData = {
      method: selectedMethod.value,
      amount: order.value.totalAmount || order.value.total, 
      details: selectedMethod.value === 'card' ? cardDetails.value : {}
    };
   
    const payment = await paymentsStore.createPayment(order.value.id, paymentData);
    
    await ordersStore.updateOrderStatus(order.value.id, 'PAID');
    
   
    cartStore.clearCart();
   
    step.value = 4;
    
    toast.success('Payment processed successfully!');
  } catch (error) {
    console.error('Payment failed:', error);
    toast.error(error.message || 'Payment failed. Please try again.');
  }
};
</script>

<style scoped>
.payment-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.payment-content {
  max-width: 600px;
  margin: 0 auto;
}

.order-summary,
.payment-methods,
.payment-details,
.confirmation {
  padding: var(--space-8);
}

.order-details {
  margin-bottom: var(--space-8);
}

.order-info {
  margin-bottom: var(--space-6);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 2px solid var(--color-border);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.total-amount {
  color: var(--color-primary);
}

.methods-grid {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-6) 0;
}

.method-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.method-card:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.method-card.selected {
  border-color: var(--color-primary);
  background: rgba(139, 92, 246, 0.1);
}

.method-icon {
  font-size: var(--font-size-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-info h3 {
  margin-bottom: var(--space-1);
}

.method-info p {
  color: var(--color-text-muted);
  margin: 0;
  font-size: var(--font-size-sm);
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-6);
}

.payment-form {
  margin: var(--space-6) 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.info-message {
  padding: var(--space-4);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
}

.confirmation-content {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  margin: 0 auto var(--space-6);
}

.confirmation-details {
  background: var(--color-bg-tertiary);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  margin: var(--space-6) 0;
  text-align: left;
}

.confirmation-details p {
  margin-bottom: var(--space-2);
  display: flex;
  justify-content: space-between;
}

.confirmation-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .payment-content {
    padding: 0 var(--space-4);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
}
</style>