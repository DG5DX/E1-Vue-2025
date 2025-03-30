<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const router = useRouter();
const loading = ref(false);
const error = ref(null);
const rows = ref([]);
const showDialog = ref(false);
const pdfUrl = ref(null);
const showTokenExpiredDialog = ref(false);

const columns = [
  { name: "id", label: "ID", align: "left", field: (row) => row.id, sortable: true },
  { name: "cliente", label: "Cliente", align: "left", field: (row) => row.names || "N/A", sortable: true },
  { name: "correo", label: "Correo", align: "left", field: (row) => row.email || "N/A", sortable: true },
  { name: "numero", label: "N° Factura", align: "left", field: (row) => row.reference_code || "N/A", sortable: true },
  { name: "estado", label: "Estado", align: "left", field: (row) => row.status || "N/A", sortable: true },
  { name: "forma_pago", label: "Forma de Pago", align: "left", field: (row) => row.payment_form?.name || "N/A", sortable: true },
  { name: "accion", label: "Acción", align: "center" }
];

const cargarFacturas = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(
      "https://api-sandbox.factus.com.co/v1/bills",
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
        },
      }
    );
    rows.value = response.data.data.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      showTokenExpiredDialog.value = true;
    } else {
      error.value = "Error al cargar las facturas";
      console.error(err);
    }
  } finally {
    loading.value = false;
  }
};

const descargarFactura = async (facturaId) => {
  try {
    const response = await axios.get(
      `https://api-sandbox.factus.com.co/v1/bills/download-pdf/${facturaId}`,
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
        },
      }
    );
    const { file_name, pdf_base_64_encoded } = response.data.data;
    const byteCharacters = atob(pdf_base_64_encoded);
    const byteNumbers = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file_name}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      showTokenExpiredDialog.value = true;
    } else {
      console.error("Error al descargar la factura:", err);
    }
  }
};

const visualizarFactura = async (facturaId) => {
  try {
    const response = await axios.get(
      `https://api-sandbox.factus.com.co/v1/bills/download-pdf/${facturaId}`,
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
        },
      }
    );
    const { pdf_base_64_encoded } = response.data.data;
    const byteCharacters = atob(pdf_base_64_encoded);
    const byteNumbers = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    pdfUrl.value = url;
    showDialog.value = true;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      showTokenExpiredDialog.value = true;
    } else {
      console.error("Error al visualizar la factura:", err);
    }
  }
};

const cerrarSesion = () => {
  store.token = null;
  router.push('/'); // Redirigir al login después de cerrar sesión
};

onMounted(cargarFacturas);
</script>

<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
      Lista de Facturas
    </h1>

    <q-table :rows="rows" :columns="columns" row-key="id" flat bordered class="shadow-md rounded-md bg-white">
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 1 ? 'green' : 'red'" align="top"
            :label="props.row.status === 1 ? 'Activo' : 'Inactivo'" class="text-white" />
        </q-td>
      </template>

      <template v-slot:body-cell-accion="props">
        <q-td :props="props" class="flex gap-2">
          <q-btn label="Descargar" color="primary" icon="download" @click="descargarFactura(props.row.number)" dense unelevated />
          <q-btn label="Visualizar" color="secondary" icon="visibility" @click="visualizarFactura(props.row.number)" dense unelevated />
        </q-td>
      </template>
    </q-table>

    <q-inner-loading :showing="loading" color="primary" />

    <!-- Alerta de token expirado -->
    <q-dialog v-model="showTokenExpiredDialog" persistent>
      <q-card style="max-width: 400px;">
        <q-card-section>
          <div class="text-h6">Sesión Expirada</div>
          <p>Su sesión ha expirado. Por favor, vuelva a iniciar sesión para continuar.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cerrar Sesión" color="negative" @click="cerrarSesion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para visualizar factura -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 90vw; height: 90vh;">
        <iframe :src="pdfUrl" style="width: 100%; height: 100%; border: none;" />
        <q-btn label="Cerrar" @click="showDialog = false" color="negative" class="full-width" />
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.q-btn {
  transition: background-color 0.2s ease;
}

.q-btn:hover {
  filter: brightness(90%);
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.full-width {
  margin-top: 10px;
}
</style>
