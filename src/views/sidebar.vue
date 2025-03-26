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
				<q-item clickable v-ripple @click="goTo('path/home')" :disable="esRutaActual('/path/home')">
					<q-item-section avatar>
						<q-icon name="receipt" />
					</q-item-section>
					<q-item-section>Ver Facturas</q-item-section>
				</q-item>

				<q-separator />

				<q-item clickable v-ripple @click="goTo('path/post')" :disable="esRutaActual('/path/post')">
					<q-item-section avatar>
						<q-icon name="add_circle" />
					</q-item-section>
					<q-item-section>Añadir Factura</q-item-section>
				</q-item>

				<q-separator />

				<q-item clickable v-ripple @click="goTo('path/cliente')" :disable="esRutaActual('/path/cliente')">
					<q-item-section avatar>
						<q-icon name="people" />
					</q-item-section>
					<q-item-section>Añadir Cliente</q-item-section>
				</q-item>

				<q-separator />

				<q-item clickable v-ripple @click="goTo('path/producto')" :disable="esRutaActual('/path/producto')">
					<q-item-section avatar>
						<q-icon name="tab" />
					</q-item-section>
					<q-item-section>Añadir Producto</q-item-section>
				</q-item>

				<q-separator />

				<q-item clickable v-ripple @click="confirmarCierreSesion">
					<q-item-section avatar>
						<q-icon name="logout" color="negative" />
					</q-item-section>
					<q-item-section class="text-negative">Cerrar sesión</q-item-section>
				</q-item>

				<q-separator />
			</q-list>
		</q-drawer>

		<router-view />
	</q-layout>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";

const router = useRouter();
const route = useRoute();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
	leftDrawerOpen.value = !leftDrawerOpen.value;
};

const goTo = (ruta) => {
	router.push(`/${ruta}`);
};

// Función para verificar si la ruta actual coincide
const esRutaActual = (ruta) => computed(() => route.path === ruta).value;

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
</script>
