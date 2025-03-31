<template>
  <div class="container">
    <h3>Crear Cliente</h3>
    <section class="formulario">
      <q-select
        class="input"
        v-model="cliente.identification_document_id"
        :options="typeDocuments"
        option-value="id"
        option-label="nombre"
        label="Tipo de Identificación"
        rules="required"
      />
      <q-input
        class="input"
        v-model="cliente.identification"
        label="Num. de Identificación"
        :rules="[
          (val) =>
            (val && val.length <= 10) ||
            'La identificación no puede pasar los 10 dígitos',
        ]"
      />
      <q-input
        class="input"
        v-model="cliente.dv"
        v-if="mostrarDV"
        type="Number"
        label="Dígito de verificación"
      />
      <q-select
        class="input"
        v-model="cliente.legal_organization_id"
        :options="typeOrganizations"
        option-value="id"
        option-label="nombre"
        label="Tipo de Organización"
      />
      <q-input class="input" v-model="cliente.company" label="Razón Social" />
      <!-- Si el cliente es persona jurídica -->
      <q-input
        class="input"
        v-model="cliente.trade_name"
        label="Nombre Comercial"
        :rules="[
          (val) =>
            (val && val.length >= 3) ||
            'El nombre comercial debe tener al menos 3 caracteres',
        ]"
      />
      <q-input
        class="input"
        v-model="cliente.names"
        label="Nombre"
        v-if="esPersonaNatural"
        :rules="[
          (val) =>
            (val && val.length >= 3) ||
            'El nombre debe tener al menos 3 caracteres',
        ]"
      />
      <!-- Si el cliente es persona natural -->
      <q-input class="input" v-model="cliente.address" label="Dirección" />
      <q-input
        class="input"
        v-model="cliente.email"
        label="Correo Electrónico"
        :rules="[
          (val) =>
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/.test(val) ||
            'Correo electrónico no válido',
        ]"
      />
      <q-input
        class="input"
        v-model="cliente.phone"
        label="Número de Teléfono"
        :rules="[
          (val) =>
            (val && val.length <= 10) ||
            'El teléfono no puede pasar los 10 dígitos',
        ]"
      />
      <q-select
        class="input"
        v-model="cliente.tribute_id"
        :options="typeTributes"
        option-value="id"
        option-label="nombre"
        label="Tributo"
      />
      <q-select
        class="input"
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
      />

      <q-btn
        class="post-btn"
        label="Crear Cliente"
        @click="validarYCrearCliente"
      />
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
    console.log(response);
  } catch (error) {
    $q.notify({ type: "negative", message: "Error al crear el cliente" });
  }
}

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
</script>
  
  <style scoped>
.container {
  margin: 1px;
  padding: 25px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input {
  font-size: 15px;
  margin-bottom: 5px;
  padding: 10px;
  border-radius: 5px;
}
.post-btn {
  margin-top: 20px;
  padding: 10px 20px;
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
</style>