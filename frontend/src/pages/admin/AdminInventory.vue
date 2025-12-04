<template>
  <div class="admin-inventory-page">
    <div class="container">
      <h1>Inventory Management</h1>

      <LoadingSpinner v-if="inventoryStore.loading" message="Loading inventory..." />

      <div class="inventory-table" v-else-if="inventoryStore.inventory.length > 0">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Min</th>
              <th>Max</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventoryStore.inventory" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.sku }}</td>
              <td>
                <span :class="getStockClass(item)">{{ item.stock }}</span>
              </td>
              <td>{{ item.minimun }}</td>
              <td>{{ item.maximun }}</td>
              <td>
                <span class="badge" :class="item.status ? 'badge-success' : 'badge-error'">
                  {{ item.status ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="updateStockModal(item, 'increase')" class="btn btn-sm btn-ghost">+</button>
                  <button @click="updateStockModal(item, 'decrease')" class="btn btn-sm btn-ghost">-</button>
                  <button @click="confirmDeleteItem(item)" class="btn btn-sm btn-ghost text-error" title="Delete permanently">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state card" v-else>
        <p>No inventory items found</p>
      </div>

      <Modal v-model="showStockModal" :title="`${stockMode === 'increase' ? 'Increase' : 'Decrease'} Stock`">
        <form @submit.prevent="handleStockUpdate" class="stock-form">
          <p>Update stock for: <strong>{{ selectedItem?.name }}</strong></p>
          <p>Current stock: <strong>{{ selectedItem?.stock }}</strong></p>

          <div class="form-group">
            <label class="form-label">Amount</label>
            <input v-model.number="stockAmount" type="number" min="1" class="form-input" required />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showStockModal = false" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="inventoryStore.loading">
              Update
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        v-model="showDeleteConfirm"
        title="Delete Inventory Item"
        :message="`Are you sure you want to permanently delete '${itemToDelete?.name}'? This action cannot be undone.`"
        type="danger"
        confirm-text="Delete Permanently"
        @confirm="handleDeleteItem"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useInventoryStore } from '../../store/inventory-store';
import { useToast } from '../../composables/useToast';
import * as inventoryAPI from '../../api/inventory-api';
import Modal from '../../components/Modal.vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';

const inventoryStore = useInventoryStore();
const toast = useToast();

const showStockModal = ref(false);
const selectedItem = ref(null);
const stockMode = ref('increase');
const stockAmount = ref(1);
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

const getStockClass = (item) => {
  if (item.stock <= item.minimun) return 'text-error font-bold';
  if (item.stock >= item.maximun) return 'text-warning font-bold';
  return 'text-success';
};

const updateStockModal = (item, mode) => {
  selectedItem.value = item;
  stockMode.value = mode;
  stockAmount.value = 1;
  showStockModal.value = true;
};

const handleStockUpdate = async () => {
  try {
    await inventoryStore.updateStock(selectedItem.value.id, stockMode.value, stockAmount.value);
    showStockModal.value = false;
    toast.success(`Stock ${stockMode.value}d by ${stockAmount.value} units successfully!`);
  } catch (error) {
    console.error('Failed to update stock:', error);
    toast.error(error.message || 'Failed to update stock. Please try again.');
  }
};

const confirmDeleteItem = (item) => {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
};

const handleDeleteItem = async () => {
  if (itemToDelete.value) {
    try {
      await inventoryAPI.deleteInventory(itemToDelete.value.id);
      await inventoryStore.fetchInventory();
      showDeleteConfirm.value = false;
      itemToDelete.value = null;
      toast.success('Inventory item deleted permanently!');
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      toast.error(error.message || 'Failed to delete inventory item.');
    }
  }
};

onMounted(async () => {
  try {
    await inventoryStore.fetchInventory();
  } catch (error) {
    console.error('Failed to load inventory:', error);
    toast.error('Failed to load inventory data.');
  }
});
</script>

<style scoped>
.admin-inventory-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.admin-inventory-page h1 {
  margin-bottom: var(--space-8);
}

.inventory-table {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-bg-tertiary);
}

th {
  padding: var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-divider);
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
}

.stock-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-4);
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
  .inventory-table {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style>
