<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const facturas = ref([]);
const loading = ref(false);
const error = ref(null);

const cargarFacturas = async () => {
	loading.value = true;
	error.value = null;
	try {
		const response = await axios.get("http://localhost:5000/api/factura"); // Cambia la URL si es necesario
		facturas.value = response.data.factua;
	} catch (err) {
		error.value = "Error al cargar las facturas";
		console.error(err);
	} finally {
		loading.value = false;
	}
};

onMounted(cargarFacturas);
</script>

<template>
	<div class="p-4">
		<h1 class="text-xl font-bold mb-4">Lista de Facturas</h1>
		<button
			@click="cargarFacturas"
			class="bg-blue-500 text-white px-4 py-2 rounded mb-4">
			Recargar
		</button>
		<p v-if="loading">Cargando...</p>
		<p v-if="error" class="text-red-500">{{ error }}</p>
		<table
			v-if="facturas.length"
			class="w-full border-collapse border border-gray-300">
			<thead>
				<tr class="bg-gray-200">
					<th class="border p-2">Código</th>
					<th class="border p-2">Observación</th>
					<th class="border p-2">Cliente</th>
					<th class="border p-2">Fecha de pago</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="factura in facturas" :key="factura._id" class="border">
					<td class="border p-2">{{ factura.reference_code }}</td>
					<td class="border p-2">{{ factura.observation }}</td>
					<td class="border p-2">{{ factura.customer?.names }}</td>
					<td class="border p-2">{{ factura.payment_due_date }}</td>
				</tr>
			</tbody>
		</table>
		<p v-else-if="!loading">No hay facturas registradas.</p>
	</div>
</template>
