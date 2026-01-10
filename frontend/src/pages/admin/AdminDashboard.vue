<template>
  <div class="admin-page">
    <div class="container">
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage products and inventory</p>
      </div>

      <div class="admin-nav">
        <router-link to="/admin/products" class="admin-nav-link">Products</router-link>
        <router-link to="/admin/inventory" class="admin-nav-link">Inventory</router-link>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card card">
          <h3>Total Products</h3>
          <p class="stat-value">{{ productsStore.productsCount }}</p>
        </div>
        
        <div class="stat-card card">
          <h3>In Stock</h3>
          <p class="stat-value text-success">{{ productsStore.inStockCount }}</p>
        </div>
        
        <div class="stat-card card">
          <h3>Out of Stock</h3>
          <p class="stat-value text-error">{{ productsStore.outOfStockCount }}</p>
        </div>
        
        <div class="stat-card card">
          <h3>Low Stock Items</h3>
          <p class="stat-value text-warning">{{ inventoryStore.lowStockItems.length }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/admin/products" class="action-card card hover-lift">
            <h3>Manage Products</h3>
            <p>Add, edit, or delete products</p>
          </router-link>
          
          <router-link to="/admin/inventory" class="action-card card hover-lift">
            <h3>Manage Inventory</h3>
            <p>Update stock levels and alerts</p>
          </router-link>

          <router-link to="/admin/payments" class="action-card card hover-lift">
            <h3>Manage Payments</h3>
            <p>View and manage payment transactions</p>
        </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '../../store/products-store';
import { useInventoryStore } from '../../store/inventory-store';

const productsStore = useProductsStore();
const inventoryStore = useInventoryStore();

onMounted(async () => {
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      inventoryStore.fetchInventory()
    ]);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
});
</script>

<style scoped>
.admin-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.admin-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.admin-header p {
  color: var(--color-text-muted);
}

.admin-nav {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-12);
}

.admin-nav-link {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  border: 2px solid var(--color-border);
}

.admin-nav-link:hover,
.admin-nav-link.router-link-active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.stat-card {
  padding: var(--space-6);
  text-align: center;
}

.stat-card h3 {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0;
}

.quick-actions h2 {
  margin-bottom: var(--space-6);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.action-card {
  padding: var(--space-8);
  text-decoration: none;
  cursor: pointer;
}

.action-card h3 {
  color: var(--color-primary);
  margin-bottom: var(--space-3);
}

.action-card p {
  color: var(--color-text-muted);
  margin: 0;
}
</style>
