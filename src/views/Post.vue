<template>
	<q-page-container>
		<q-page class="Formulario">
			<q-card class="q-pa-md">
				<q-card-section>
					<h4 class="crea">Crear Factura</h4>
				</q-card-section>

				<q-card-section>
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
					<h4>Periodo de Facturación</h4>
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
					<h4>Cliente</h4>
					<q-select
						v-model="factura.customer"
						:options="clientes"
						option-value="_id"
						option-label="names"
						label="Cliente"
						@update:model-value="buscar" />
					<div class="cliente-info">
						<q-input v-model="factura.customer.identification_document_id" label="Tipo de Documento" readonly />
					<q-input
						v-model="factura.customer.identification"
						label="Identificación"
						readonly />
					<q-input
						v-model="factura.customer.address"
						label="Dirección"
						readonly />
					<q-input
						v-model="factura.customer.email"
						label="Correo Electrónico"
						readonly />
					<q-input
						v-model="factura.customer.phone"
						label="Teléfono"
						readonly />
					<q-input
						v-model="factura.customer.municipality_id"
						label="Municipio"
						readonly />
					</div>
				</q-card-section>

				<q-card-section>
					<h4>Productos</h4>
					<q-select
						v-model="productoSeleccionado"
						:options="productos"
						option-label="name"
						label="Seleccionar Producto"
						style="width: 300px" />
					<q-btn
						@click="agregarProducto"
						label="Agregar Producto"
						color="info" />

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
					<q-btn
						class="post-btn"
						@click="crearFactura"
						color="primary"
						label="Crear Factura" />
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
const municipiosALL = ref([]);

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
  customer: {
    identification: "",
    dv: "",
    names: "",
    address: "",
    email: "",
    phone: "",
  },
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

// Guarda una copia del original antes de modificarlo para enviar a la API
let customerOriginal = null;

const buscar = () => {
  // Guardar los valores originales antes de mostrarlos formateados en la interfaz
  customerOriginal = { ...factura.value.customer };
  
  // Solo modificar para visualización, no para envío a la API
  if (factura.value.customer.identification_document_id) {
    const doc = typeDocuments.find((d) => d.id == factura.value.customer.identification_document_id);
    factura.value.customer.identification_document_display = doc ? doc.nombre : '';
  }
  
  if (factura.value.customer.municipality_id) {
    const municipio = municipiosALL.value.find((m) => m.id == factura.value.customer.municipality_id);
    factura.value.customer.municipality_display = municipio ? municipio.name : '';
  }
};

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
  } catch (error) {
    handleAxiosError(error, "Error al cargar municipios");
  }
};

const handleAxiosError = (error, defaultMessage) => {
  console.error(`${defaultMessage}:`, error);
  
  let errorMessage = defaultMessage;
  
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
    
    // Extraer mensaje de error si existe
    if (error.response.data && error.response.data.message) {
      errorMessage = `${defaultMessage}: ${error.response.data.message}`;
    }
    
    // Si hay errores de validación detallados
    if (error.response.data && error.response.data.errors) {
      const validationErrors = Object.entries(error.response.data.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      
      errorMessage = `${defaultMessage}: ${validationErrors}`;
    }
  } else if (error.request) {
    errorMessage = `${defaultMessage}: No se recibió respuesta del servidor`;
  } else {
    errorMessage = `${defaultMessage}: ${error.message}`;
  }
  
  $q.notify({
    type: "negative",
    message: errorMessage,
    position: "top",
    timeout: 5000,
  });
};

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

    tributos.value = response.data.data.map((tributo) => ({
      id: tributo.id,
      name: tributo.name,
    }));

    update();
  } catch (error) {
    handleAxiosError(error, "Error al obtener los tributos");
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

async function crearFactura() {
  // Validación local de campos obligatorios
 

  if (
    factura.value.billing_period.start_date &&
    factura.value.billing_period.end_date &&
    new Date(factura.value.billing_period.start_date) >
    new Date(factura.value.billing_period.end_date)
  ) 

  for (let item of factura.value.items) {
    
    // Convertir string a número si es necesario
    item.quantity = Number(item.quantity);
    item.tax_rate = Number(item.tax_rate || 0);
  }

  try {
    // Crear una copia para manipular los datos
		let facturaEnviado = {
      ...factura.value,
      payment_form: factura.value.payment_form?.id || null,
      payment_method_code: factura.value.payment_method_code?.id || null,
      customer: customerOriginal || factura.value.customer,
      items: factura.value.items.map((item) => ({
        ...item,
        is_excluded: item.is_excluded?.id !== undefined ? item.is_excluded.id : (item.is_excluded === true ? 1 : 0),
        withholding_taxes: item.withholding_taxes || [],
      })),
    };

    // Log for debug
    console.log("Datos que se enviarán a la API:", JSON.stringify(facturaEnviado, null, 2));

    // Primero validar con la API de Factus
   
    
    const responseF = await axios.post(
      "https://api-sandbox.factus.com.co/v1/bills/validate",
      facturaEnviado,
      {
        headers: {
          Authorization: `Bearer ${store.token}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
      }
    );
    

    
    // Si la validación es exitosa, enviar a su backend
    const responseB = await axios.post(
      "http://localhost:5000/factus/factura",
      facturaEnviado,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    $q.notify({ type: "positive", message: "Factura creada con éxito" });
    resetForm();
    
  } catch (error) {
   
    handleAxiosError(error, "Error al crear la factura");
  }
}

function resetForm() {
  // Resetear el formulario después de un envío exitoso
  factura.value = {
    reference_code: "",
    observation: "",
    payment_form: null,
    payment_due_date: "",
	tribute_id: 1,
    payment_method_code: null,
    billing_period: {
      start_date: "",
      end_date: "",
    },
    customer: {
      identification: "",
      dv: "",
      names: "",
      address: "",
      email: "",
      phone: "",
    },
    items: [],
  };
  customerOriginal = null;
}

async function traerProductos() {
  try {
    const response = await axios.get("http://localhost:5000/factus/producto");
    productos.value = response.data.producto;
  } catch (error) {
    handleAxiosError(error, "Error cargando los productos");
  }
}

async function traerClientes() {
  try {
    const response = await axios.get("http://localhost:5000/factus/cliente");
    clientes.value = response.data.cliente;
  } catch (error) {
    handleAxiosError(error, "Error cargando los clientes");
  }
}

const eliminarItem = (code) => {
  factura.value.items = factura.value.items.filter(
    (item) => item.code_reference !== code
  );
};

const agregarProducto = () => {
  if (!productoSeleccionado.value) {
    $q.notify({
      type: "warning",
      message: "Por favor seleccione un producto para agregar.",
      position: "top"
    });
    return;
  }

  // Verificar si el producto ya existe en la factura
  const existeProducto = factura.value.items.some(
    item => item.code_reference === productoSeleccionado.value.code_reference
  );

  if (existeProducto) {
    $q.notify({
      type: "warning",
      message: "Este producto ya está en la factura. Puede modificar su cantidad.",
      position: "top"
    });
    return;
  }

  const productoEnFactura = {
    ...productoSeleccionado.value,
    quantity: 1,
    discount_rate: 0,
    tax_rate: 0,
    is_excluded: 0,
    tribute_id: null,
    withholding_taxes: [],
  };

  factura.value.items.push(productoEnFactura);
  $q.notify({
    type: "positive",
    message: "Producto agregado correctamente",
    position: "top",
    timeout: 1000
  });
  productoSeleccionado.value = null;
};

onMounted(() => {
  traerMunicipios();
  traerClientes();
  traerProductos();
});
</script>

<style scoped>
h4 {
	font-weight: bold;
	color: #1976d2;
	text-align: center;
	margin-bottom: 10px;
	margin-top: 10px;
}

.Formulario {
	display: grid;
	align-content: center;
	margin-top: 90vh;
}

.cliente-info {
	display: flex;
	justify-content: space-evenly;
}

.post-btn {
	padding: 10px 20px;
	color: white;
	font-weight: bold;
	border-radius: 5px;
}

@media (max-width: 1500px) {
	.Formulario {
		margin-top: 90vh;
	}
	.crea{
		margin-top: 5vh;
	}
}
@media (max-width: 900px){
	.Formulario{
		margin-top: 100vh;
	}
}
</style>
