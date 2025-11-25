<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/axiosAuth'
import '../styles/dashboard.css'

const user = ref(null)

onMounted(async () => {
  const res = await api.get('/me')
  user.value = res.data
})
</script>

<template>
  <div>
    <h1>Dashboard</h1>

    <div v-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Nombre:</strong> {{ user.nombre }}</p>
      <p><strong>Correo:</strong> {{ user.correo }}</p>
      <p><strong>Verificado:</strong> {{ user.verif ? "Sí" : "No" }}</p>
    </div>
  </div>
</template>
