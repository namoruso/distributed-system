<template>
  <div class="product-card card">
    <div class="product-image">
      <img :src="imageUrl" :alt="product.name" @error="handleImageError" />
      <div class="product-badge" v-if="!product.active || product.stock === 0">
        {{ product.stock === 0 ? "Out of Stock" : "Inactive" }}
      </div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ truncatedDescription }}</p>

      <div class="product-meta">
        <span class="product-sku">SKU: {{ product.sku }}</span>
        <span class="product-stock" :class="stockClass">
          Stock: {{ product.stock || 0 }}
        </span>
      </div>

      <div class="product-footer">
        <span class="product-price">${{ formatPrice(product.price) }}</span>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!product.active || product.stock === 0"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const truncatedDescription = computed(() => {
  if (!props.product.description) return "";
  return props.product.description.length > 100
    ? props.product.description.substring(0, 100) + "..."
    : props.product.description;
});

const stockClass = computed(() => {
  const stock = props.product.stock || 0;
  if (stock === 0) return "stock-out";
  if (stock < 10) return "stock-low";
  return "stock-ok";
});

const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzJhMmEzYSIvPjxwYXRoIGQ9Ik0xNTAgMTUwaDEwMHYxMDBIMTUweiIgZmlsbD0iIzM3Mzc0OCIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iMTAiIGZpbGw9IiM2MzY2ZjEiLz48cGF0aCBkPSJNMTgwIDIwMGwyMCAyMGgyMGwtMzAtMzB6IiBmaWxsPSIjNjM2NmYxIi8+PC9zdmc+";

const imageUrl = computed(() => {
  if (!props.product.image_url) return placeholderImage;

  if (props.product.image_url.startsWith("http")) {
    return props.product.image_url;
  }

  const productsApiUrl =
    import.meta.env.VITE_PRODUCTS_API_URL || "http://localhost:8001";
  return `${productsApiUrl}${props.product.image_url}`;
});

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const handleImageError = (e) => {
  e.target.src = placeholderImage;
};
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform var(--transition-base),
    box-shadow var(--transition-base);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: var(--color-background-secondary);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-error);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
}

.product-info {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.product-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--color-text-primary);
}

.product-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
  line-height: 1.5;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.product-sku {
  color: var(--color-text-muted);
}

.product-stock {
  font-weight: var(--font-weight-semibold);
}

.stock-ok {
  color: var(--color-success);
}

.stock-low {
  color: var(--color-warning);
}

.stock-out {
  color: var(--color-error);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: var(--space-3);
}

.product-price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
</style>
