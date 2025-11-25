import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const Login = () => import('../pages/Login.vue')
const Register = () => import('../pages/Register.vue')
const Dashboard = () => import('../pages/Dashboard.vue')
const Products = () => import('../pages/Products.vue')
const Inventory = () => import('../pages/Inventory.vue')
const Verify = () => import('../pages/Verify.vue')


const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
  { path: '/products', component: Products },
  { path: '/inventory', component: Inventory },
  { path: '/verify', component: Verify },


  // ruta por defecto
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// PROTECCIÓN DE RUTAS
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const isProtected = !['/login', '/register'].includes(to.path)

  if (isProtected && !auth.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
