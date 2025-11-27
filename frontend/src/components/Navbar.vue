<template>
  <nav class="navbar-top">
    <div class="navbar-container">
      <!-- Logo y Título -->
      <div class="navbar-brand">
        <div class="logo">🚀</div>
        <h1 class="brand-text">Distribuido</h1>
      </div>

      <!-- Menú de Navegación -->
      <ul class="nav-menu">
        <li>
          <router-link to="/dashboard" class="nav-link">
            <span class="nav-icon">📊</span>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/products" class="nav-link">
            <span class="nav-icon">📦</span>
            Productos
          </router-link>
        </li>
        <li>
          <router-link to="/inventory" class="nav-link">
            <span class="nav-icon">🔧</span>
            Inventario
          </router-link>
        </li>
      </ul>

      <!-- Sección Usuario -->
      <div class="navbar-user">
        <div class="user-info">
          <div class="user-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ getUserName() }}</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
        
        <div class="navbar-actions">
          <button class="icon-btn" title="Notificaciones">
            <span class="icon">🔔</span>
            <span class="notification-badge">3</span>
          </button>
          <button class="icon-btn" title="Configuración">
            <span class="icon">⚙️</span>
          </button>
          <button class="logout-btn" @click="logout" title="Cerrar Sesión">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">Salir</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}

function getUserInitials() {
  // Temporal - luego conectaremos con datos reales
  return 'MP'
}

function getUserName() {
  // Temporal - luego conectaremos con datos reales
  return 'Maria P.'
}
</script>