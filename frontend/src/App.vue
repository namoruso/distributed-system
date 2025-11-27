<template>
  <div>
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth'

const auth = useAuthStore()
</script>
