<template>
	<div>
		<h1>Crear Cliente</h1>
		<section>
			<q-select
				v-model="cliente.identification_document_id"
				:options="typeDocuments"
				option-value="id"
				option-label="nombre"
				label="Tipo de Identificación" />
			<q-input
				v-model="cliente.identification"
				label="Num. de Identificación" />
			<q-input
				v-model="cliente.dv"
				v-if="mostrarDV"
				type="Number"
				label="Digíto de verificación" /><!-- Si el clinete se identifica con NIT -->
			<q-select
				v-model="cliente.legal_organization_id"
				:options="typeOrganizations"
				option-value="id"
				option-label="nombre"
				label="Tipo de Organizacion" />
			<q-input
				v-model="cliente.company"
				label="Razon Social" /><!-- Si el clinete es persona juridica -->
			<q-input v-model="cliente.trade_name" label="Nombre Comerial" />
			<q-input
				v-model="cliente.names"
				label="Nombre"
				v-if="esPersonaNatural" /><!-- Si el clinete es persona natural -->
			<q-input v-model="cliente.address" label="Dirección" />
			<q-input v-model="cliente.email" label="Correo Electrónico" />
			<q-input v-model="cliente.phone" label="Número de Teléfono" />
			<q-select
				v-model="cliente.tribute_id"
				:options="typeTributes"
				option-value="id"
				option-label="nombre"
				label="Tributo" />
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
				clearable />
			<q-btn label="Crear Cliente" @click="crearCliente" />
		</section>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const router = useRouter();
const $q = useQuasar();
const leftDrawerOpen = ref(false);
const municipios = ref([]);
const loading = ref(false);

const cliente = ref({});
const typeDocuments = [
	{ id: 1, nombre: "Registro Civil" },
	{ id: 2, nombre: "Tarjeta de Identidad" },
	{ id: 3, nombre: "Cédula de Ciudadanía" },
	{ id: 4, nombre: "Tarjeta de Extranjería" },
	{ id: 5, nombre: "Cédula de Extranjería" },
	{ id: 6, nombre: "NIT" },
	{ id: 7, nombre: "Pasaporte" },
	{ id: 8, nombre: "Documento de Indentificación Extranjero" },
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

const toggleLeftDrawer = () => {
	leftDrawerOpen.value = !leftDrawerOpen.value;
};
const goTo = (route) => {
	router.push(`/${route}`);
};

async function crearCliente() {
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
		console.log(response);
	} catch (error) {
		$q.notify({ type: "negative", message: "Error al crear el cliente" });
	}
}
</script>

<style scoped>
h6 {
	font-size: 1.5rem;
	font-weight: bold;
	color: #1976d2;
	text-align: center;
	margin-bottom: 10px;
}
</style>
