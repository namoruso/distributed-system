<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../api/axiosAuth'
import '../styles/dashboard.css'

const user = ref(null)
const loading = ref(true)
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  try {
    const res = await api.get('/me')
    user.value = res.data
  } catch (err) {
    console.error('Error cargando dashboard:', err)
    if (err.response?.status === 401) {
      auth.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
})

function logout() {
  auth.logout()
  router.push('/login')
}

function getUserInitials() {
  return user.value?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
}
</script>

<template>
  <div class="dashboard-layout">
    <!-- Navbar Integrado -->
    <nav class="dashboard-navbar">
      <div class="navbar-content">

        <!-- Menú de Navegación -->
        <ul class="nav-menu">
          <li>
            <router-link to="/dashboard" class="nav-link active">
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

        <!-- User Section -->
        <div class="navbar-user">
          <div class="user-info">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ user?.nombre || 'Usuario' }}</span>
              <span class="user-email">{{ user?.correo || '' }}</span>
            </div>
          </div>
          
          <div class="navbar-actions">
            <button class="logout-btn" @click="logout" title="Cerrar Sesión">
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <main class="dashboard-main">
      <div class="dashboard-container">
        <!-- Header Principal -->
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1>¡Bienvenida, {{ user?.nombre }}! 👋</h1>
            <p class="subtitle">Panel de control del sistema distribuido</p>
          </div>
          <div class="header-actions">
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>

        <!-- Contenido Principal -->
        <div v-else class="dashboard-content">
          <!-- Tarjetas de Estado -->
          <div class="status-cards">
            <div class="status-card primary">
              <div class="card-icon">📦</div>
              <div class="card-content">
                <h3>Productos Activos</h3>
                <p class="card-value">24</p>
                <p class="card-label">En el sistema</p>
              </div>
            </div>

            <div class="status-card success">
              <div class="card-icon">✅</div>
              <div class="card-content">
                <h3>Estado de Cuenta</h3>
                <p class="card-value">Verificada</p>
                <p class="card-label">Cuenta activa</p>
              </div>
            </div>

            <div class="status-card warning">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <h3>Inventario</h3>
                <p class="card-value">85%</p>
                <p class="card-label">Disponibilidad</p>
              </div>
            </div>
          </div>

          <!-- Sección de Acciones Rápidas -->
          <div class="quick-actions-section">
            <h2>Acciones Rápidas</h2>
            <div class="actions-grid">
              <router-link to="/products" class="action-card">
                <div class="action-icon">📦</div>
                <div class="action-content">
                  <h3>Gestionar Productos</h3>
                  <p>Administrar catálogo y precios</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

              <router-link to="/inventory" class="action-card">
                <div class="action-icon">📊</div>
                <div class="action-content">
                  <h3>Control de Inventario</h3>
                  <p>Ver stock y movimientos</p>
                </div>
                <div class="action-arrow">→</div>
              </router-link>

            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>