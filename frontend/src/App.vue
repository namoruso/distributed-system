<template>
  <div id="app">
    <Navbar v-if="!isAuthPage" />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <Footer v-if="!isAuthPage" />
    
    <!-- Global Toast Notifications -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store/auth-store';
import { useCartStore } from './store/cart-store';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ToastNotification from './components/ToastNotification.vue';

const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const isAuthPage = computed(() => {
  return ['Login', 'Register'].includes(route.name);
});

onMounted(() => {
  // Initialize auth from localStorage
  authStore.initAuth();
  
  // Initialize cart from localStorage
  cartStore.initCart();
});
</script>

<style>
@import './styles/variables.css';
@import './styles/global.css';
@import './styles/animations.css';
@import './styles/components.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
