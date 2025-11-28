
import axios from 'axios'
import { useAuthStore } from '../store/auth'

const productsApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTS_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// interceptor para agregar token desde Pinia
productsApi.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

productsApi.interceptors.response.use(
  res => res,
  err => {
    return Promise.reject(err)
  }
)

// funciones utiles para usar luego
export async function listProducts(params = {}) {
  return productsApi.get('/products', { params })
}

export async function getProduct(id) {
  return productsApi.get(`/products/${id}`)
}

export async function createProduct(payload) {
  return productsApi.post('/products', payload)
}

export async function updateProduct(id, payload) {
  return productsApi.put(`/products/${id}`, payload)
}

export async function deleteProduct(id) {
  return productsApi.delete(`/products/${id}`)
}

export default productsApi
