<script setup>
import { ref, computed } from 'vue'
import api from '../api/axiosAuth'
import '../styles/auth.css'
import { useRouter } from 'vue-router'
import { useVerifyStore } from '../store/verify'
import AuthFooter from '../components/AuthFooter.vue'
import logo from '../assets/logo.svg'

const router = useRouter()
const verifyStore = useVerifyStore()

const correo = ref('')
const codigo = ref('')
const msg = ref(null)
const error = ref(null)

// aqui se autocompleta el correo si viene desde registro
if (verifyStore.correo) {
  correo.value = verifyStore.correo
}


// validaciones

const emailValido = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(correo.value.trim())
})

const codigoValido = computed(() => {
  return /^[A-Za-z0-9]{6}$/.test(codigo.value.trim())
})

const puedeEnviar = computed(() => {
  return emailValido.value && codigoValido.value
})

function clearError() {
  error.value = null
  msg.value = null
}


const tiempoRestante = ref(0)  
let intervalo = null

function iniciarContador(segundos = 30) {
  tiempoRestante.value = segundos

  if (intervalo) clearInterval(intervalo)

  intervalo = setInterval(() => {
    tiempoRestante.value--

    if (tiempoRestante.value <= 0) {
      clearInterval(intervalo)
    }
  }, 1000)
}


async function verifyCode() {
  error.value = null
  msg.value = null

  if (!emailValido.value) {
    error.value = "Ingresa un correo válido."
    return
  }

  if (!codigoValido.value) {
    error.value = "El código debe tener 6 caracteres alfanuméricos."
    return
  }

  try {
    await api.post('/verificar', {
      correo: correo.value.trim(),
      codigo: codigo.value.trim().toUpperCase()
    })

    msg.value = "Cuenta verificada. Redirigiendo al inicio de sesión…"
    setTimeout(() => router.push('/login'), 1500)

  } catch (err) {
    error.value = err.response?.data?.detail || "Código inválido"
  }
}


async function resendCode() {
  error.value = null
  msg.value = null

  if (!emailValido.value) {
    error.value = "Ingresa un correo válido antes de reenviar el código."
    return
  }

  try {
    await api.post('/reenviar', { correo: correo.value.trim() })
    msg.value = "Código reenviado a tu correo."

    iniciarContador(30)  

  } catch (err) {
    error.value = err.response?.data?.detail || "No se pudo reenviar el código."
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Verificar Cuenta</h1>

      <form @submit.prevent="verifyCode" class="auth-form">
        <div class="form-group">
          <label>Correo registrado</label>
          <input
            type="email"
            v-model="correo"
            @input="clearError"
            placeholder="tuemail@correo.com"
          />
        </div>

        <div class="form-group">
          <label>Código de verificación</label>
          <input
            type="text"
            v-model="codigo"
            maxlength="6"
            @input="clearError"
            placeholder="Ej: ABC123"
          />
        </div>

        <button type="submit" :disabled="!puedeEnviar">
          Verificar
        </button>

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="msg">{{ msg }}</p>
      </form>

      <button
        class="sec-btn"
        @click="resendCode"
        :disabled="tiempoRestante > 0"
      >
        <span v-if="tiempoRestante === 0">Reenviar código</span>
        <span v-else>Reenviar código ({{ tiempoRestante }}s)</span>
      </button>

      <p class="aux-text">
        ¿Ya está todo listo?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </div>

    
  </div>
  <AuthFooter />
</template>
