<template>
	<div>
		<h1>Crear Producto</h1>
		<section>
			<q-input v-model="producto.code_reference" label="Código de Referencia" />
			<q-input v-model="producto.name" label="Nombre" />
			<!-- <q-input
					v-model.number="producto.quantity"
					type="number"
					label="Cantidad" />
				<q-input
					v-model.number="producto.discount_rate"
					type="number"
					step="0.01"
					label="Porcentaje de Descuento" /> -->
			<q-input
				v-model.number="producto.price"
				type="number"
				step="0.01"
				label="Precio" />
			<!-- <q-input
					v-model.number="producto.price"
					type="number"
					step="0.01"
					label="Precio" />
				<q-input
					v-model.number="producto.tax_rate"
					label="Porcentaje del Impuesto" /> -->
			<q-select
				v-model="producto.unit_measure_id"
				:options="medidas"
				option-value="id"
				option-label="nombre"
				label="Unidad de Medida"
				use-input
				input-debounce="300"
				@filter="onFilterU"
				:loading="loading"
				clearable />
			<q-select
				v-model="producto.standard_code_id"
				:options="typeStandard"
				option-value="id"
				option-label="nombre"
				label="Código de Estándar" />
			<!-- <q-select
					v-model="cliente.is_excluded"
					:options="[{ id: 0, nombre: 'no'}, { id: 1, nombre: 'si'}]"
					option-value="id"
					option-label="nombre"
					label="Excluido de IVA" />
				 -->
			<q-btn label="Crear Producto" @click="crearProducto" />
		</section>
	</div>

	<q-table
		flat
		bordered
		:rows="rowsItems"
		:columns="columnsItems"
		row-key="id"
		class="q-mt-md">
		<template v-slot:body-cell-actions="props">
			<q-td :props="props">
				<q-btn color="red" icon="delete" flat dense />
			</q-td>
		</template>
	</q-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
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
/* const numberingRanges = [
	"Registro civil",
	"Tarjeta de identidad",
	"Cédula de ciudadanía",
	"Tarjeta de extranjería",
	"Cédula de extranjería",
	"NIT",
	"Pasaporte",
	"Documento de identificación extranjero",
	"PEP",
	"NIT otro país",
	"NUIP",
];
const paymentMethods = [
	"Efectivo",
	"Consignación",
	"Cheque",
	"Transferencia",
	"Bonos",
	"Vales",
	"Medio de pago no definido",
	"Tarjeta Débito",
	"Tarjeta Crédito",
];
const paymentForm = ["Pago de contado", "Pago a crédito"]; */
/* const itemSelected = ref(null);
const selectItems = ref([]);
const factura = ref({
	numbering_rage_id: "",
	reference_code: "",
	observation: "",
	payment_form: "",
	payment_due_date: "",
	payment_method_code: "",
	billing_period: {
		start_date: "",
		start_time: "",
		end_date: "",
		end_time: "",
	},
	customer: {
		name: "",
		document: "",
		email: "",
	},
	items: [],
}); */

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

// async function getData(endpoint) {
// 	// Simulación de API
// 	return [];
// }

async function crearProducto() {
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
		cliente.value = {};
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

/* async function crearFactura() {
	try {
		const store = JSON.parse(localStorage.getItem("tienda"));
		const token = store?.token || "";
		if (!token) {
			$q.notify({ type: "negative", message: "No estás autenticado." });
			return;
		}

		const facturaData = {
			...factura.value,
			payment_due_date: new Date(factura.value.payment_due_date),
		};

		const response = await axios.post(
			"http://localhost:5000/factus/producto",
			facturaData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log(response);

		$q.notify({ type: "positive", message: "Factura creada con éxito" });
		factura.value = { billing_period: {}, items: [] }; // Limpiar formulario después de enviar
	} catch (error) {
		console.error("Error al crear la factura:", error);
		$q.notify({ type: "negative", message: "Error al crear la factura" });
	}
}

const lastSelectedItem = ref("");

function agregarItem() {
	if (itemSelected.value) {
		if (
			!factura.value.items.find((item) => item.id === itemSelected.value.id)
		) {
			factura.value.items.push({ ...itemSelected.value });
			lastSelectedItem.value = itemSelected.value.nombre;
		} else {
			$q.notify({ type: "warning", message: "El producto ya está agregado." });
		}
		itemSelected.value = null;
	}
}

function eliminarItem(id) {
	factura.value.items = factura.value.items.filter((item) => item.id !== id);
}

async function getProductos() {
	try {
		const r = await axios.get("https://dummyjson.com/products");
		if (r.data && r.data.products) {
			selectItems.value = r.data.products.map((product) => ({
				id: product.id,
				nombre: product.title,
				precio: product.price,
			}));
		}
	} catch (error) {
		console.error("Error cargando los productos:", error);
		$q.notify({ type: "negative", message: "Error cargando productos" });
	}
}	*/

onMounted(() => {
	traerMedidas();
	traerProductos();
});
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
