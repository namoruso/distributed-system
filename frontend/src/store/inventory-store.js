import { defineStore } from 'pinia';
import * as inventoryAPI from '../api/inventory-api';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventory: [],
    selectedInventory: null,
    loading: false,
    error: null,
    lowStockThreshold: 10
  }),

  getters: {
    allInventory: (state) => state.inventory,

    lowStockItems: (state) => {
      return state.inventory.filter(item => 
        item.stock <= state.lowStockThreshold && item.status
      );
    },

    outOfStockItems: (state) => {
      return state.inventory.filter(item => item.stock === 0);
    },

    activeItems: (state) => state.inventory.filter(item => item.status),
    inactiveItems: (state) => state.inventory.filter(item => !item.status),

    inventoryCount: (state) => state.inventory.length,

    totalStockValue: (state) => {
      return state.inventory.reduce((total, item) => total + item.stock, 0);
    },

    needsRestock: (state) => (id) => {
      const item = state.inventory.find(i => i.id === id);
      return item ? item.stock <= item.minimun : false;
    },

    isOverstocked: (state) => (id) => {
      const item = state.inventory.find(i => i.id === id);
      return item ? item.stock >= item.maximun : false;
    }
  },

  actions: {
    async fetchInventory() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.getAllInventory();
        this.inventory = Array.isArray(response) ? response : (response.data || []);
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to fetch inventory';
        this.loading = false;
        throw error;
      }
    },

    async fetchInventoryById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.getInventoryById(id);
        this.selectedInventory = response.data || response;
        this.loading = false;
        return this.selectedInventory;
      } catch (error) {
        this.error = error.message || 'Failed to fetch inventory item';
        this.loading = false;
        throw error;
      }
    },

    async addInventory(inventoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.addInventory(inventoryData);
        const newItem = response.data || response;

        await this.fetchInventory();
        
        this.loading = false;
        return newItem;
      } catch (error) {
        this.error = error.message || 'Failed to add inventory';
        this.loading = false;
        throw error;
      }
    },

    async updateInventory(id, inventoryData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.updateInventory(id, inventoryData);
        const updatedItem = response.data || response;

        const index = this.inventory.findIndex(i => i.id === id);
        if (index !== -1) {
          this.inventory[index] = { ...this.inventory[index], ...updatedItem };
        }

        if (this.selectedInventory?.id === id) {
          this.selectedInventory = { ...this.selectedInventory, ...updatedItem };
        }
        
        this.loading = false;
        return updatedItem;
      } catch (error) {
        this.error = error.message || 'Failed to update inventory';
        this.loading = false;
        throw error;
      }
    },

    async increaseStock(id, amount) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.increaseStock(id, amount);

        await this.fetchInventory();
        
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Failed to increase stock';
        this.loading = false;
        throw error;
      }
    },

    async decreaseStock(id, amount) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.decreaseStock(id, amount);

        await this.fetchInventory();
        
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Failed to decrease stock';
        this.loading = false;
        throw error;
      }
    },

    async updateStock(id, mode, amount) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await inventoryAPI.updateStock(id, mode, amount);

        await this.fetchInventory();
        
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Failed to update stock';
        this.loading = false;
        throw error;
      }
    },

    setLowStockThreshold(threshold) {
      this.lowStockThreshold = threshold;
    },

    clearError() {
      this.error = null;
    }
  }
});
