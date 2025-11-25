<template>
  <nav class="navbar">
    <div class="nav-left">
      <h2 class="logo">Distribuido</h2>

      <ul>
        <li><router-link to="/dashboard">Dashboard</router-link></li>
        <li><router-link to="/products">Productos</router-link></li>
        <li><router-link to="/inventory">Inventario</router-link></li>
      </ul>
    </div>

    <div class="nav-right">
      <span class="logout" @click="logout">Salir</span>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()

function logout() {
  auth.logout()
}
</script>
