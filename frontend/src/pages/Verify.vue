<script setup>
import { ref } from 'vue'
import api from '../api/axiosAuth'
import '../styles/auth.css'

const correo = ref('')
const codigo = ref('')
const msg = ref(null)
const error = ref(null)

async function verifyCode() {
  msg.value = null
  error.value = null

  try {
    await api.post('/verificar', {
      correo: correo.value,
      codigo: codigo.value
    })

    msg.value = "Cuenta verificada. Ya puedes iniciar sesión."

  } catch (err) {
    error.value = err.response?.data?.detail || "Código inválido"
  }
}

async function resendCode() {
  msg.value = null
  error.value = null

  try {
    await api.post('/reenviar', { correo: correo.value })
    msg.value = "Código reenviado a tu correo."

  } catch (err) {
    error.value = err.response?.data?.detail || "No se pudo reenviar el código."
  }
}
</script>

<template>
  <div class="auth-container">

    <h1>Verificar Cuenta</h1>

    <form @submit.prevent="verifyCode" class="auth-form">

      <!-- Correo para la verificacion -->
      <div class="form-group">
        <label>Correo registrado</label>
        <input type="email" v-model="correo" placeholder="tuemail@correo.com" />
      </div>

      <!-- campo para el codigo a verificar -->
      <div class="form-group">
        <label>Código de verificación</label>
        <input type="text" v-model="codigo" placeholder="Ej: 483920" />
      </div>

      <button type="submit">Verificar</button>

      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-if="msg">{{ msg }}</p>

    </form>

    <button @click="resendCode" class="sec-btn">Reenviar código</button>

    <p class="aux-text">
      ¿Ya está todo listo?
      <router-link to="/login">Inicia sesión</router-link>
    </p>
  </div>
</template>
