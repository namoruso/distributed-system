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
              <p><strong>Status:</strong> <OrderStatusBadge :status="order.status" /></p>
            </div>
            
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <span>{{ item.productName || item.name }} x{{ item.quantity }}</span>
                <span>${{ calculateItemTotal(item) }}</span>
              </div>
            </div>
            
            <div class="order-total">
              <span>Total:</span>
              <span class="total-amount">${{ calculateOrderTotal() }}</span>
            </div>
          </div>
          
          <div v-if="order.status === 'PAGADO' || order.status === 'PAID'" class="already-paid">
            <p class="info-message">This order is already paid.</p>
            <router-link to="/orders" class="btn btn-primary">
              View My Orders
            </router-link>
          </div>
          
          <button v-else @click="step = 2" class="btn btn-primary btn-lg">
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
          
          <div v-if="selectedMethod === 'card'" class="test-cards-info">
            <p><strong>Test Cards:</strong></p>
            <ul>
              <li><code>4111111111111111</code> - Visa (always successful)</li>
              <li><code>5555555555554444</code> - Mastercard (always fails)</li>
              <li><code>4000000000000002</code> - Visa (always fails)</li>
            </ul>
            <p>CVV: Any 3 digits | Expiry: Any future date (e.g., 12/27)</p>
          </div>
          
          <form @submit.prevent="processPayment" class="payment-form">
            <div v-if="selectedMethod === 'card'">
              <div class="form-group">
                <label>Card Number <span class="required">*</span></label>
                <input 
                  v-model="cardDetails.number" 
                  placeholder="1234 5678 9012 3456"
                  class="form-input"
                  required
                  :class="{ 'error': fieldErrors.numTarjeta }"
                  @input="clearFieldError('numTarjeta')"
                />
                <div v-if="fieldErrors.numTarjeta" class="field-error">{{ fieldErrors.numTarjeta }}</div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Expiry Date (MM/YY) <span class="required">*</span></label>
                  <input 
                    v-model="cardDetails.expiry" 
                    placeholder="12/25"
                    class="form-input"
                    required
                    :class="{ 'error': fieldErrors.vencimiento }"
                    @input="clearFieldError('vencimiento')"
                  />
                  <div v-if="fieldErrors.vencimiento" class="field-error">{{ fieldErrors.vencimiento }}</div>
                </div>
                
                <div class="form-group">
                  <label>CVV <span class="required">*</span></label>
                  <input 
                    v-model="cardDetails.cvv" 
                    placeholder="123"
                    type="password"
                    class="form-input"
                    required
                    :class="{ 'error': fieldErrors.cvv }"
                    @input="clearFieldError('cvv')"
                  />
                  <div v-if="fieldErrors.cvv" class="field-error">{{ fieldErrors.cvv }}</div>
                </div>
              </div>
              
              <div class="form-group">
                <label>Cardholder Name <span class="required">*</span></label>
                <input 
                  v-model="cardDetails.name" 
                  placeholder="John Doe"
                  class="form-input"
                  required
                  :class="{ 'error': fieldErrors.nombreTitular }"
                  @input="clearFieldError('nombreTitular')"
                />
                <div v-if="fieldErrors.nombreTitular" class="field-error">{{ fieldErrors.nombreTitular }}</div>
              </div>
              
              <div class="form-group">
                <label>Email (for receipt) <span class="required">*</span></label>
                <input 
                  v-model="cardDetails.email" 
                  :placeholder="authStore.user?.email || 'your@email.com'"
                  class="form-input"
                  type="email"
                  required
                  :class="{ 'error': fieldErrors.email }"
                  @input="clearFieldError('email')"
                />
                <div v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</div>
              </div>
            </div>
            
            <div class="payment-actions">
              <button type="button" @click="step = 2" class="btn btn-ghost">Back</button>
              <button type="submit" class="btn btn-primary" :disabled="paymentsStore.loading || processingPayment || !formValid">
                <LoadingSpinner v-if="paymentsStore.loading || processingPayment" message="" />
                <span v-else>Pay ${{ calculateOrderTotal() }}</span>
              </button>
            </div>
          </form>
        </div>

        <div class="confirmation card" v-if="step === 4">
          <div class="confirmation-content">
            <div v-if="paymentSuccess" class="success-icon">✓</div>
            <div v-else class="error-icon">✗</div>
            
            <h2>{{ paymentSuccess ? 'Payment Successful!' : 'Payment Failed' }}</h2>
            <p>{{ paymentSuccess ? 'Your payment has been processed successfully.' : 'There was an issue processing your payment.' }}</p>
            
            <div class="confirmation-details">
              <p><strong>Order ID:</strong> {{ order.id }}</p>
              <p><strong>Amount:</strong> ${{ calculateOrderTotal() }}</p>
              <p><strong>Payment Method:</strong> {{ getMethodName(selectedMethod) }}</p>
              <p><strong>Date:</strong> {{ formatDate(new Date()) }}</p>
              <p v-if="paymentResult?.referencia"><strong>Reference:</strong> {{ paymentResult.referencia }}</p>
              <p v-if="paymentResult?.id"><strong>Payment ID:</strong> {{ paymentResult.id }}</p>
            </div>
            
            <div class="confirmation-actions">
              <router-link v-if="paymentSuccess" to="/orders" class="btn btn-primary">
                View My Orders
              </router-link>
              <button v-else @click="step = 3" class="btn btn-primary">
                Try Again
              </button>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentsStore } from '../store/payments-store';
import { useCartStore } from '../store/cart-store';
import { useOrdersStore } from '../store/orders-store';
import { useAuthStore } from '../store/auth-store';
import { useProductsStore } from '../store/products-store';
import { useToast } from '../composables/useToast';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import OrderStatusBadge from '../components/OrderStatusBadge.vue';

const route = useRoute();
const router = useRouter();
const paymentsStore = usePaymentsStore();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const productsStore = useProductsStore();
const toast = useToast();

const step = ref(1);
const order = ref(null);
const selectedMethod = ref('card');
const processingPayment = ref(false);
const paymentResult = ref(null);
const paymentSuccess = ref(true);
const fieldErrors = ref({});

const paymentMethods = [
  { 
    id: 'card', 
    name: 'Credit/Debit Card', 
    icon: '', 
    description: 'Pay securely with your Visa, Mastercard or other card'
  }
];

const cardDetails = ref({
  number: '4111111111111111',
  expiry: '12/27',
  cvv: '123',
  name: '',
  email: ''
});

const formValid = computed(() => {
  return (
    cardDetails.value.number.trim().length >= 13 &&
    cardDetails.value.expiry.trim().length === 5 &&
    cardDetails.value.cvv.trim().length >= 3 &&
    cardDetails.value.name.trim().length > 0 &&
    cardDetails.value.email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardDetails.value.email)
  );
});

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return Number(value) || 0;
};

const calculateItemTotal = (item) => {
  const price = toNumber(item.price || item.unitPrice);
  const quantity = toNumber(item.quantity);
  return (price * quantity).toFixed(2);
};

const calculateOrderTotal = () => {
  if (order.value) {
    const total = toNumber(order.value.totalAmount || order.value.total);
    if (total > 0) return total.toFixed(2);
    
    if (order.value.items && Array.isArray(order.value.items)) {
      const calculatedTotal = order.value.items.reduce((sum, item) => {
        return sum + (toNumber(item.price || item.unitPrice) * toNumber(item.quantity));
      }, 0);
      return calculatedTotal.toFixed(2);
    }
  }
  return '0.00';
};

const getOrderAmount = () => {
  return parseFloat(calculateOrderTotal());
};

const validateForm = () => {
  const errors = {};
  
  if (!cardDetails.value.number || cardDetails.value.number.trim().length < 13) {
    errors.numTarjeta = 'Valid card number is required';
  }
  
  if (!cardDetails.value.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)) {
    errors.vencimiento = 'Use MM/YY format (e.g., 12/25)';
  }
  
  if (!cardDetails.value.cvv || !/^\d{3,4}$/.test(cardDetails.value.cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits';
  }
  
  if (!cardDetails.value.name || cardDetails.value.name.trim().length === 0) {
    errors.nombreTitular = 'Cardholder name is required';
  }
  
  if (!cardDetails.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardDetails.value.email)) {
    errors.email = 'Valid email is required';
  }
  
  fieldErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const clearFieldError = (fieldName) => {
  if (fieldErrors.value[fieldName]) {
    delete fieldErrors.value[fieldName];
    fieldErrors.value = { ...fieldErrors.value };
  }
};

onMounted(async () => {
  const orderId = route.params.orderId;
  console.log('Order ID from route:', orderId);
  
  if (!orderId) {
    toast.error('No order specified');
    router.push('/orders');
    return;
  }

  try {
    console.log('Fetching order from backend...');
    
    await ordersStore.fetchOrderById(orderId);
    
    if (ordersStore.currentOrder) {
      order.value = ordersStore.currentOrder;
      console.log('Order loaded from backend:', order.value);
    } else {
      console.log('Order not found in backend, checking cart store...');
      const localOrder = cartStore.orders.find(o => o.id == orderId);
      
      if (localOrder) {
        console.log('Found order in cartStore:', localOrder);
        order.value = {
          id: localOrder.id,
          total: toNumber(localOrder.total),
          items: localOrder.items || [],
          status: localOrder.status || 'CREADO',
          createdAt: localOrder.date || new Date().toISOString()
        };
      } else {
        throw new Error('Order not found');
      }
    }
    
    if (order.value.status === 'PAGADO' || order.value.status === 'PAID') {
      toast.info('This order is already paid');
    }
    
    if (authStore.user?.email) {
      cardDetails.value.email = authStore.user.email;
    }
    
    if (authStore.user?.name) {
      cardDetails.value.name = authStore.user.name;
    }
    
    if (!cardDetails.value.name.trim()) {
      cardDetails.value.name = 'Test User';
    }
    
  } catch (error) {
    console.error('Failed to load order:', error);
    
    toast.warning('Using demo order for testing');
    order.value = {
      id: orderId,
      total: 111.00,
      items: [
        { 
          id: 1, 
          name: 'Product Demo', 
          price: 111.00,
          quantity: 1 
        }
      ],
      status: 'CREADO',
      createdAt: new Date().toISOString()
    };
    
    cardDetails.value.name = authStore.user?.name || 'Test User';
    cardDetails.value.email = authStore.user?.email || 'test@example.com';
  }
});

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const getMethodName = (methodId) => {
  const method = paymentMethods.find(m => m.id === methodId);
  return method ? method.name : 'Unknown';
};

const processPayment = async () => {
  try {
    processingPayment.value = true;
    fieldErrors.value = {};
    
    const token = localStorage.getItem('jwt_token');
    
    if (!validateForm()) {
      processingPayment.value = false;
      toast.error('Please fix the errors in the form');
      return;
    }
    
    const paymentData = {
      idPedido: Number(order.value.id), 
      monto: getOrderAmount(),           
      numTarjeta: cardDetails.value.number.replace(/\s/g, ''), 
      cvv: cardDetails.value.cvv.trim(),
      vencimiento: cardDetails.value.expiry,
      nombreTitular: cardDetails.value.name.trim(), 
      email: cardDetails.value.email.trim() || authStore.user?.email
    };
    
    console.log('FULL PAYMENT DATA (unmasked):', paymentData);
    console.log('Payment data field check:', {
      idPedido_type: typeof paymentData.idPedido,
      idPedido_value: paymentData.idPedido,
      monto_type: typeof paymentData.monto,
      monto_value: paymentData.monto,
      numTarjeta_length: paymentData.numTarjeta.length,
      numTarjeta_endsWith: paymentData.numTarjeta.slice(-4),
      vencimiento: paymentData.vencimiento,
      nombreTitular: paymentData.nombreTitular,
      email: paymentData.email
    });
    
    console.log('Sending payment request...');
    paymentResult.value = await paymentsStore.processPayment(paymentData);
    console.log('Payment response:', paymentResult.value);
    
    paymentSuccess.value = paymentResult.value?.exito === true || 
                          paymentResult.value?.estado === 'Pago realizado' ||
                          paymentResult.value?.success === true;
    
    if (paymentSuccess.value) {
      setTimeout(async () => {
        try {
          await ordersStore.fetchOrderById(order.value.id);
          console.log('Order refreshed after payment');
          await productsStore.fetchProducts();
          console.log('Products stock refreshed');
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      }, 1000);
      
      cartStore.clearCart();
      
      toast.success('Payment processed successfully!');
    } else {
      const errorMsg = paymentResult.value?.error || 
                      paymentResult.value?.msg || 
                      'Payment failed. Please try again.';
      toast.error(errorMsg);
    }
    
    step.value = 4;
    
  } catch (error) {
    console.error('Payment failed with details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    paymentSuccess.value = false;
    
    if (error.response?.status === 400 && error.response?.data?.err) {
      const backendError = error.response.data.err.toLowerCase();
      
      if (backendError.includes('monto')) {
        fieldErrors.value.monto = 'Invalid amount';
      } else if (backendError.includes('tarjeta')) {
        fieldErrors.value.numTarjeta = 'Invalid card number';
      } else if (backendError.includes('cvv')) {
        fieldErrors.value.cvv = 'Invalid CVV';
      } else if (backendError.includes('vencimiento') || backendError.includes('fecha')) {
        fieldErrors.value.vencimiento = 'Invalid expiry date';
      } else if (backendError.includes('nombre') || backendError.includes('titular')) {
        fieldErrors.value.nombreTitular = 'Invalid cardholder name';
      } else if (backendError.includes('email')) {
        fieldErrors.value.email = 'Invalid email';
      }
      
      toast.error(`Validation error: ${error.response.data.err}`);
    } else if (error.response?.status === 401) {
      toast.error('Authentication failed. Please log in again.');
      
    } else if (error.response?.status === 402) {
      toast.error('Payment rejected. Please check your card details or try another card.');
    } else {
      toast.error(error.message || 'Payment processing error');
    }
    
    step.value = 4;
  } finally {
    processingPayment.value = false;
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

.order-info p {
  margin-bottom: var(--space-2);
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

.already-paid {
  text-align: center;
  margin-top: var(--space-6);
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

.test-cards-info {
  background: var(--color-info-light);
  border: 1px solid var(--color-info);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  font-size: var(--font-size-sm);
}

.test-cards-info ul {
  margin: var(--space-2) 0;
  padding-left: var(--space-6);
}

.test-cards-info code {
  background: var(--color-bg-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: monospace;
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
  text-align: center;
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

.error-icon {
  width: 80px;
  height: 80px;
  background: var(--color-error);
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

.required {
  color: var(--color-error);
}

.field-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

.form-input.error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
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