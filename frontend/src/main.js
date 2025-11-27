import './styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)  // crea instancia

app.use(createPinia())

app.use(router)             // las rutas del sistema

// inicializa el store de auth después de crear la app
import { useAuthStore } from './store/auth'
const authStore = useAuthStore()
authStore.initialize() // aqui se carga el token desde localStorage

app.mount('#app')           // montar
