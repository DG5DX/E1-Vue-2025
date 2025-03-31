<template>
  <div class="container">
    <h3>Crear Producto</h3>
    <section class="formulario">
      <q-input
        class="input"
        v-model="producto.code_reference"
        label="Código de Referencia"
      />
      <q-input class="input" v-model="producto.name" label="Nombre" />
      <q-input
        class="input"
        v-model.number="producto.price"
        type="number"
        step="0.01"
        label="Precio"
      />
      <q-select
        class="input"
        v-model="producto.unit_measure_id"
        :options="medidas"
        option-value="id"
        option-label="nombre"
        label="Unidad de Medida"
        use-input
        input-debounce="300"
        @filter="onFilterU"
        :loading="loading"
        clearable
      />
      <q-select
        class="input"
        v-model="producto.standard_code_id"
        :options="typeStandard"
        option-value="id"
        option-label="nombre"
        label="Código de Estándar"
      />

      <q-btn class="post-btn" label="Crear Producto" @click="crearProducto" />
    </section>
  </div>

  <q-table
    flat
    bordered
    :rows="rowsItems"
    :columns="columnsItems"
    row-key="id"
    class="q-mt-md"
  >
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          color="red"
          icon="delete"
          flat
          dense
          @click="eliminarProducto(props.row._id)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const $q = useQuasar();
const medidas = ref([]);
const loading = ref(false);
const m = ref([]);
const producto = ref({});
const rowsItems = ref([]);

const columnsItems = [
  { name: "reference", label: "Codigo de Referencia", field: "code_reference" },
  { name: "name", label: "Producto", field: "name" },
  { name: "price", label: "Precio", field: "price" },
  {
    name: "unit",
    label: "Unidad de Medida",
    field: (row) => {
      const measure = m.value.find((u) => u.id === row.unit_measure_id);
      return measure ? measure.name : "Desconocido";
    },
  },
  {
    name: "standard",
    label: "Codigo Estandar",
    field: (row) => {
      const standard = typeStandard.find((s) => s.id === row.standard_code_id);
      return standard ? standard.nombre : "Desconocido";
    },
  },
  { name: "actions", label: "Acciones", align: "center" },
];

const typeStandard = [
  { id: 1, nombre: "Estándar de adopción del contribuyente" },
  { id: 2, nombre: "UNSPSC" },
  { id: 3, nombre: "Partida Arancelaria" },
  { id: 4, nombre: "GTIN" },
];

const traerMedidas = async () => {
  try {
    const response = await axios.get(
      "https://api-sandbox.factus.com.co/v1/measurement-units",
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
        },
      }
    );

    m.value = response.data.data;
  } catch (error) {
    console.log(error);
  }
};

const onFilterU = async (val, update) => {
  if (val === "") {
    medidas.value = [];
    update();
    return;
  }

  loading.value = true;

  try {
    const response = await axios.get(
      "https://api-sandbox.factus.com.co/v1/measurement-units",
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
        },
        params: {
          name: val,
        },
      }
    );

    medidas.value = response.data.data.map((medidas) => ({
      id: medidas.id,
      nombre: medidas.name,
    }));

    update();
  } catch (error) {
    console.error("Error al obtener las medidas:", error);
  } finally {
    loading.value = false;
  }
};

async function crearProducto() {
  if (
    !producto.value.code_reference ||
    !producto.value.name ||
    !producto.value.price ||
    !producto.value.unit_measure_id ||
    !producto.value.standard_code_id
  ) {
    $q.notify({
      type: "negative",
      message:
        "Por favor, completa todos los campos antes de crear el producto.",
    });
    return;
  }

  try {
    const productoEnviado = {
      ...producto.value,
      unit_measure_id: producto.value.unit_measure_id?.id || null,
      standard_code_id: producto.value.standard_code_id?.id || null,
    };

    const response = await axios.post(
      "http://localhost:5000/factus/producto",
      productoEnviado
    );
    $q.notify({ type: "positive", message: "Producto creado con éxito" });
    producto.value = {};
    traerProductos();
    console.log(response);
  } catch (error) {
    $q.notify({
      type: "negative",
      message: `Error al crear el producto: ${error}`,
    });
  }
}

async function traerProductos() {
  try {
    const response = await axios.get("http://localhost:5000/factus/producto");
    rowsItems.value = response.data.producto;
    console.log(response);
  } catch (error) {
    $q.notify({ type: "negative", message: "Error al cargar los productos" });
  }
}

async function eliminarProducto(id) {
  try {
    await axios.delete(`http://localhost:5000/factus/producto/${id}`);
    $q.notify({ type: "warning", message: "Producto eliminado con éxito" });
    traerProductos();
  } catch (error) {
    $q.notify({ type: "negative", message: "Error al eliminar el producto" });
  }
}

onMounted(() => {
  traerMedidas();
  traerProductos();
});
</script>

<style scoped>
.container {
  margin: 1px;
  padding: 25px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input {
  font-size: 15px;
  margin-bottom: 5px;
  padding: 10px;
  border-radius: 5px;
}
.post-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  font-weight: bold;
  border-radius: 5px;
}
h3 {
  font-weight: bold;
  color: #1976d2;
  text-align: center;
  margin-bottom: 10px;
}
</style>