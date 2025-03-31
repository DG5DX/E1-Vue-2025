<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
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
  {
    name: "id",
    label: "ID",
    align: "left",
    field: (row) => row.id,
    sortable: true,
  },
  {
    name: "cliente",
    label: "Cliente",
    align: "left",
    field: (row) => row.names || "N/A",
    sortable: true,
  },
  {
    name: "correo",
    label: "Correo",
    align: "left",
    field: (row) => row.email || "N/A",
    sortable: true,
  },
  {
    name: "numero",
    label: "N° Factura",
    align: "left",
    field: (row) => row.reference_code || "N/A",
    sortable: true,
  },
  {
    name: "estado",
    label: "Estado",
    align: "left",
    field: (row) => row.status || "N/A",
    sortable: true,
  },
  {
    name: "forma_pago",
    label: "Forma de Pago",
    align: "left",
    field: (row) => row.payment_form?.name || "N/A",
    sortable: true,
  },
  { name: "accion", label: "Acción", align: "center" },
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
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
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
    const byteNumbers = new Uint8Array(
      [...byteCharacters].map((char) => char.charCodeAt(0))
    );
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file_name}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
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
    const byteNumbers = new Uint8Array(
      [...byteCharacters].map((char) => char.charCodeAt(0))
    );
    const blob = new Blob([byteNumbers], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    pdfUrl.value = url;
    showDialog.value = true;
  } catch (err) {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      showTokenExpiredDialog.value = true;
    } else {
      console.error("Error al visualizar la factura:", err);
    }
  }
};

const cerrarSesion = () => {
  store.token = null;
  router.push("/");
};

onMounted(cargarFacturas);
</script>

<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
      Lista de Facturas
    </h1>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="shadow-md rounded-md bg-white"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 1 ? 'green' : 'red'"
            align="top"
            :label="props.row.status === 1 ? 'Activo' : 'Inactivo'"
            class="text-white"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-accion="props">
        <q-td :props="props">
          <q-btn
            label="visualizar"
            color="secondary"
            icon="visibility"
            @click="visualizarFactura(props.row.number)"
            dense
            unelevated
          />
          <q-btn
            label="descargar"
            color="primary"
            icon="download"
            @click="descargarFactura(props.row.number)"
            dense
            unelevated
          />
        </q-td>
      </template>
    </q-table>

    <q-inner-loading :showing="loading" color="primary" />

    <!-- Alerta de token expirado -->
    <q-dialog v-model="showTokenExpiredDialog" persistent>
      <q-card style="max-width: 400px">
        <q-card-section>
          <div class="text-h6">Sesión Expirada</div>
          <p>
            Su sesión ha expirado. Por favor, vuelva a iniciar sesión para
            continuar.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cerrar Sesión" color="negative" @click="cerrarSesion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialog" persistent>
      <q-card class="bg-white" style="width: 80vw; max-height: 80vh">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" @click="showDialog = false">
            <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <iframe
            :src="pdfUrl"
            style="width: 100%; height: 75vh"
            frameborder="0"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
h1 {
  font-weight: bold;
  font-family: "Roboto", sans-serif;
  color: whitesmoke;
  text-align: center;
  margin-bottom: 20px;
}

.detalle-factura {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.detalle-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.titulo-detalle {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 15px;
  text-align: center;
}

.input-width {
  flex: 1 1 48%;
}

.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
}

.q-card {
  background-color: #f9f9f9;
  border-radius: 8px;
}

.q-table {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.q-table th {
  background-color: #1976d2;
  color: white;
}

.q-table td {
  background-color: #fff;
}

.q-badge {
  font-weight: bold;
}
</style>
