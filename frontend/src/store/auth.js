import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null
  }),

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    logout() {
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
