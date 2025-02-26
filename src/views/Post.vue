<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> API </q-toolbar-title>

        <div class="q-gutter-sm flex-grow-1"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <q-list>
        <!-- Usuario -->
        <q-item>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{"Usuario" }}</q-item-label>
            <q-item-label caption>Sesión activa</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item clickable v-ripple @click="goTo('home')">
          <q-item-section avatar>
            <q-icon name="receipt" />
          </q-item-section>
          <q-item-section>Ver Facturas</q-item-section>
        </q-item>

        <q-item clickable v-ripple disable>
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
        <h4>Añadir Factura</h4>

        <q-btn
          label="Crear Factura"
          color="primary"
          icon="add"
          class="q-mt-md"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
  
  <script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const router = useRouter();
const $q = useQuasar();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function goTo(route) {
  router.push(`/${route}`);
}

function confirmarCierreSesion() {
  $q.dialog({
    title: "Confirmación",
    message: "¿Estás seguro de que deseas cerrar sesión?",
    cancel: true,
    persistent: true,
    ok: { label: "Cerrar Sesión", color: "negative" },
    cancel: { label: "Cancelar", color: "primary" },
  }).onOk(() => {
    cerrarSesion();
  });
}

function cerrarSesion() {
  localStorage.removeItem("authToken");

  $q.notify({
    type: "warning",
    message: "¡Cierre de sesión exitoso!",
    position: "top",
    timeout: 2000,
    icon: "portrait",
  });

  router.push("/");
}
</script>
  
  <style scoped>
h4 {
  color: aliceblue;
  display: flex;
  justify-content: center;
}

.q-toolbar .q-gutter-sm {
  margin-left: auto;
}
</style>