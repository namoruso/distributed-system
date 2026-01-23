import { defineStore } from 'pinia';
import * as productsAPI from '../api/products-api';


export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      inStock: false
    },
    sortBy: 'name',
    cartItems: []
  }),

  getters: {
    filteredProducts: (state) => {
      let filtered = [...state.products];

      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.sku?.toLowerCase().includes(search)
        );
      }

      filtered = filtered.filter(p => {
        const price = parseFloat(p.price);
        return price >= state.filters.minPrice && price <= state.filters.maxPrice;
      });

      if (state.filters.inStock) {
        filtered = filtered.filter(p => p.stock > 0 && p.active);
      }

      switch (state.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-desc':
          filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'name':
        default:
          filtered.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return filtered;
    },

    productsCount: (state) => state.products.length,

    inStockCount: (state) => state.products.filter(p => p.stock > 0 && p.active).length,

    outOfStockCount: (state) => state.products.filter(p => p.stock === 0 || !p.active).length,

    cartCount: (state) => state.cartItems.reduce((total, item) => total + item.quantity, 0),

    cartTotal: (state) => state.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0),

    hasItemsInCart: (state) => state.cartItems.length > 0
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await productsAPI.getAllProducts();
        const products = response.data || response;
        
        this.products = products;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching products:', error);
        this.error = error.message || 'Failed to fetch products';
        this.loading = false;
      }
    },

    async fetchProductById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await productsAPI.getProductById(id);
        this.selectedProduct = response.data || response;
        this.loading = false;
        return this.selectedProduct;
      } catch (error) {
        this.error = error.message || 'Failed to fetch product';
        this.loading = false;
        throw error;
      }
    },

    async createProduct(productData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await productsAPI.createProduct(productData);
        const newProduct = response.data || response;
        this.products.push(newProduct);
        this.loading = false;
        return newProduct;
      } catch (error) {
        this.error = error.message || 'Failed to create product';
        this.loading = false;
        throw error;
      }
    },

    async updateProduct(id, productData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await productsAPI.updateProduct(id, productData);
        const updatedProduct = response.data || response;

        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }

        if (this.selectedProduct?.id === id) {
          this.selectedProduct = updatedProduct;
        }

        this.loading = false;
        return updatedProduct;
      } catch (error) {
        this.error = error.message || 'Failed to update product';
        this.loading = false;
        throw error;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await productsAPI.deleteProduct(id);

        this.products = this.products.filter(p => p.id !== id);

        if (this.selectedProduct?.id === id) {
          this.selectedProduct = null;
        }
        
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to delete product';
        this.loading = false;
        throw error;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy;
    },

    clearFilters() {
      this.filters = {
        search: '',
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        inStock: false
      };
    },

    clearError() {
      this.error = null;
    },

    addToCart(product, quantity = 1) {
      const existingItem = this.cartItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cartItems.push({
          product,
          quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },

    removeFromCart(productId) {
      this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },

    updateCartItemQuantity(productId, quantity) {
      const item = this.cartItems.find(item => item.product.id === productId);
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          localStorage.setItem('cart', JSON.stringify(this.cartItems));
        }
      }
    },

    clearCart() {
      this.cartItems = [];
      localStorage.removeItem('cart');
    },

    loadCartFromStorage() {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
        } catch (error) {
          console.error('Error loading cart from storage:', error);
          this.cartItems = [];
        }
      }
    }
  }
});
