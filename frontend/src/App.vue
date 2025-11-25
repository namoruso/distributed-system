<template>
  <div>
    <Navbar v-if="auth.token" />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './store/auth'

const auth = useAuthStore()
</script>
