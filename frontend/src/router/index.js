import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const Login = () => import('../pages/Login.vue')
const Register = () => import('../pages/Register.vue')
const Dashboard = () => import('../pages/Dashboard.vue')
const Products = () => import('../pages/Products.vue')
const Inventory = () => import('../pages/Inventory.vue')
const Verify = () => import('../pages/Verify.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },

  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/verify', component: Verify },

  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true }},
  { path: '/products', component: Products, meta: { requiresAuth: true }},
  { path: '/inventory', component: Inventory, meta: { requiresAuth: true }}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  const isLogged = !!auth.token
  const needsAuth = to.meta.requiresAuth

  //  si no esta y la ruta es privada  manda a login directamente 
  if (needsAuth && !isLogged) {
    return next('/login')
  }

  // si ya se inidio sesion te lleva directo al dashboard
  if (isLogged && ['/login', '/register', '/verify'].includes(to.path)) {
    return next('/dashboard')
  }

  next()
})

export default router
