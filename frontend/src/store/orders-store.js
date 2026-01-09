import { defineStore } from 'pinia';
import ordersAPI from '../api/orders-api';

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    },
  }),

  getters: {
    ordersByStatus: (state) => (status) => {
      return state.orders.filter(order => order.status === status);
    },

    hasOrders: (state) => state.orders.length > 0,

    totalOrders: (state) => state.pagination.totalElements,
  },

  actions: {
    async createOrder(orderData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await ordersAPI.createOrder(orderData);
        
        if (response.data.success) {
          this.orders.unshift(response.data.data);
          this.currentOrder = response.data.data;
          return response.data.data;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error creating order';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(filters = {}) {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: filters.page || this.pagination.page,
          size: filters.size || this.pagination.size,
          status: filters.status,
          sortBy: filters.sortBy || 'createdAt',
          sortDir: filters.sortDir || 'DESC',
        };

        const response = await ordersAPI.getUserOrders(params);

        if (response.data.success) {
          const pageData = response.data.data;
          this.orders = pageData.content;
          this.pagination = {
            page: pageData.number,
            size: pageData.size,
            totalElements: pageData.totalElements,
            totalPages: pageData.totalPages,
          };
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error fetching orders';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderById(orderId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await ordersAPI.getOrderById(orderId);
        
        if (response.data.success) {
          this.currentOrder = response.data.data;
          return response.data.data;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error fetching order details';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateOrderStatus(orderId, newStatus) {
      this.loading = true;
      this.error = null;

      try {
        const response = await ordersAPI.updateOrderStatus(orderId, newStatus);
        
        if (response.data.success) {
          const index = this.orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
            this.orders[index].status = response.data.data.status;
          }

          if (this.currentOrder?.id === orderId) {
            this.currentOrder = response.data.data;
          }

          return response.data.data;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Error updating order status';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentOrder() {
      this.currentOrder = null;
    },
  },
});
