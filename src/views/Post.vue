<template>
	<q-layout view="hHh lpR fFf">
		<q-header class="bg-primary text-white">
			<q-toolbar>
				<q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
				<q-toolbar-title>API</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<!-- Drawer lateral -->
		<q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
			<q-list>
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
							label="Código de Referencia"
							required />
						<q-input v-model="factura.observation" label="Observación" />
            <q-select
							v-model="factura.payment_form"
							:options="paymentForm"
							label="Forma de Pago"
							emit-value
							map-options
							required /> 
						<q-input
							v-model="factura.payment_due_date"
							label="Fecha de Vencimiento"
							type="date"
							required />
            <q-select
							v-model="factura.payment_method_code"
							:options="paymentMethods"
							label="Método de Pago"
							emit-value
							map-options
							required /> 
					</q-card-section>

					<q-card-section>
						<h6 class="text-subtitle1">Periodo de Facturación</h6>
						<q-input
							v-model="factura.billing_period.start_date"
							label="Fecha de Inicio"
							type="date"
							required />
						<q-input
							v-model="factura.billing_period.start_time"
							label="Hora de Inicio"
							type="time"
							required />
						<q-input
							v-model="factura.billing_period.end_date"
							label="Fecha de Fin"
							type="date"
							required />
						<q-input
							v-model="factura.billing_period.end_time"
							label="Hora de Fin"
							type="time"
							required />
					</q-card-section>

					<q-card-section>
						<h6 class="text-subtitle1">Cliente</h6>
						<q-input
							v-model="factura.customer.name"
							label="Nombre del Cliente"
							required />
						<q-input
							v-model="factura.customer.document"
							label="Documento del Cliente"
							required />
						<q-input
							v-model="factura.customer.email"
							label="Correo del Cliente"
							type="email"
							required />
					</q-card-section>

					<q-card-section>
						<h6 class="text-subtitle1">Productos</h6>
						<q-select
							v-model="itemSelected"
							:options="selectItems"
							option-label="nombre"
							label="Seleccionar Producto"
							:display-value="lastSelectedItem || 'Seleccionar Producto'"
							@update:model-value="agregarItem"
							dense
							filled
							behavior="menu"
							style="width: 300px" />

						<q-table
							flat
							bordered
							:rows="factura.items"
							:columns="columnsItems"
							row-key="id"
							class="q-mt-md">
							<template v-slot:body-cell-actions="props">
								<q-td :props="props">
									<q-btn
										color="red"
										icon="delete"
										flat
										dense
										@click="eliminarItem(props.row.id)" />
								</q-td>
							</template>
						</q-table>
					</q-card-section>

					<q-card-section>
						<q-btn @click="crearFactura" color="green" label="Crear Factura" :disabled="!isFormatValid" />
					</q-card-section>
				</q-card>
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { computed } from "vue";
import axios from "axios";
const router = useRouter();
const $q = useQuasar();

//El import computed, junto al isFormatValid & facturaData son para que no hayan campos vacios
const isFormatValid = computed(() => {
const facturaData = factura.value;

return (
    facturaData.reference_code &&
    facturaData.payment_form &&
    facturaData.payment_due_date &&
    facturaData.payment_method_code &&
    facturaData.billing_period.start_date &&
    facturaData.billing_period.start_time &&
    facturaData.billing_period.end_date &&
    facturaData.billing_period.end_time &&
    facturaData.customer.name &&
    facturaData.customer.document &&
    facturaData.customer.email &&
    facturaData.items.length > 0
	);
});

const leftDrawerOpen = ref(false);

const columnsItems = [
	{ name: "name", label: "Producto", field: "nombre" },
	{ name: "price", label: "Precio", field: "precio" },
	{ name: "actions", label: "Acciones", align: "center" },
];
// const numberingRanges = [
// 	"Registro civil",
// 	"Tarjeta de identidad",
// 	"Cédula de ciudadanía",
// 	"Tarjeta de extranjería",
// 	"Cédula de extranjería",
// 	"NIT",
// 	"Pasaporte",
// 	"Documento de identificación extranjero",
// 	"PEP",
// 	"NIT otro país",
// 	"NUIP",
// ];
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
const paymentForm = ["Pago de contado", "Pago a crédito"];
const itemSelected = ref(null);
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
});

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
}

onMounted(() => {
	getProductos();
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