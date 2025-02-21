<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>API</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <q-list>
        <q-item clickable v-ripple @click="goTo('home')" disable>
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Ver Facturas</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="goTo('post')">
          <q-item-section avatar>
            <q-icon name="add_circle" />
          </q-item-section>
          <q-item-section>Añadir Factura</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple @click="confirmarCierreSesion">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <h4>Facturas</h4>

        <q-table 
          flat bordered
          :rows="facturas"
          :columns="columns"
          row-key="id"
          :loading="cargando"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()

const leftDrawerOpen = ref(false)
const facturas = ref([])
const cargando = ref(false)

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: row => row.id },
  { name: 'cliente', label: 'Cliente', align: 'left', field: row => row.cliente },
  { name: 'fecha', label: 'Fecha', align: 'left', field: row => row.fecha },
  { name: 'opciones', label: 'Total', align: 'right', field: row => formatCurrency(row.total) }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goTo(route) {
  router.push(`/${route}`)
}

function confirmarCierreSesion() {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Estás seguro de que deseas cerrar sesión?',
    cancel: true,
    persistent: true,
    ok: { label: 'Cerrar Sesión', color: 'negative' },
    cancel: { label: 'Cancelar', color: 'primary' }
  }).onOk(() => {
    cerrarSesion()
  })
}

function cerrarSesion() {
  localStorage.removeItem('authToken')

  $q.notify({
    type: 'warning',
    message: '¡Cierre de sesión exitoso!',
    position: 'top',
    timeout: 2000,
    icon: 'portrait'
  })

  router.push('/')
}

async function obtenerFacturas() {
  cargando.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await axios.get('/api/facturas', {
      headers: { Authorization: `Bearer ${token}` }
    })
    facturas.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data.message || 'Error al obtener facturas',
      position: 'top',
      timeout: 3000
    })
    console.error(error)
  } finally {
    cargando.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
}

onMounted(() => {
  obtenerFacturas()
})
</script>

<style scoped>
h4 {
  color: aliceblue;
}
</style>
