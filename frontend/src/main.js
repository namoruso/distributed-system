import './styles/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)  // crea instancia

app.use(createPinia())

app.use(router)             // las rutas del sistema

app.mount('#app')           // montar
