import axios from 'axios'
import { useAuthStore } from '../store/auth'
import router from '../router'

// crear instancia de axios para Auth
const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000/api',
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
    
    
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      
    } else {
      console.log('No hay token disponible') 
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
    console.log(' Error en respuesta:', error.response?.status)
    
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