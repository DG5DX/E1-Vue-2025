<template>
	<q-page-container>
		<q-page class="q-pa-md">
			<q-card class="q-pa-md">
				<q-card-section>
					<h6 class="text-h6">Crear Factura</h6>
				</q-card-section>

				<q-card-section>
					<!-- <q-select
							v-model="factura.numbering_rage_id"
							:options="numberingRanges"
							label="Rango de Numeración"
							option-value="id"
							option-label="nombre"
							emit-value
							map-options
							required /> -->
					<q-input
						v-model="factura.reference_code"
						label="Código de Referencia" />
					<q-input v-model="factura.observation" label="Observación" />
					<q-select
						v-model="factura.payment_form"
						:options="paymentForm"
						option-value="id"
						option-label="nombre"
						label="Forma de Pago" />
					<q-input
						v-model="factura.payment_due_date"
						label="Fecha de Vencimiento"
						type="date" />
					<q-select
						v-model="factura.payment_method_code"
						:options="paymentMethods"
						option-value="id"
						option-label="nombre"
						label="Método de Pago" />
				</q-card-section>

				<q-card-section>
					<h6 class="text-subtitle1">Periodo de Facturación</h6>
					<q-input
						v-model="factura.billing_period.start_date"
						label="Fecha de Inicio"
						type="date" />
					<q-input
						v-model="factura.billing_period.end_date"
						label="Fecha de Fin"
						type="date" />
				</q-card-section>

				<q-card-section>
					<h6 class="text-subtitle1">Cliente</h6>
					<q-select
						v-model="factura.customer"
						:options="clientes"
						option-value="_id"
						option-label="names"
						label="Cliente" />
				</q-card-section>

				<q-card-section>
					<h6 class="text-subtitle1">Productos</h6>
					<q-select
						v-model="productoSeleccionado"
						:options="productos"
						option-label="name"
						label="Seleccionar Producto"
						style="width: 300px" />
					<q-btn @click="agregarProducto" />

					<q-table
						flat
						bordered
						:rows="factura.items"
						:columns="columnsItems"
						row-key="code_reference"
						class="q-mt-md">
						<template v-slot:body-cell-quantity="props">
							<q-td :props="props">
								<q-input v-model="props.row.quantity" type="number" dense />
							</q-td>
						</template>

						<!-- <template v-slot:body-cell-discount_rate="props">
								<q-td :props="props">
									<q-input
										v-model="props.row.discount_rate"
										type="number"
										dense />
								</q-td>
							</template> -->

						<template v-slot:body-cell-tax_rate="props">
							<q-td :props="props">
								<q-input v-model="props.row.tax_rate" type="text" dense />
							</q-td>
						</template>

						<template v-slot:body-cell-is_excluded="props">
							<q-td :props="props">
								<q-select
									v-model="props.row.is_excluded"
									:options="[
										{ id: 0, nombre: 'no' },
										{ id: 1, nombre: 'si' },
									]"
									option-value="id"
									option-label="nombre"
									label="Excluido de IVA" />
							</q-td>
						</template>

						<template v-slot:body-cell-tribute_id="props">
							<q-td :props="props">
								<q-select
									v-model="props.row.tribute_id"
									:options="tributos"
									option-value="id"
									option-label="name"
									label="Tipo de Tributo"
									use-input
									input-debounce="300"
									@filter="onFilterT"
									:loading="loading"
									emit-value
									map-options
									clearable
									style="min-width: 150px" />
							</q-td>
						</template>
						<template v-slot:body-cell-actions="props">
							<q-td :props="props">
								<q-btn
									color="red"
									icon="delete"
									flat
									dense
									@click="eliminarItem(props.row.code_reference)" />
							</q-td>
						</template>
					</q-table>
				</q-card-section>

				<q-card-section>
					<q-btn @click="crearFactura" color="green" label="Crear Factura" />
				</q-card-section>
			</q-card>
		</q-page>
	</q-page-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const router = useRouter();
const $q = useQuasar();
const clientes = ref([]);
const productos = ref([]);
const leftDrawerOpen = ref(false);
const productoSeleccionado = ref();
const loading = ref(false);
const tributos = ref([]);

const factura = ref({
	reference_code: "",
	observation: "",
	payment_form: null,
	payment_due_date: "",
	payment_method_code: null,
	billing_period: {
		start_date: "",
		end_date: "",
	},
	customer: null,
	items: [],
});

const columnsItems = [
	{
		name: "code_reference",
		label: "Código Ref.",
		field: "code_reference",
		align: "left",
	},
	{ name: "name", label: "Producto", field: "name", align: "left" },
	{
		name: "price",
		label: "Precio",
		field: "price",
		align: "right",
		format: (val) => `$${val.toFixed(2)}`,
	},
	{
		name: "unit_measure_id",
		label: "Unidad de Medida",
		field: "unit_measure_id",
		align: "center",
	},
	{
		name: "standard_code_id",
		label: "Código Estándar",
		field: "standard_code_id",
		align: "center",
	},

	// 🔽 Campos editables
	{ name: "quantity", label: "Cantidad", field: "quantity", align: "center" },

	{
		name: "tax_rate",
		label: "Tasa de Impuesto",
		field: "tax_rate",
		align: "center",
	},
	{
		name: "is_excluded",
		label: "Excluido de IVA",
		field: "is_excluded",
		align: "center",
	},
	{
		name: "tribute_id",
		label: "Tributo",
		field: "tribute_id",
		align: "center",
	},

	{ name: "actions", label: "Acciones", align: "center" },
];

const paymentMethods = [
	{ id: 10, nombre: "Efectivo" },
	{ id: 42, nombre: "Consignación" },
	{ id: 20, nombre: "Cheque" },
	{ id: 47, nombre: "Transferencia" },
	{ id: 71, nombre: "Bonos" },
	{ id: 72, nombre: "Vales" },
	{ id: 1, nombre: "Medio de pago no definido" },
	{ id: 49, nombre: "Tarjeta Débito" },
	{ id: 48, nombre: "Tarjeta Crédito" },
];
const paymentForm = [
	{ id: 1, nombre: "Pago de Contado" },
	{ id: 2, nombre: "Pago de Crédito" },
];

const onFilterT = async (val, update) => {
	if (val === "") {
		tributos.value = [];
		update();
		return;
	}

	loading.value = true;

	try {
		const response = await axios.get(
			"https://api-sandbox.factus.com.co/v1/tributes/products",
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

		tributos.value = response.data.data.map((tributos) => ({
			id: tributos.id,
			name: tributos.name,
		}));

		update();
	} catch (error) {
		console.error("Error al obtener los tributos:", error);
	} finally {
		loading.value = false;
	}
};

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

// async function getData(endpoint) {
// 	// Simulación de API
// 	return [];
// }

async function crearFactura() {
	/* 	try { */
	console.log(factura.value.items);
	const facturaEnviado = {
		...factura.value,
		payment_form: factura.value.payment_form?.id || null,
		payment_method_code: factura.value.payment_method_code?.id || null,
		items: factura.value.items.map((item) => ({
			...item,
			is_excluded: item.is_excluded?.id,
			withholding_taxes: [],
		})),
		/* customer: factura.value.customer?.id || null, */
	};
	console.log(facturaEnviado.items);
	const responseF = await axios.post(
		"https://api-sandbox.factus.com.co/v1/bills/validate",
		facturaEnviado,
		{
			headers: {
				Authorization: `Bearer ${store.token}`,
				Accept: "application/json",
			},
		}
	);

	const responseB = await axios.post(
		"http://localhost:5000/factus/factura",
		facturaEnviado
	);
	$q.notify({ type: "positive", message: "Producto creado con éxito" });

	console.log(responseF, responseB, facturaEnviado);
	/* 	} catch (error) {
		$q.notify({
			type: "negative",
			message: `Error al crear el producto: ${error}`,
		});
	} */
}

/* async function crearFactura() {
	console.log({
		...factura.value,
		payment_form: factura.value.payment_form?.id || null,
		payment_method_code: factura.value.payment_method_code?.id || null,
		payment_method_code: factura.value.payment_method_code?.id || null,
	
	});
	/* try {
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
} */

async function traerProductos() {
	try {
		const response = await axios.get("http://localhost:5000/factus/producto");
		productos.value = response.data.producto;
	} catch (error) {
		console.error("Error cargando los productos:", error);
	}
}

async function traerClientes() {
	try {
		const response = await axios.get("http://localhost:5000/factus/cliente");
		clientes.value = response.data.cliente;
	} catch (error) {
		console.error("Error cargando los clientes:", error);
	}
}

const eliminarItem = (code) => {
	factura.value.items = factura.value.items.filter(
		(item) => item.code_reference !== code
	);
};

const agregarProducto = () => {
	const productoEnFactura = {
		...productoSeleccionado.value,
		quantity: 1,
		discount_rate: 0,
		tax_rate: 0,
		tribute_id: null,
		withholding_taxes: { code: null, withholding_tax_rate: 0 },
	};

	factura.value.items.push(productoEnFactura);
	productoSeleccionado.value = "";
};

onMounted(() => {
	traerClientes();
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
