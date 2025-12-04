<template>
  <Navbar />
  <div class="products-page container">
    <header class="products-header">
      <h1>Productos</h1>

      <div class="controls">
        <input v-model="q" @input="onSearch" placeholder="Buscar por nombre o sku..." />
        <button class="btn primary" @click="openCreate">Crear Producto</button>
      </div>
    </header>

    <section class="products-body">
      <div v-if="loading" class="loading">Cargando productos...</div>
      <div v-else>
        <table v-if="products.length" class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id">
              <td>{{ p.id }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.sku }}</td>
              <td>{{ formatPrice(p.price) }}</td>
              <td>{{ p.stock }}</td>
              <td>{{ p.active ? 'Sí' : 'No' }}</td>
              <td class="actions">
                <button class="btn secondary" @click="openEdit(p)">Editar</button>
                <button class="btn danger" @click="confirmDelete(p)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty">
          Aún no hay productos. Crea el primero con el botón <strong>Crear Producto</strong>.
        </div>
      </div>
    </section>

    <!-- Modal Create / Edit -->
    <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ isEditing ? 'Editar Producto' : 'Crear Producto' }}</h2>

        <form @submit.prevent="submitForm">
          <label>
            Nombre
            <input v-model="form.name" />
            <small v-if="errors.name" class="error">{{ errors.name.join(', ') }}</small>
          </label>

          <label>
            SKU
            <input v-model="form.sku" />
            <small v-if="errors.sku" class="error">{{ errors.sku.join(', ') }}</small>
          </label>

          <label>
            Precio
            <input v-model.number="form.price" type="number" step="0.01" min="0" />
            <small v-if="errors.price" class="error">{{ errors.price.join(', ') }}</small>
          </label>

          <label>
            Stock
            <input v-model.number="form.stock" type="number" min="0" />
            <small v-if="errors.stock" class="error">{{ errors.stock.join(', ') }}</small>
          </label>

          <label class="checkbox">
            <input type="checkbox" v-model="form.active" /> Activo
          </label>

          <div class="modal-actions">
            <button class="btn" type="button" @click="closeModal">Cancelar</button>
            <button class="btn primary" :disabled="submitting" type="submit">
              {{ submitting ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm delete -->
    <div v-if="deleting" class="modal-backdrop" @click.self="deleting = null">
      <div class="modal small">
        <h3>Eliminar producto</h3>
        <p>¿Estás segura de que quieres eliminar <strong>{{ deleting.name }}</strong>?</p>
        <div class="modal-actions">
          <button class="btn" @click="deleting = null">Cancelar</button>
          <button class="btn danger" @click="performDelete" :disabled="deletingLoading">
            {{ deletingLoading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Global message -->
    <div v-if="message" class="global-msg" :class="messageType">{{ message }}</div>
  </div>
</template>

<script setup>
/*
 Products.vue
 - Usa Composition API
 - Se apoya en src/api/axiosProducts.js para llamadas REST
 - Manejo explícito de errores de validación (422) y 401 (token)
*/

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth-store'
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/axiosProducts'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const auth = useAuthStore()

// Estados
const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const modalOpen = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const errors = reactive({})
const message = ref('')
const messageType = ref('') // 'success' | 'error'
const q = ref('') // query/search
const deleting = ref(null)
const deletingLoading = ref(false)
const deletingId = ref(null)
const productsBackup = ref([]) // para búsquedas sencillas

// formulario reactivo
const form = reactive({
  name: '',
  sku: '',
  price: 0,
  stock: 0,
  active: true
})

// formateo de precio
function formatPrice(v) {
  if (v == null) return '-'
  return Number(v).toFixed(2)
}

function setMessage(msg, type = 'success', ms = 3500) {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, ms)
}

// Buscar localmente (simple)
const filtered = computed(() => {
  if (!q.value) return products.value
  const s = q.value.toLowerCase()
  return products.value.filter(p => {
    return (
      (p.name || '').toLowerCase().includes(s) ||
      (p.sku || '').toLowerCase().includes(s)
    )
  })
})

// Cargar productos
async function fetchProducts() {
  loading.value = true
  try {
    const res = await listProducts()
    products.value = res.data.data || []
    productsBackup.value = [...products.value]
  } catch (err) {
    handleApiError(err)
  } finally {
    loading.value = false
  }
}

// Manejo de errores centralizado
function handleApiError(err) {
  // Si la respuesta existe, podemos extraer info
  const resp = err?.response
  if (!resp) {
    setMessage('Error de conexión con el servidor', 'error')
    return
  }

  if (resp.status === 401) {
    // token inválido o expirado: logout y redirect
    auth.logout()
    router.push('/login')
    setMessage('Sesión inválida. Inicia sesión de nuevo.', 'error', 3000)
    return
  }

  if (resp.status === 422) {
    // validación: asignar errores al objeto errors
    const errs = resp.data?.errors || {}
    // limpiar y asignar
    for (const k in errors) delete errors[k]
    Object.assign(errors, errs)
    setMessage('Revisa los campos del formulario', 'error')
    return
  }

  // Otros errores
  const msg = resp.data?.message || `Error ${resp.status}`
  setMessage(msg, 'error')
}

// Abrir modal crear
function openCreate() {
  clearForm()
  isEditing.value = false
  currentId.value = null
  modalOpen.value = true
  for (const k in errors) delete errors[k]
}

// Abrir modal editar y cargar datos
function openEdit(product) {
  isEditing.value = true
  currentId.value = product.id
  form.name = product.name
  form.sku = product.sku
  form.price = Number(product.price)
  form.stock = product.stock
  form.active = !!product.active
  for (const k in errors) delete errors[k]
  modalOpen.value = true
}

// Cerrar modal
function closeModal() {
  modalOpen.value = false
  clearForm()
  for (const k in errors) delete errors[k]
}

// Limpiar form
function clearForm() {
  form.name = ''
  form.sku = ''
  form.price = 0
  form.stock = 0
  form.active = true
  currentId.value = null
  isEditing.value = false
}

// Submit form (create o update)
async function submitForm() {
  submitting.value = true
  // limpiar errores previos
  for (const k in errors) delete errors[k]
  try {
    if (isEditing.value && currentId.value) {
      const res = await updateProduct(currentId.value, { ...form })
      // actualizar en lista local
      const idx = products.value.findIndex(p => p.id === currentId.value)
      if (idx !== -1) products.value[idx] = res.data.data
      setMessage('Producto actualizado correctamente', 'success')
    } else {
      const res = await createProduct({ ...form })
      // agregar al inicio
      products.value.unshift(res.data.data)
      setMessage('Producto creado correctamente', 'success')
    }
    closeModal()
  } catch (err) {
    handleApiError(err)
  } finally {
    submitting.value = false
  }
}

// Confirmar eliminar (abrir modal)
function confirmDelete(product) {
  deleting.value = product
  deletingId.value = product.id
}

// Ejecutar eliminación
async function performDelete() {
  if (!deletingId.value) return
  deletingLoading.value = true
  try {
    await deleteProduct(deletingId.value)
    // filtrar localmente
    products.value = products.value.filter(p => p.id !== deletingId.value)
    setMessage('Producto eliminado', 'success')
    deleting.value = null
  } catch (err) {
    handleApiError(err)
  } finally {
    deletingLoading.value = false
    deletingId.value = null
  }
}

function onSearch() {
  //solo reacciona
}

// carga inicial
onMounted(fetchProducts)
</script>

<style src="../styles/products.css"></style>
