<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>API</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered :breakpoint="500">
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ username || "Usuario" }}</q-item-label>
            <q-item-label caption>Sesión activa</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
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
          flat
          bordered
          :rows="facturas"
          :columns="columns"
          row-key="number"
          :loading="cargando"
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn color="primary" dense round icon="visibility" @click="verFactura(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-page>
    </q-page-container>

    <q-dialog v-model="facturaDialog" persistent full-width full-height>
  <q-card class="detalle-factura">
    <q-bar class="bg-primary text-white">
      <q-space />
      <q-btn dense flat icon="close" @click="facturaDialog = false">
        <q-tooltip class="bg-red">Cerrar</q-tooltip>
      </q-btn>
    </q-bar>

    <q-card-section class="q-pa-md">
      <div class="titulo-detalle">Detalles de la Factura</div>
      <q-form class="detalle-form">
        <q-input outlined v-model="facturaSeleccionada.number" label="Número de Factura" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.api_client_name" label="Cliente" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.reference_code" label="Código de Referencia" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.identification" label="Identificación" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.names" label="Nombre" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.email" label="Correo Electrónico" readonly style="flex: 1 1 48%;" />
        <q-input outlined v-model="facturaSeleccionada.total" label="Total" readonly style="flex: 1 1 48%;" />
      </q-form>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-md">
      <q-table
        title="Productos"
        :rows="facturaSeleccionada.productos || []"
        :columns="columnsProductos"
        row-key="id"
        bordered
        class="tabla-detalle"
      />
    </q-card-section>
  </q-card>
</q-dialog>

  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";

const router = useRouter();
const $q = useQuasar();
const leftDrawerOpen = ref(false);
const facturas = ref([]);
const cargando = ref(false);
const username = ref(localStorage.getItem("username") || "");
const facturaDialog = ref(false);
const facturaSeleccionada = ref({});

const columns = ref([
  { name: "number", align: "center", label: "Número", field: "number", sortable: true },
  { name: "api_client_name", align: "center", label: "Cliente", field: "api_client_name", sortable: true },
  { name: "reference_code", align: "center", label: "Código de Referencia", field: "reference_code", sortable: true },
  { name: "identification", align: "center", label: "Identificación", field: "identification", sortable: true },
  { name: "names", align: "center", label: "Nombre", field: "names", sortable: true },
  { name: "email", align: "center", label: "Correo Electrónico", field: "email", sortable: true },
  { name: "total", align: "center", label: "Total", field: "total", sortable: true },
  { name: "acciones", align: "center", label: "Acciones", field: "acciones" }
]);

const columnsProductos = ref([
  { name: "id", label: "ID", field: "id", align: "left" },
  { name: "name", label: "Producto", field: "name", align: "left" },
  { name: "price", label: "Precio", field: "price", align: "right" },
  { name: "quantity", label: "Cantidad", field: "quantity", align: "right" },
]);

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
  localStorage.removeItem("username");
  $q.notify({
    type: "warning",
    message: "¡Cierre de sesión exitoso!",
    position: "top",
    timeout: 2000,
    icon: "portrait",
  });
  router.push("/");
}

async function obtenerFacturas() {
  cargando.value = true;
  const store = JSON.parse(localStorage.getItem("tienda"));
  const token = store?.token || "";
  try {
    const response = await axios.get("https://api-sandbox.factus.com.co/v1/bills", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data) {
      facturas.value = response.data.data.data;
    }
  } catch (error) {
    $q.notify({ type: "negative", message: "Error al obtener facturas", position: "top", timeout: 3000 });
    console.error(error);
  } finally {
    cargando.value = false;
  }
}

function verFactura(factura) {
  facturaSeleccionada.value = factura;
  facturaDialog.value = true;
}

onMounted(() => {
  obtenerFacturas();
});
</script>

<style scoped>
h4 {
  display: flex;
  justify-content: center;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  color: aliceblue;
}
.detalle-factura {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.detalle-form {
  display: grid;
  gap: 10px;
}

.titulo-detalle {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  margin-bottom: 10px;
}

.detalle-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

</style>
