<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axiosAuth'
import { useAuthStore } from '../store/auth'
import '../styles/auth.css'
import AuthFooter from '../components/AuthFooter.vue'

const correo = ref('')
const clave = ref('')
const error = ref(null)
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function login() {
  error.value = null
  loading.value = true

  try {
    console.log('📤 Enviando credenciales...', {
      correo: correo.value,
      clave: clave.value
    })

    const res = await api.post('/login', {
      correo: correo.value,
      clave: clave.value
    })

    console.log('Respuesta completa del login:', res)
    console.log('Datos recibidos:', res.data)

    // Verificar diferentes posibles nombres del token
    const token = res.data.token || res.data.access_token || res.data.accessToken
    
    console.log('Token extraído:', token)

    if (!token) {
      throw new Error('No se recibió token del servidor')
    }

    console.log('Guardando token en store...')
    auth.setToken(token)
    
    console.log('Token después de guardar en store:', auth.token)
    console.log('Token en localStorage:', localStorage.getItem('token'))

    // Redirigir al dashboard usando router en lugar de window.location
    console.log('Redirigiendo a dashboard...')
    router.push('/dashboard')

  } catch (err) {
    console.error('Error en login:', err)
    console.error('Detalles del error:', err.response?.data)
    
    error.value = err.response?.data?.detail || 
                  err.response?.data?.message || 
                  'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
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
            :disabled="loading"
          />
        </div>

        <!-- Campo contraseña -->
        <div class="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            v-model="clave"
            placeholder="••••••••"
            :disabled="loading"
          />
        </div>

        <button type="submit" :disabled="loading">
          <span v-if="loading">Cargando...</span>
          <span v-else>Entrar</span>
        </button>

        <p class="error" v-if="error">{{ error }}</p>
      </form>

      <p class="aux-text">
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
  <AuthFooter />
</template>


<style scoped>
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>