import axios from 'axios'
import { useAuthStore } from '../store/auth'

const inventoryApi = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// interceptor
inventoryApi.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

inventoryApi.interceptors.response.use(
  res => res,
  err => {
    return Promise.reject(err)
  }
)

export async function listInventory(params = {}) {
  return inventoryApi.get('/inventory/all', { params })
}

export async function getInventoryItem(id) {
  return inventoryApi.get(`/inventory/${id}`)
}

export async function createInventoryItem(payload) {
  return inventoryApi.post('/inventory/add', payload)
}

export async function updateInventoryItem(id, payload) {
  return inventoryApi.put(`/inventory/update/${id}`, payload)
}

export async function updateStock(id, mode, payload) {
  return inventoryApi.put(`/inventory/update/${id}/${mode}`, payload)
}

export default inventoryApi
