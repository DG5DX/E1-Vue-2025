<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useStore } from "../stores/General";

const store = useStore();
const loading = ref(false);
const error = ref(null);
const rows = ref([]);

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
		field: (row) => row.payment_form.name || "N/A",
		sortable: true,
	},
	{ name: "accion", label: "Acción", align: "left" },
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
		error.value = "Error al cargar las facturas";
		console.error(err);
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
		console.log(response)
		const { file_name, pdf_base_64_encoded } = response.data.data
    const byteCharacters = atob(pdf_base_64_encoded);
    const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${file_name}.pdf`
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error("Error al descargar la factura:", err);
	}
};

onMounted(cargarFacturas);
</script>

<template>
	<div class="p-4">
		<h1 class="text-xl font-bold mb-4">Lista de Facturas</h1>
		<q-table :rows="rows" :columns="columns" row-key="id">
			<template v-slot:body-cell-status="props">
				<q-td :props="props">
					<q-badge
						:color="props.row.status === 1 ? 'green' : 'red'"
						align="top"
						:label="props.row.status === 1 ? 'Activo' : 'Inactivo'" />
				</q-td>
			</template>

			<template v-slot:body-cell-accion="props">
				<q-td :props="props">
					<q-btn
						label="Descargar"
						color="primary"
						icon="download"
						@click="descargarFactura(props.row.number)" />
				</q-td>
			</template>
		</q-table>
	</div>
</template>
