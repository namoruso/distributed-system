<template>
  <div class="catalog-page">
    <div class="container">
      <div class="catalog-header">
        <h1>Audio Products Catalog</h1>
        <p>Discover our premium collection of audio equipment</p>
      </div>

      <div class="filters-section card">
        <div class="filter-group">
          <input
            v-model="productsStore.filters.search"
            type="text"
            class="form-input"
            placeholder="Search products..."
          />
        </div>
        
        <div class="filter-group">
          <select v-model="productsStore.sortBy" class="form-select">
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="form-checkbox">
            <input type="checkbox" v-model="productsStore.filters.inStock" />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      <LoadingSpinner v-if="productsStore.loading" message="Loading products..." />
      
      <div class="products-grid" v-else-if="filteredProducts.length > 0">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <div class="empty-state card" v-else>
        <p>No products found matching your criteria.</p>
        <button @click="productsStore.clearFilters()" class="btn btn-primary">Clear Filters</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useProductsStore } from '../store/products-store';
import ProductCard from '../components/ProductCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const productsStore = useProductsStore();

const filteredProducts = computed(() => productsStore.filteredProducts);

onMounted(async () => {
  try {
    await productsStore.fetchProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
});
</script>

<style scoped>
.catalog-page {
  padding-top: calc(var(--navbar-height) + var(--space-8));
  padding-bottom: var(--space-20);
  min-height: 100vh;
}

.catalog-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.catalog-header p {
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.filters-section {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
  padding: var(--space-6);
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
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
  .filters-section {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
