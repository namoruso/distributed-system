<script setup>
import { ref, computed } from 'vue'
import api from '../api/axiosAuth'
import '../styles/auth.css'
import { useRouter } from 'vue-router'
import { useVerifyStore } from '../store/verify'
const verifyStore = useVerifyStore()
import AuthFooter from '../components/AuthFooter.vue'


const router = useRouter()

const nombre = ref('')
const correo = ref('')
const clave = ref('')
const clave2 = ref('')

const msg = ref(null)
const error = ref(null)

// validaciones

// nombre: solo letras y espacios
const nombreValido = computed(() => {
  if (!nombre.value.trim()) return false
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(nombre.value.trim()) &&
         nombre.value.trim().length >= 3
})

// correo
const correoValido = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(correo.value.trim())
})

// contraseña fuerte
const claveValida = computed(() => {
  const c = clave.value
  return (
    c.length >= 8 &&
    /[A-Z]/.test(c) &&      // Mayúscula
    /[a-z]/.test(c) &&      // Minúscula
    /[0-9]/.test(c) &&      // Número
    /[!@#$%^&*()_\-\=\+\[\]{};:'",.<>\/?\\|`~]/.test(c) // símbolo
  )
})

// confirmar contraseña
const clavesCoinciden = computed(() => {
  return clave.value && clave.value === clave2.value
})

// botón se habilita si todo es válido
const formularioValido = computed(() => {
  return nombreValido.value &&
         correoValido.value &&
         claveValida.value &&
         clavesCoinciden.value
})

function clearMessages() {
  msg.value = null
  error.value = null
}


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

    // aqui se guarda el correo para autocompletar
    verifyStore.setCorreo(correo.value)

    msg.value = "Registro exitoso. Redirigiendo a verificación…"
    setTimeout(() => router.push('/verify'), 1500)

  } catch (err) {
    error.value = err.response?.data?.detail || 'Error en el registro'
  }
}

</script>

<template>
  <div class="auth-page">
    <div class="auth-container">

      <h1>Registro</h1>

      <form @submit.prevent="register" class="auth-form">
        <!-- Nombre -->
        <div class="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            v-model="nombre"
            @input="clearMessages"
            placeholder="Tu nombre"
          />
          <p class="error" v-if="nombre && !nombreValido">
            El nombre solo puede tener letras y debe tener al menos 3 caracteres.
          </p>
        </div>

        <!-- Correo -->
        <div class="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            v-model="correo"
            @input="clearMessages"
            placeholder="tuemail@correo.com"
          />
          <p class="error" v-if="correo && !correoValido">
            Ingresa un correo válido.
          </p>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            v-model="clave"
            @input="clearMessages"
            placeholder="••••••••"
          />
          <p class="error" v-if="clave && !claveValida">
            La contraseña debe tener:
            <br>• 8 caracteres mínimo
            <br>• 1 mayúscula
            <br>• 1 minúscula
            <br>• 1 número
            <br>• 1 símbolo
          </p>
        </div>

        <!-- Repetir contraseña -->
        <div class="form-group">
          <label>Verificar contraseña</label>
          <input
            type="password"
            v-model="clave2"
            @input="clearMessages"
            placeholder="••••••••"
          />
          <p class="error" v-if="clave2 && !clavesCoinciden">
            Las contraseñas no coinciden.
          </p>
        </div>

        <button type="submit" :disabled="!formularioValido">
          Registrarse
        </button>

        <p class="error" v-if="error">{{ error }}</p>
        <p class="success" v-if="msg">{{ msg }}</p>

      </form>

      <p class="aux-text">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>

    </div>
  </div>
  <AuthFooter />

</template>

