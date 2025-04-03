<template>
	<div class="container">
		<div class="table">
			<h2>Clientes</h2>
	  <q-btn
		class="toggle-btn"
		label="Crear Cliente"
		color="primary"
		@click="toggleForm"
	  />
  
	  <q-table :rows="rows" :columns="columns" row-key="_id">
		<template v-slot:body-cell-acciones="{ row }">
		  <q-td class="flex justify-center">
			<q-btn
			  color="negative"
			  icon="delete"
			  dense
			  @click="confirmarEliminarCliente(row._id)"
			/>
		  </q-td>
		</template>
	  </q-table>
		</div>
	  <!-- Formulario -->
	  <q-dialog v-model="showForm" persistent>
		<q-card style="min-width: 600px;">
  
		  <q-card-section class="titulo">
			<h3>Crear Cliente</h3>
			<q-btn icon="close" flat round dense v-close-popup />
		  </q-card-section>
  
		  <q-card-section class="formulario">
			<q-select
			  v-model="cliente.identification_document_id"
			  :options="typeDocuments"
			  option-value="id"
			  option-label="nombre"
			  label="Tipo de Identificación"
			  :rules="[val => !!val || 'Este campo es obligatorio']"
			/>
  
			<q-input
			  v-model="cliente.identification"
			  label="Num. de Identificación"
			  :rules="[
				val => !!val || 'El número de identificación es obligatorio',
				val => val?.length <= 10 || 'La identificación no puede pasar los 10 dígitos'
			  ]"
			/>
  
			<q-input
			  v-if="mostrarDV"
			  v-model="cliente.dv"
			  type="number"
			  label="Dígito de verificación"
			  :rules="[
				val => val?.length === 1 || 'El dígito de verificación debe tener 1 carácter'
			  ]"
			/>
  
			<q-select
			  v-model="cliente.legal_organization_id"
			  :options="typeOrganizations"
			  option-value="id"
			  option-label="nombre"
			  label="Tipo de Organización"
			  :rules="[val => !!val || 'Este campo es obligatorio']"
			/>
  
			<q-input
			  v-model="cliente.company"
			  label="Razón Social"
			  :rules="[val => !!val || 'Este campo es obligatorio']"
			/>
			<q-input
			  v-model="cliente.trade_name"
			  label="Nombre Comercial"
			  :rules="[val => val?.length >= 3 || 'El nombre comercial debe tener al menos 3 caracteres']"
			/>
  
			<q-input
			  v-if="esPersonaNatural"
			  v-model="cliente.names"
			  label="Nombre"
			  :rules="[val => val?.length >= 3 || 'El nombre debe tener al menos 3 caracteres']"
			/>
  
			<q-input
			  v-model="cliente.address"
			  label="Dirección"
			  :rules="[val => !!val || 'Este campo es obligatorio']"
			/>
  
			<q-input
			  v-model="cliente.email"
			  label="Correo Electrónico"
			  :rules="[val => !!val || 'El correo electrónico es obligatorio', val => /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/.test(val) || 'Correo electrónico no válido']"
			/>
  
			<q-input
			  v-model="cliente.phone"
			  label="Número de Teléfono"
			  :rules="[val => !!val || 'El número de teléfono es obligatorio', val => val?.length <= 10 || 'El teléfono no puede pasar los 10 dígitos']"
			/>
  
			<q-select
			  v-model="cliente.tribute_id"
			  :options="typeTributes"
			  option-value="id"
			  option-label="nombre"
			  label="Tributo"
			/>
  
			<q-select
			  v-model="cliente.municipality_id"
			  :options="municipios"
			  option-value="id"
			  option-label="name"
			  label="Municipio"
			  use-input
			  input-debounce="300"
			  @filter="onFilter"
			  :loading="loading"
			  clearable
			  :rules="[val => !!val || 'El municipio es obligatorio']"
			/>
		  </q-card-section>
  
		  <q-card-actions class="pos">
			<q-btn class="post-btn full-width" flat label="Crear Cliente" @click="validarYCrearCliente" />
		  </q-card-actions>
		</q-card>
	  </q-dialog>
	</div>
  </template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const router = useRouter();
const $q = useQuasar();

const showForm = ref(false); 
const municipios = ref([]);
const municipiosALL = ref([]);
const loading = ref(false);

const rows = ref([]);
const columns = [
{
  name: "identification_document_id",
  label: "Tipo de Documento",
  field: (row) =>
    typeDocuments.find((d) => d.id == row.identification_document_id)?.nombre,
  align: "center",
},

	{
		name: "identification",
		label: "Documento",
		field: "identification",
		align: "center",
	},
	{ name: "names", label: "Nombre", field: "names", align: "center" },
	{ name: "email", label: "Correo", field: "email", align: "center" },
	{ name: "phone", label: "Telefono", field: "phone", align: "center" },
	{
		name: "municipality_id",
		label: "Municipio",
		field: (row) =>
			municipiosALL.value.find((m) => m.id == row.municipality_id)?.name,
		align: "center",
	},
	{
		name: "acciones",
		label: "Acciones",
		field: "acciones",
		align: "center",
	},
];

const cliente = ref({});
const typeDocuments = [
	{ id: 1, nombre: "Registro Civil" },
	{ id: 2, nombre: "Tarjeta de Identidad" },
	{ id: 3, nombre: "Cédula de Ciudadanía" },
	{ id: 4, nombre: "Tarjeta de Extranjería" },
	{ id: 5, nombre: "Cédula de Extranjería" },
	{ id: 6, nombre: "NIT" },
	{ id: 7, nombre: "Pasaporte" },
	{ id: 8, nombre: "Documento de Identificación Extranjero" },
	{ id: 9, nombre: "PEP" },
	{ id: 10, nombre: "NIT otro país" },
	{ id: 11, nombre: "NUIP" },
];
const typeOrganizations = [
	{ id: 1, nombre: "Persona Jurídica" },
	{ id: 2, nombre: "Persona Natural" },
];
const typeTributes = [
	{ id: 18, nombre: "IVA" },
	{ id: 21, nombre: "No aplica" },
];

const mostrarDV = computed(
	() => cliente.value.identification_document_id?.id === 6
);
const esPersonaNatural = computed(
	() => cliente.value.legal_organization_id?.id === 2
);

const traerMunicipios = async () => {
	try {
		const response = await axios.get(
			"https://api-sandbox.factus.com.co/v1/municipalities",
			{
				headers: {
					Authorization: `Bearer ${store.token}`,
					Accept: "application/json",
				},
			}
		);
		municipiosALL.value = response.data.data;
	} catch (error) {}
};

const onFilter = async (val, update) => {
	if (val === "") {
		municipios.value = [];
		update();
		return;
	}

	loading.value = true;
	try {
		const response = await axios.get(
			"https://api-sandbox.factus.com.co/v1/municipalities",
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
		municipios.value = response.data.data.map((municipio) => ({
			id: municipio.id,
			name: `${municipio.name}, ${municipio.department}`,
		}));
		update();
	} catch (error) {
		console.error("Error al obtener los municipios:", error);
	} finally {
		loading.value = false;
	}
};

const toggleForm = () => {
	showForm.value = !showForm.value;
};

const validarCampos = () => {
	if (
		!cliente.value.identification_document_id ||
		!cliente.value.identification
	) {
		$q.notify({
			type: "negative",
			message: "Tipo de identificación requerido",
		});
		return false;
	}
	if (
		!cliente.value.identification ||
		cliente.value.identification.length > 10
	) {
		$q.notify({
			type: "negative",
			message:
				"El número de identificación es requerido y no debe superar los 10 dígitos",
		});
		return false;
	}
	if (
		esPersonaNatural.value &&
		(!cliente.value.names || cliente.value.names.length < 3)
	) {
		$q.notify({
			type: "negative",
			message:
				"El nombre es requerido para persona natural y debe tener al menos 3 caracteres",
		});
		return false;
	}
	if (cliente.value.trade_name && cliente.value.trade_name.length < 3) {
		$q.notify({
			type: "negative",
			message: "El nombre comercial debe tener al menos 3 caracteres",
		});
		return false;
	}
	if (
		!cliente.value.email ||
		!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/.test(cliente.value.email)
	) {
		$q.notify({
			type: "negative",
			message: "Correo electrónico es requerido y debe ser válido",
		});
		return false;
	}
	if (!cliente.value.phone || cliente.value.phone.length > 10) {
		$q.notify({
			type: "negative",
			message:
				"El número de teléfono es requerido y no debe superar los 10 dígitos",
		});
		return false;
	}
	if (!cliente.value.municipality_id) {
		$q.notify({ type: "negative", message: "El municipio es requerido" });
		return false;
	}
	return true;
};

async function crearCliente() {
  if (!validarCampos()) {
    return;
  }
  try {
    const clienteEnviado = {
      ...cliente.value,
      identification_document_id:
        cliente.value.identification_document_id?.id || null,
      legal_organization_id: cliente.value.legal_organization_id?.id || null,
      tribute_id: cliente.value.tribute_id?.id || null,
      municipality_id: cliente.value.municipality_id?.id || null,
    };
    const response = await axios.post(
      "http://localhost:5000/factus/cliente",
      clienteEnviado
    );
    $q.notify({ type: "positive", message: "Cliente creado con éxito" });
    
    cliente.value = {};

    showForm.value = false;

    traerCliente();

  } catch (error) {
    $q.notify({ type: "negative", message: "Error al crear el cliente" });
  }
}

async function traerCliente() {
	try {
		const response = await axios.get("http://localhost:5000/factus/cliente");
		rows.value = response.data.cliente;
	} catch (error) {
		$q.notify({ type: "negative", message: "Error al cargar los clientes" });
	}
}

const confirmarEliminarCliente = (id) => {
	$q.dialog({
		title: "Confirmar Eliminación",
		message: "¿Estás seguro de que quieres eliminar este cliente?",
		cancel: true,
		persistent: true,
	}).onOk(() => {
		eliminarCliente(id);
	});
};

const eliminarCliente = async (id) => {
	try {
		await axios.delete(`http://localhost:5000/factus/cliente/${id}`);
		$q.notify({ type: "positive", message: "Cliente eliminado con éxito" });
		traerCliente();
	} catch (error) {
		$q.notify({ type: "negative", message: "Error al eliminar el cliente" });
	}
};

const validarYCrearCliente = () => {
	if (validarCampos()) {
		crearCliente();
	} else {
		$q.notify({
			type: "negative",
			message: "Por favor, rellene todos los campos requeridos.",
		});
	}
};

onMounted(() => {
	traerMunicipios();
	traerCliente();
});
</script>

<style scoped>
.container {
  margin: 1px;
  padding: 65px 25px;
  background-color: #06496811;
  border-radius: 8px;
}
.table{
	margin: 1px;
	padding: 25px;
	background-color: #f5f5f5;
	border-radius: 8px;
	text-align: center;
	margin-top: 5vh;
}
.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 20px;
}

.titulo {
	display: flex;
	justify-content: space-between;
}
.input {
  font-size: 15px;
  margin-bottom: 5px;
  padding: 10px;
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

.q-btn.post-btn:hover {
  background-color: #1565c0;
}

.q-btn.cancel-btn {
  background-color: #e0e0e0;
  color: #616161;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 5px;
}

.q-btn.cancel-btn:hover {
  background-color: #bdbdbd;
}

.q-btn.toggle-btn {
  margin-bottom: 20px;
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

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
