<script setup>
import { ref } from 'vue'
import api from '../api/axiosAuth'
import { useAuthStore } from '../store/auth'
import '../styles/auth.css'

const correo = ref('')
const clave = ref('')
const error = ref(null)

const auth = useAuthStore()

async function login() {
  error.value = null

  try {
    const res = await api.post('/login', {
      correo: correo.value,
      clave: clave.value
    })

    auth.setToken(res.data.token)

    // redirige al dashboard
    window.location.href = '/dashboard'

  } catch (err) {
    error.value = err.response?.data?.detail || 'Credenciales inválidas'
  }


}
</script>

<template>
  <div class="auth-container">

    <h1>Iniciar Sesión</h1>

    <form @submit.prevent="login" class="auth-form">

      <!-- Campo correo -->
      <div class="form-group">
        <label>Correo electrónico</label>
        <input
          type="email"
          v-model="correo"
          placeholder="tuemail@correo.com"
        />
      </div>

      <!-- Campo contraseña -->
      <div class="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          v-model="clave"
          placeholder="••••••••"
        />
      </div>

      <button type="submit">Entrar</button>

      <p class="error" v-if="error">{{ error }}</p>
    </form>

    <p class="aux-text">
      ¿No tienes cuenta?  
      <router-link to="/register">Regístrate aquí</router-link>
    </p>

  </div>
</template>
