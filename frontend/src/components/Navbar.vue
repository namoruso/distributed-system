<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <router-link to="/" class="navbar-logo">
        <div class="logo-icon">
          <div class="waveform">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <span class="logo-text">AudioHub</span>
      </router-link>

      <div class="navbar-menu desktop-menu">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/catalog" class="nav-link">Catalog</router-link>
        
        <template v-if="isAdmin">
          <router-link to="/admin" class="nav-link admin-link">
            <span>Admin</span>
          </router-link>
        </template>
      </div>

      <div class="navbar-actions">
        <router-link to="/cart" class="nav-icon" v-if="!isAdmin">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2L7 6H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V7a1 1 0 00-1-1h-4l-2-4H9z"/>
            <circle cx="9" cy="13" r="1"/>
            <circle cx="15" cy="13" r="1"/>
          </svg>
          <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
        </router-link>

        <NotificationBell v-if="isAuthenticated" />

        <div class="user-menu" v-if="isAuthenticated">
          <button class="user-button" @click="toggleUserMenu">
            <div class="avatar">{{ userInitial }}</div>
            <span class="user-name">{{ userName }}</span>
          </button>
          
          <div class="user-dropdown" v-if="showUserMenu">
            <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
              Profile
            </router-link>
            <router-link to="/orders" class="dropdown-item" @click="showUserMenu = false" v-if="!isAdmin">
              Orders
            </router-link>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" @click="handleLogout">
              Logout
            </button>
          </div>
        </div>

        <router-link to="/login" class="btn btn-primary btn-sm" v-else>
          Login
        </router-link>

        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <div class="mobile-menu" :class="{ active: showMobileMenu }">
      <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">Home</router-link>
      <router-link to="/catalog" class="mobile-nav-link" @click="closeMobileMenu">Catalog</router-link>
      
      <template v-if="isAdmin">
        <router-link to="/admin" class="mobile-nav-link" @click="closeMobileMenu">Admin</router-link>
      </template>
      
      <template v-if="!isAdmin && isAuthenticated">
        <router-link to="/cart" class="mobile-nav-link" @click="closeMobileMenu">Cart</router-link>
        <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">Orders</router-link>
      </template>
      
      <router-link to="/profile" class="mobile-nav-link" @click="closeMobileMenu" v-if="isAuthenticated">Profile</router-link>
      
      <button class="mobile-nav-link logout" @click="handleLogout" v-if="isAuthenticated">Logout</button>
      <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu" v-else>Login</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth-store';
import { useCartStore } from '../store/cart-store';
import NotificationBell from './NotificationBell.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const userName = computed(() => authStore.userName);
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const cartCount = computed(() => cartStore.cartItemsCount);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
  showMobileMenu.value = false;
  router.push('/');
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  z-index: var(--z-sticky);
}

.navbar-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  transition: transform var(--transition-base);
}

.navbar-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
}

.waveform {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
}

.waveform span {
  width: 3px;
  background: white;
  border-radius: 2px;
  animation: waveform 1s ease-in-out infinite;
}

.waveform span:nth-child(1) { animation-delay: 0s; }
.waveform span:nth-child(2) { animation-delay: 0.1s; }
.waveform span:nth-child(3) { animation-delay: 0.2s; }
.waveform span:nth-child(4) { animation-delay: 0.3s; }
.waveform span:nth-child(5) { animation-delay: 0.4s; }

.logo-text {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex: 1;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  transition: width var(--transition-base);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.admin-link {
  color: var(--color-secondary);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.nav-icon:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-secondary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.user-button:hover {
  background: var(--color-bg-hover);
}

.user-name {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 200px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-2);
  animation: fadeInDown var(--transition-base);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.dropdown-item.logout {
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-divider);
  margin: var(--space-2) 0;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  width: 32px;
  height: 32px;
  padding: 4px;
}

.mobile-menu-toggle span {
  width: 100%;
  height: 2px;
  background: var(--color-text-secondary);
  border-radius: 2px;
  transition: all var(--transition-base);
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }

  .user-name {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--transition-base);
  }

  .mobile-menu.active {
    max-height: 400px;
  }

  .mobile-nav-link {
    padding: var(--space-4);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-bottom: 1px solid var(--color-divider);
    transition: all var(--transition-fast);
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    cursor: pointer;
  }

  .mobile-nav-link:hover,
  .mobile-nav-link.router-link-active {
    background: var(--color-bg-hover);
    color: var(--color-primary);
  }

  .mobile-nav-link.logout {
    color: var(--color-error);
  }
}
</style>
