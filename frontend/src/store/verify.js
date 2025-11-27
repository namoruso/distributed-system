import { defineStore } from 'pinia'

export const useVerifyStore = defineStore('verify', {
  state: () => ({
    correo: null
  }),
  actions: {
    setCorreo(c) {
      this.correo = c
    },
    clear() {
      this.correo = null
    }
  }
})
