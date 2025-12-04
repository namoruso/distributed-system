<template>
  <Navbar />
  <div class="inventory-container">
    <h1 class="title">Inventario</h1>

    
    <div class="top-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar producto..."
        class="search-input"
      />

      <button @click="openCreateModal" class="btn create-btn">
        + Agregar Producto
      </button>
    </div>

    
    <div class="table-wrapper">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Stock</th>
            <th>Mín.</th>
            <th>Máx.</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in filteredInventory"
            :key="item.id"
            :class="stockClass(item)"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.stock }}</td>
            <td>{{ item.minimun }}</td>
            <td>{{ item.maximun }}</td>
            <td>
              <span class="status" :class="{ active: item.status }">
                {{ item.status ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="actions">
              <button class="btn small edit" @click="openEditModal(item)">
                Editar
              </button>

              <button class="btn small increase" @click="openStockModal(item, 'increase')">
                + Stock
              </button>

              <button class="btn small decrease" @click="openStockModal(item, 'decrease')">
                - Stock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- modal de crear / editar -->
    <div v-if="showFormModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h2>

        <div class="modal-body">
          <input v-model="form.name" type="text" placeholder="Nombre del producto" />

          <input v-model.number="form.minimun" type="number" placeholder="Stock mínimo" />

          <input v-model.number="form.maximun" type="number" placeholder="Stock máximo" />

          <input v-model.number="form.stock" type="number" placeholder="Stock actual" />
        </div>

        <div class="modal-footer">
          <button class="btn cancel" @click="closeModal">Cancelar</button>
          <button class="btn save" @click="saveItem">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal de aumentar / disminuir Stock -->
    <div v-if="showStockModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ stockMode === 'increase' ? 'Aumentar' : 'Disminuir' }} Stock</h2>

        <div class="modal-body">
          <input v-model.number="stockUpdate" type="number" placeholder="Cantidad" />
        </div>

        <div class="modal-footer">
          <button class="btn cancel" @click="closeModal">Cancelar</button>
          <button class="btn save" @click="applyStockChange">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  updateStock
} from '../api/axiosInventory.js'
import Navbar from '../components/Navbar.vue'


const inventory = ref([])
const search = ref('')

const showFormModal = ref(false)
const showStockModal = ref(false)
const isEditing = ref(false)
const stockMode = ref(null)
const stockUpdate = ref(0)

const currentItem = ref(null)

const form = ref({
  name: '',
  minimun: 0,
  maximun: 0,
  stock: 0,
})

// cargar inventario
async function loadInventory() {
  try {
    const res = await listInventory()
    inventory.value = res.data
  } catch (err) {
    console.error('Error cargando inventario:', err)
  }
}

onMounted(() => {
  loadInventory()
})

// filtrar buscador
const filteredInventory = computed(() => {
  return inventory.value.filter((item) =>
    item.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

// clase visual del stock
function stockClass(item) {
  if (item.stock <= item.minimun) return 'critical'
  if (item.stock < item.minimun + 5) return 'warning'
  return 'normal'
}

// abrir modal crear
function openCreateModal() {
  isEditing.value = false
  form.value = {
    name: '',
    minimun: 0,
    maximun: 0,
    stock: 0
  }
  showFormModal.value = true
}

// abrir modal editar
function openEditModal(item) {
  isEditing.value = true
  currentItem.value = item
  form.value = { ...item }
  showFormModal.value = true
}


async function saveItem() {
  try {
    if (isEditing.value) {
      await updateInventoryItem(currentItem.value.id, form.value)
    } else {
      await createInventoryItem(form.value)
    }
    closeModal()
    loadInventory()
  } catch (err) {
    console.error('Error guardando item:', err)
  }
}


function openStockModal(item, mode) {
  currentItem.value = item
  stockMode.value = mode
  stockUpdate.value = 0
  showStockModal.value = true
}


async function applyStockChange() {
  try {
    await updateStock(currentItem.value.id, stockMode.value, { update: stockUpdate.value })
    closeModal()
    loadInventory()
  } catch (err) {
    console.error('Error actualizando stock:', err)
  }
}


function closeModal() {
  showFormModal.value = false
  showStockModal.value = false
}
</script>


<style src="../styles/inventory.css"></style>
