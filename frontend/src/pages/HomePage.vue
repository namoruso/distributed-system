<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title animate-fade-in-up">Premium Audio Equipment</h1>
          <p class="hero-subtitle animate-fade-in-up">Experience sound like never before with our curated collection of professional audio gear</p>
          <div class="hero-actions animate-fade-in-up">
            <router-link to="/catalog" class="btn btn-primary btn-lg">Shop Now</router-link>
            <router-link to="/about" class="btn btn-outline btn-lg">Learn More</router-link>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="audio-visualizer">
            <div class="viz-bar" v-for="i in 20" :key="i" :style="{ animationDelay: `${i * 0.05}s` }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">Featured Products</h2>
        
        <LoadingSpinner v-if="productsStore.loading" message="Loading products..." />
        
        <div class="products-grid" v-else-if="featuredProducts.length > 0">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <div class="empty-state" v-else>
          <p>No products available at the moment.</p>
          <router-link to="/catalog" class="btn btn-primary">View All Products</router-link>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        
        <div class="categories-grid">
          <div class="category-card card hover-lift">
            <h3>Headphones</h3>
            <p>Premium over-ear and in-ear headphones</p>
          </div>
          <div class="category-card card hover-lift">
            <h3>Speakers</h3>
            <p>Studio monitors and home audio systems</p>
          </div>
          <div class="category-card card hover-lift">
            <h3>Microphones</h3>
            <p>Professional recording microphones</p>
          </div>
          <div class="category-card card hover-lift">
            <h3>Accessories</h3>
            <p>Cables, stands, and audio interfaces</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useProductsStore } from '../store/products-store';
import ProductCard from '../components/ProductCard.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const productsStore = useProductsStore();

const featuredProducts = computed(() => {
  return productsStore.products.slice(0, 6);
});

onMounted(async () => {
  try {
    await productsStore.fetchProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
});
</script>

<style scoped>
.home-page {
  padding-top: var(--navbar-height);
}

.hero {
  min-height: 600px;
  display: flex;
  align-items: center;
  padding: var(--space-20) 0;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 600px;
  z-index: 1;
}

.hero-title {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-6);
  animation-delay: 0.1s;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  animation-delay: 0.2s;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  animation-delay: 0.3s;
}

.hero-visual {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 50%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
}

.audio-visualizer {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.viz-bar {
  width: 12px;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: 6px;
  animation: waveform 1.5s ease-in-out infinite;
}

.featured-section,
.categories-section {
  padding: var(--space-20) 0;
}

.section-title {
  text-align: center;
  margin-bottom: var(--space-12);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.category-card {
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
}

.category-card h3 {
  margin-bottom: var(--space-3);
  color: var(--color-primary);
}

.category-card p {
  color: var(--color-text-muted);
  margin: 0;
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
  .hero {
    min-height: 400px;
  }

  .hero-visual {
    display: none;
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
