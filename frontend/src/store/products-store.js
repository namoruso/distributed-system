import { defineStore } from 'pinia';
import * as productsAPI from '../api/products-api';
import * as inventoryAPI from '../api/inventory-api';

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
    sortBy: 'name' 
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

    outOfStockCount: (state) => state.products.filter(p => p.stock === 0 || !p.active).length
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        const [productsResponse, inventoryResponse] = await Promise.all([
          productsAPI.getAllProducts(),
          inventoryAPI.getAllInventory()
        ]);
        
        const products = productsResponse.data || productsResponse;
        const inventory = Array.isArray(inventoryResponse) ? inventoryResponse : (inventoryResponse.data || []);

        this.products = products.map(product => {

          const inventoryItem = inventory.find(item => item.sku === product.sku);
          
          if (inventoryItem) {
            return {
              ...product,
              stock: inventoryItem.stock,
              minimun: inventoryItem.minimun,
              maximun: inventoryItem.maximun,
              inventory_status: inventoryItem.status
            };
          }

          return product;
        });
        
        this.loading = false;
      } catch (error) {
        console.error('Error fetching products/inventory:', error);
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
    }
  }
});
