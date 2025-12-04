import { defineStore } from 'pinia';
import { useInventoryStore } from './inventory-store';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    orders: [], 
    loading: false,
    error: null
  }),

  getters: {
    cartItems: (state) => state.items,
    
    cartItemsCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    cartTotal: (state) => {
      return state.items.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
      }, 0);
    },

    formattedCartTotal: (state) => {
      const total = state.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);
      return `$${total.toFixed(2)}`;
    },

    isCartEmpty: (state) => state.items.length === 0,

    orderHistory: (state) => state.orders,

    getOrderById: (state) => (orderId) => {
      return state.orders.find(order => order.id === orderId);
    }
  },

  actions: {
    initCart() {
      const savedCart = localStorage.getItem('cart');
      const savedOrders = localStorage.getItem('orders');
      
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      }
      
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      }
    },

    addToCart(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          sku: product.sku,
          quantity: quantity,
          image: product.image || null
        });
      }
      
      this.saveCart();
    },

    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.saveCart();
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
          this.saveCart();
        }
      }
    },

    increaseQuantity(productId) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        item.quantity++;
        this.saveCart();
      }
    },

    decreaseQuantity(productId) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          this.removeFromCart(productId);
        }
        this.saveCart();
      }
    },

    clearCart() {
      this.items = [];
      this.saveCart();
    },

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },

    async checkout() {
      this.loading = true;
      this.error = null;
      
      try {
        const inventoryStore = useInventoryStore();

        const order = {
          id: Date.now(),
          items: [...this.items],
          total: this.cartTotal,
          status: 'completed',
          date: new Date().toISOString(),
          canReturn: true
        };

        for (const item of this.items) {
          try {
            await inventoryStore.decreaseStock(item.id, item.quantity);
          } catch (error) {
            console.error(`Failed to decrease stock for ${item.name}:`, error);
          }
        }

        this.orders.unshift(order);
        this.saveOrders();

        this.clearCart();
        this.loading = false;
        return order;
      } catch (error) {
        this.error = error.message || 'Checkout failed';
        this.loading = false;
        throw error;
      }
    },

    async returnOrder(orderId) {
      this.loading = true;
      this.error = null;
      
      try {
        const inventoryStore = useInventoryStore();
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) {
          throw new Error('Order not found');
        }
        
        if (!order.canReturn) {
          throw new Error('This order cannot be returned');
        }

        for (const item of order.items) {
          try {
            await inventoryStore.increaseStock(item.id, item.quantity);
          } catch (error) {
            console.error(`Failed to increase stock for ${item.name}:`, error);
          }
        }

        order.status = 'returned';
        order.canReturn = false;
        order.returnDate = new Date().toISOString();
        
        this.saveOrders();
        
        this.loading = false;
        return order;
      } catch (error) {
        this.error = error.message || 'Return failed';
        this.loading = false;
        throw error;
      }
    },

    saveOrders() {
      localStorage.setItem('orders', JSON.stringify(this.orders));
    },

    clearError() {
      this.error = null;
    }
  }
});
