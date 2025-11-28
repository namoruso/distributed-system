import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUser(user) {
      this.user = user
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    // aqui se verifica si el token existe al inicializar
    initialize() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        console.log('Token inicializado desde localStorage:', token)
      }
    }
  }
})