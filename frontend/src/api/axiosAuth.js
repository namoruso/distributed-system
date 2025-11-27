import axios from 'axios'
import { useAuthStore } from '../store/auth'
import router from '../router'

// crear instancia de axios para Auth
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    
    console.log('Token que se enviará:', token) // Debug
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token agregado a headers') // Debug
    } else {
      console.log('No hay token disponible') // Debug
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.log(' Error en respuesta:', error.response?.status) // Debug
    
    if (error.response?.status === 401) {
      console.log('Token inválido o expirado, haciendo logout...')
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)

export default api