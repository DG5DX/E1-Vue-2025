<template>
	<div class="container">
		<h2>Productos</h2>
	  <q-btn color="primary" label="Crear Producto" @click="mostrarModal = true" />
  
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
			  @click="confirmarEliminarProducto(props.row._id)"
			/>
		  </q-td>
		</template>
	  </q-table>
	</div>
  
	<!-- MODAL PARA CREAR PRODUCTO -->
	<q-dialog v-model="mostrarModal" persistent>
	  <q-card class="q-card-modal">
		<q-card-section class="row items-center">
		  <h3 class="q-ma-none">Crear Producto</h3>
		  <q-space />
		  <q-btn icon="close" flat round dense v-close-popup />
		</q-card-section>
  
		<q-card-section>
		  <section class="formulario">
			<q-input class="input" v-model="producto.code_reference" label="Código de Referencia" />
			<q-input class="input" v-model="producto.name" label="Nombre" />
			<q-input class="input" v-model.number="producto.price" type="number" step="0.01" label="Precio" :formatter="formatPrice" />
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
		</q-card-section>
	  </q-card>
	</q-dialog>
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
  const mostrarModal = ref(false); // Controla la visibilidad del modal
  
  const columnsItems = [
	{ name: "reference", label: "Codigo de Referencia", field: "code_reference" },
	{ name: "name", label: "Producto", field: "name" },
	{ name: "price", label: "Precio", field: (row) => formatPrice(row.price) },
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
  
  const formatPrice = (value) => {
	if (!value) return "";
	return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };
  
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
		  params: { name: val },
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
		message: "Por favor, completa todos los campos antes de crear el producto.",
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
	  mostrarModal.value = false; // Cierra el modal después de crear el producto
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
	} catch (error) {
	  $q.notify({ type: "negative", message: "Error al cargar los productos" });
	}
  }
  
  const confirmarEliminarProducto = (id) => {
	$q.dialog({
		title: "Confirmar Eliminación",
		message: "¿Estás seguro de que quieres eliminar este producto?",
		cancel: true,
		persistent: true,
	}).onOk(() => {
		eliminarProducto(id);
	});
};

const eliminarProducto = async (id) => {
	try {
		await axios.delete(`http://localhost:5000/factus/producto/${id}`);
		$q.notify({ type: "positive", message: "Producto eliminado con éxito" });
		traerProductos();
	} catch (error) {
		$q.notify({ type: "negative", message: "Error al eliminar el producto" });
	}
};
  
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
	text-align: center;
	margin-top: 20vh;
  }
  
  .formulario {
	display: flex;
	flex-direction: column;
	gap: 10px;
  }
  
  .input {
	font-size: 15px;
	padding: 10px;
	border-radius: 5px;
  }
  
  .post-btn {
	margin-top: 20px;
	padding: 12px 20px;
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
  
  h2 {
	font-weight: bold;
	color: #12508e;
	text-align: center;
	margin: 20px;
  }

  .q-card-modal {
	min-width: 400px;
	border-radius: 10px;
  }
  
  .q-card-section {
	padding: 20px;
  }
  
  .q-btn {
	font-size: 14px;
	border-radius: 5px;
  }
  
  .q-btn.post-btn {
	background-color: #1976d2;
	color: white;
	font-weight: bold;
	padding: 12px 20px;
  }
  
  .q-btn.post-btn:hover {
	background-color: #1565c0;
  }
  </style>
  