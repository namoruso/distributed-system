<script setup>
import { ref } from 'vue'
import api from '../api/axiosAuth'
import '../styles/auth.css'
import { useRouter } from 'vue-router'

const router = useRouter()

const nombre = ref('')
const correo = ref('')
const clave = ref('')
const clave2 = ref('')

const msg = ref(null)
const error = ref(null)

async function register() {
  msg.value = null
  error.value = null

  try {
    await api.post('/registro', {
      nombre: nombre.value,
      correo: correo.value,
      clave: clave.value,
      clave2: clave2.value
    })

    msg.value = "Registro exitoso. Redirigiendo a verificación…"

    setTimeout(() => router.push('/verify'), 1500)

  } catch (err) {
    error.value = err.response?.data?.detail || 'Error en el registro'
  }
}
</script>

<template>
  <div class="auth-container">

    <h1>Registro</h1>

    <form @submit.prevent="register" class="auth-form">

      <!-- Nombre -->
      <div class="form-group">
        <label>Nombre completo</label>
        <input type="text" v-model="nombre" placeholder="Tu nombre" />
      </div>

      <!-- Correo -->
      <div class="form-group">
        <label>Correo electrónico</label>
        <input type="email" v-model="correo" placeholder="tuemail@correo.com" />
      </div>

      <!-- Contraseña -->
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" v-model="clave" placeholder="••••••••" />
      </div>

      <!-- Repetir contraseña -->
      <div class="form-group">
        <label>Verificar contraseña</label>
        <input type="password" v-model="clave2" placeholder="••••••••" />
      </div>

      <button type="submit">Registrarse</button>

      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-if="msg">{{ msg }}</p>

    </form>

    <p class="aux-text">
      ¿Ya tienes cuenta?  
      <router-link to="/login">Inicia sesión</router-link>
    </p>

  </div>
</template>
