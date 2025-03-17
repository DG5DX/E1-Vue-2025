<template>
	<q-layout view="hHh lpR fFf">
		<q-header class="bg-primary text-white">
			<q-toolbar>
				<q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
				<q-toolbar-title>API</q-toolbar-title>
			</q-toolbar>
		</q-header>

		<q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
			<q-list>
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
					:loading="cargando">
					<template v-slot:body-cell-acciones="props">
						<q-td :props="props">
							<q-btn
								color="primary"
								dense
								round
								icon="visibility"
								@click="verFactura(props.row)" />
							<q-btn
								color="negative"
								dense
								round
								icon="file_download"
								@click="descargarPDF(props.row)"
								class="q-ml-sm">
							</q-btn>
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
					<!-- Sección de Datos del Cliente -->
					<div class="q-mb-md">
						<div class="titulo-detalle">Datos del Cliente</div>
						<q-form class="detalle-form">
							<q-input
								outlined
								v-model="facturaSeleccionada.customer.name"
								label="Cliente"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								v-model="facturaSeleccionada.customer.document"
								label="Identificación"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								v-model="facturaSeleccionada.customer.email"
								label="Correo Electrónico"
								readonly
								style="flex: 1 1 48%" />
						</q-form>
					</div>
					<!-- Sección de Detalles de la Factura -->
					<div class="q-mb-md">
						<div class="titulo-detalle">Detalles de la Factura</div>
						<q-form class="detalle-form">
							<q-input
								outlined
								v-model="facturaSeleccionada.reference_code"
								label="Código de referencia"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.price"
								label="Total"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.payment_form"
								label="Forma de pago"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.payment_method_code"
								label="Metodo"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.billing_period.start_date"
								label="Fecha de inicio"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.billing_period.start_time"
								label="Hora de inicio"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.billing_period.end_date"
								label="Fecha de finalización"
								readonly
								style="flex: 1 1 48%" />
							<q-input
								outlined
								:value="formato"
								v-model="facturaSeleccionada.billing_period.end_time"
								label="Hora de finalización"
								readonly
								style="flex: 1 1 48%" />
						</q-form>
					</div>
				</q-card-section>

				<q-separator />

				<!-- Sección de Productos -->
				<q-card-section class="q-pa-md">
					<h5>Productos</h5>
					<q-table
						:rows="facturaSeleccionada.items || []"
						:columns="columnsProductos"
						row-key="id"
						bordered
						class="tabla-detalle" />
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
const facturaDialog = ref(false);
const facturaSeleccionada = ref({});

const columns = ref([
	{
		name: "cliente",
		align: "center",
		label: "Cliente",
		field: row => row.customer?.name || "Sin cliente",
		sortable: true,
	},
	{
		name: "documento",
		align: "center",
		label: "Documento",
		field: row => row.customer?.document || "Sin documento",
		sortable: true,
	},
	{
		name: "reference_code",
		align: "center",
		label: "Código de Referencia",
		field: "reference_code",
		sortable: true,
	},
	{
		name: "observacion",
		align: "center",
		label: "Observacion",
		field: "observation",
		sortable: true,
	},
	{
		name: "formaPago",
		align: "center",
		label: "Forma de Pago",
		field: "payment_form",
		sortable: true,
	},
	{
		name: "metodoPago",
		align: "center",
		label: "Metodo de Pago",
		field: "payment_method_code",
		sortable: true,
	},

	// {
	//   name: "total",
	//   align: "center",
	//   label: "Total",
	//   field: "total",
	//   sortable: true,
	//   format: (val) => {
	//     return new Intl.NumberFormat("es-CO", {
	//       style: "currency",
	//       currency: "COP",
	//       minimumFractionDigits: 2,
	//     }).format(val);
	//   },
	// },
	{ name: "acciones", align: "center", label: "Acciones", field: "acciones" },
]);

const columnsProductos = ref([
	{ name: "id", label: "ID", field: "id", align: "left" },
	{ name: "name", label: "Producto", field: "nombre", align: "left" },
	{ name: "price", label: "Precio", field: "precio", align: "right" },
	// { name: "quantity", label: "Cantidad", field: "quantity", align: "right" },
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
	try {
		const r = await axios.get("http://localhost:5000/factus/producto");
		console.log(r.data.productos[0].customer);
		if (r.data) {
			facturas.value = r.data.productos;
		}
	} catch (error) {
		$q.notify({
			type: "negative",
			message: "Error al obtener facturas",
			position: "top",
			timeout: 3000,
		});
		console.error(error);
	} finally {
		cargando.value = false;
	}
}

// async function obtenerFacturas() {
//   cargando.value = true;
//   const store = JSON.parse(localStorage.getItem("tienda"));
//   const token = store?.token || "";
//   try {
//     const response = await axios.get(
//       "https://api-sandbox.factus.com.co/v1/bills",
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );
//     if (response.data) {
//       facturas.value = response.data.data.data;
//     }
//   } catch (error) {
//     $q.notify({
//       type: "negative",
//       message: "Error al obtener facturas",
//       position: "top",
//       timeout: 3000,
//     });
//     console.error(error);
//   } finally {
//     cargando.value = false;
//   }
// }

function verFactura(factura) {
	facturaSeleccionada.value = factura;
	facturaDialog.value = true;
}

// async function descargarPDF(factura) {
//   const store = JSON.parse(localStorage.getItem("tienda"));
//   const token = store?.token || "";
//   const url = `https://api-sandbox.factus.com.co/v1/bills/${factura.number}/pdf`;

//   try {
//     const response = await axios.get(url, {
//       headers: { Authorization: `Bearer ${token}` },
//       responseType: "blob"
//     });

//     const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = urlBlob;
//     link.setAttribute('download', `Factura-${factura.number}.pdf`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     $q.notify({
//       type: 'positive',
//       message: 'Descarga de factura exitosa',
//       position: 'top',
//       timeout: 3000
//     });
//   } catch (error) {
//     $q.notify({
//       type: 'negative',
//       message: 'Error al descargar factura',
//       position: 'top',
//       timeout: 3000
//     });
//     console.error(error);
//   }
// }


onMounted(() => {
	obtenerFacturas();
});
</script>

<style scoped>
h4 {
	display: flex;
	justify-content: center;
	font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
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
