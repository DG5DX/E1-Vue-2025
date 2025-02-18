<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          API
        </q-toolbar-title>

        <div class="q-gutter-sm flex-grow-1"></div>

        <q-btn 
          dense 
          flat 
          label="Cerrar sesión" 
          @click="confirmarCierreSesion" 
          color="negative" 
          class="session-btn" 
          icon="exit_to_app" 
          size="md" 
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function confirmarCierreSesion() {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Estás seguro de que deseas cerrar sesión?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Cerrar Sesión',
      color: 'negative'
    },
    cancel: {
      label: 'Cancelar',
      color: 'primary'
    }
  }).onOk(() => {
    cerrarSesion();
  });
}

function cerrarSesion() {
  localStorage.removeItem('authToken');
  
  $q.notify({
    type: 'warning',
    message: '¡Cierre de sesión exitoso!',
    position: 'top', 
    timeout: 2000, 
    icon: 'portrait', 
  });
  
  router.push('/');
}
</script>

<style scoped>
.session-btn {
  font-weight: bold;
  background-color: #E53935FF;
  color: rgb(189, 78, 78);
  border-radius: 8px;
  padding: 10px 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.session-btn:hover {
  background-color: #E79A9AFF;
  transform: scale(1.05);
}

.q-toolbar .q-gutter-sm {
  margin-left: auto;
}
</style>
