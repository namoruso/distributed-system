<template>
  <div class="admin-products-page">
    <div class="container">
      <div class="page-header">
        <h1>Manage Products</h1>
        <button @click="showCreateModal = true" class="btn btn-primary">Add New Product</button>
      </div>

      <LoadingSpinner v-if="productsStore.loading" message="Loading products..." />

      <div class="products-table" v-else-if="productsStore.products.length > 0">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in productsStore.products" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.sku }}</td>
              <td>${{ parseFloat(product.price).toFixed(2) }}</td>
              <td>{{ product.stock }}</td>
              <td>
                <span class="badge" :class="product.active ? 'badge-success' : 'badge-error'">
                  {{ product.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editProduct(product)" class="btn btn-sm btn-ghost">Edit</button>
                  <button @click="confirmDelete(product)" class="btn btn-sm btn-ghost text-error">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state card" v-else>
        <p>No products found</p>
        <button @click="showCreateModal = true" class="btn btn-primary">Add First Product</button>
      </div>

      <Modal v-model="showCreateModal" title="Add Product">
        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-textarea"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">SKU</label>
            <input v-model="form.sku" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Price</label>
            <input v-model.number="form.price" type="number" step="0.01" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Stock</label>
            <input v-model.number="form.stock" type="number" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Min Stock</label>
            <input v-model.number="form.minimun" type="number" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Max Stock</label>
            <input v-model.number="form.maximun" type="number" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="form.active" type="checkbox" />
              <span>Active</span>
            </label>
          </div>

          <div class="form-group">
            <label class="form-label">Product Image</label>
            <input 
              type="file" 
              @change="handleImageChange" 
              accept="image/jpeg,image/jpg,image/png,image/webp"
              class="form-input"
              ref="imageInput"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Product preview" />
              <button type="button" @click="removeImage" class="btn btn-sm btn-ghost">Remove Image</button>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="productsStore.loading">
              {{ editingProduct ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        v-model="showDeleteConfirm"
        title="Delete Product"
        :message="`Are you sure you want to delete '${productToDelete?.name}'? This action cannot be undone.`"
        type="danger"
        confirm-text="Delete"
        @confirm="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useProductsStore } from '../../store/products-store';
import { useInventoryStore } from '../../store/inventory-store';
import Modal from '../../components/Modal.vue';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useToast } from '../../composables/useToast';

const productsStore = useProductsStore();
const inventoryStore = useInventoryStore();
const toast = useToast();

const showCreateModal = ref(false);
const editingProduct = ref(null);

const form = reactive({
  name: '',
  description: '',
  sku: '',
  price: 0,
  stock: 0,
  minimun: 5,
  maximun: 100,
  active: true,
  image: null
});

const imagePreview = ref(null);
const imageInput = ref(null);

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.sku = '';
  form.price = 0;
  form.stock = 0;
  form.minimun = 5;
  form.maximun = 100;
  form.active = true;
  form.image = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
  editingProduct.value = null;
};

const editProduct = (product) => {
  editingProduct.value = product;
  form.name = product.name;
  form.description = product.description || '';
  form.sku = product.sku;
  form.price = parseFloat(product.price);
  form.stock = product.stock;
  form.active = product.active;
  form.image = null;
  
  if (product.image_url) {
    imagePreview.value = `http://localhost:8001${product.image_url}`;
  } else {
    imagePreview.value = null;
  }
  
  showCreateModal.value = true;
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  form.image = null;
  imagePreview.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

const handleSubmit = async () => {
  try {
    if (editingProduct.value) {
      await productsStore.updateProduct(editingProduct.value.id, form);
      toast.success('Product updated successfully!');
    } else {
      const newProduct = await productsStore.createProduct(form);

      if (newProduct && newProduct.id) {
        await inventoryStore.addInventory({
          id: newProduct.id,
          name: form.name,
          sku: form.sku,
          stock: form.stock,
          minimun: form.minimun,
          maximun: form.maximun,
          status: form.active
        });

        await productsStore.fetchProducts();
      }
      toast.success('Product created successfully!');
    }
    showCreateModal.value = false;
    resetForm();
  } catch (error) {
    console.error('Failed to save product/inventory:', error);
    console.error('Error details:', error.errors); // Log validation errors
    console.error('Error response:', error.response); // Log full response
    
    // Show specific validation errors if available
    if (error.errors) {
      const errorMessages = Object.values(error.errors).flat().join(', ');
      toast.error(`Validation errors: ${errorMessages}`);
    } else {
      toast.error(error.message || 'Failed to save product. Please try again.');
    }
  }
};

const showDeleteConfirm = ref(false);
const productToDelete = ref(null);

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (productToDelete.value) {
    try {
      await productsStore.deleteProduct(productToDelete.value.id);

      try {
        const inventoryItem = inventoryStore.inventory.find(
          item => item.sku === productToDelete.value.sku
        );
        if (inventoryItem) {
          await inventoryStore.updateInventory(inventoryItem.id, {
            ...inventoryItem,
            status: false
          });
        }
      } catch (invError) {
        console.error('Failed to update inventory status:', invError);
      }
      
      showDeleteConfirm.value = false;
      productToDelete.value = null;
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product. Please try again.');
    }
  }
};

onMounted(async () => {
  try {
    await productsStore.fetchProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
});
</script>

<style scoped>
.admin-products-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.products-table {
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

.product-form {
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
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.image-preview {
  margin-top: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-md);
  display: block;
  margin-bottom: var(--space-3);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .products-table {
    overflow-x: auto;
  }

  table {
    min-width: 600px;
  }
}
</style>
