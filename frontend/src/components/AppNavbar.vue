<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import logo from '../assets/logo.svg'

const router = useRouter()
const auth = useAuthStore()


const user = computed(() => auth.user)

function logout() {
  auth.logout()
  router.push('/login')
}

function getUserInitials() {
  const name = user.value?.nombre || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>

<template>
  <nav class="dashboard-navbar">
    <div class="navbar-content">

      
      <div class="navbar-left">
        <img :src="logo" alt="Logo" class="app-logo" />
      </div>

      
      <ul class="nav-menu">
        <li>
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <span class="nav-icon">📊</span> Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/products" class="nav-link" active-class="active">
            <span class="nav-icon">📦</span> Productos
          </router-link>
        </li>
        <li>
          <router-link to="/inventory" class="nav-link" active-class="active">
            <span class="nav-icon">🔧</span> Inventario
          </router-link>
        </li>
      </ul>

      <div class="navbar-user">
        <button class="logout-btn" @click="logout">Salir</button>
      </div>

    </div>
  </nav>
</template>

<style scoped>
@import '../styles/dashboard.css';


.app-logo {
  width: 150px;
  height: auto;
}
</style>
