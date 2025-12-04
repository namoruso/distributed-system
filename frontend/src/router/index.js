import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth-store';

import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import CatalogPage from '../pages/CatalogPage.vue';
import CartPage from '../pages/CartPage.vue';
import OrdersPage from '../pages/OrdersPage.vue';

import AdminDashboard from '../pages/admin/AdminDashboard.vue';
import AdminProducts from '../pages/admin/AdminProducts.vue';
import AdminInventory from '../pages/admin/AdminInventory.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guest: true }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: CatalogPage
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartPage,
    meta: { requiresAuth: true, customerOnly: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: OrdersPage,
    meta: { requiresAuth: true, customerOnly: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: AdminProducts,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/admin/inventory',
    name: 'AdminInventory',
    component: AdminInventory,
    meta: { requiresAuth: true, adminOnly: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && localStorage.getItem('jwt_token')) {
    authStore.initAuth();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guest);
  const adminOnly = to.matched.some(record => record.meta.adminOnly);
  const customerOnly = to.matched.some(record => record.meta.customerOnly);

  if (guestOnly && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return next('/admin');
    }
    return next('/');
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  }

  if (adminOnly && !authStore.isAdmin) {
    return next('/');
  }

  if (customerOnly && authStore.isAdmin) {
    return next('/admin');
  }

  next();
});

export default router;
