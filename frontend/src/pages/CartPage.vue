<template>
  <div class="cart-page">
    <div class="container">
      <h1>Shopping Cart</h1>

      <div v-if="!cartStore.isCartEmpty" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.cartItems" :key="item.id" class="cart-item card">
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-price">${{ parseFloat(item.price).toFixed(2) }}</p>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button @click="cartStore.decreaseQuantity(item.id)" class="btn btn-sm btn-ghost">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="cartStore.increaseQuantity(item.id)" class="btn btn-sm btn-ghost">+</button>
              </div>
              
              <button @click="cartStore.removeFromCart(item.id)" class="btn btn-sm btn-ghost text-error">Remove</button>
            </div>
            
            <div class="item-total">
              ${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="cart-summary card">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ cartStore.formattedCartTotal }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ cartStore.formattedCartTotal }}</span>
          </div>
          <button @click="handleCheckout" class="btn btn-primary btn-lg" style="width: 100%;" :disabled="cartStore.loading">
            <LoadingSpinner v-if="cartStore.loading" message="" />
            <span v-else>Checkout</span>
          </button>
        </div>
      </div>

      <div v-else class="empty-cart card">
        <p>Your cart is empty</p>
        <router-link to="/catalog" class="btn btn-primary">Continue Shopping</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '../store/cart-store';
import { useToast } from '../composables/useToast';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();

const handleCheckout = async () => {
  try {
    const order = await cartStore.checkout();
    console.log('Order created:', order); 
    console.log('Order ID:', order.id); 
    toast.success('Order created successfully! Please complete payment.');
    router.push(`/payment/${order.id}`);
    
  } catch (error) {
    console.error('Checkout failed:', error);
    toast.error(error.message || 'Checkout failed. Please try again.');
  }
};
</script>

<style scoped>
.cart-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.cart-page h1 {
  margin-bottom: var(--space-8);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-8);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-6);
}

.item-info h3 {
  margin-bottom: var(--space-2);
}

.item-price {
  color: var(--color-text-muted);
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quantity {
  min-width: 40px;
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.item-total {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.cart-summary {
  padding: var(--space-6);
  height: fit-content;
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-4));
}

.cart-summary h2 {
  margin-bottom: var(--space-6);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) 0;
  color: var(--color-text-secondary);
}

.summary-row.total {
  border-top: 2px solid var(--color-border);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.empty-cart {
  text-align: center;
  padding: var(--space-12);
}

.empty-cart p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .item-actions {
    justify-content: space-between;
  }
}
</style>
