<template>
	<div class="login">
	  <h2>Iniciar sesión</h2>
	  <form @submit.prevent="handleLogin">
		<div class="input-group">
		  <label for="username">Usuario</label>
		  <input type="text" id="username" v-model="username" required />
		</div>
		<div class="input-group">
		  <label for="password">Contraseña</label>
		  <div class="password-wrapper">
			<input
			  :type="showPassword ? 'text' : 'password'"
			  id="password"
			  v-model="password"
			  required
			/>
			<q-btn
			  flat
			  dense
			  round
			  :icon="showPassword ? 'visibility_off' : 'visibility'"
			  class="toggle-password"
			  @click="togglePassword"
			/>
		  </div>
		</div>
		<q-btn
		  type="submit"
		  label="Iniciar sesión"
		  color="blue"
		  :loading="loading"
		  :disable="isDisabled"
		  icon="login"
		  class="full-width"
		  @click="validateAndLogin"
		/>
	  </form>
	</div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";
  import { postData } from "../services/apiclient";
  import { useStore } from "../stores/General";
  import { useQuasar } from "quasar";
  
  const username = ref("");
  const password = ref("");
  const showPassword = ref(false);
  const loading = ref(false);
  const store = useStore();
  const router = useRouter();
  const $q = useQuasar();
  
  const isDisabled = computed(
	() => !username.value.trim() || !password.value.trim()
  );
  
  const togglePassword = () => {
	showPassword.value = !showPassword.value;
  };
  
  const validateAndLogin = async () => {
	if (isDisabled.value) {
	  showNotification("warning", "Todos los campos son obligatorios");
	  return;
	}
	await login();
  };
  
  const login = async () => {
	loading.value = true;
	try {
	  const response = await postData("/oauth/token", {
		grant_type: "password",
		client_id: import.meta.env.VITE_CLIENT_ID,
		client_secret: import.meta.env.VITE_CLIENT_SECRET,
		username: username.value.trim(),
		password: password.value.trim(),
	  });
  
	  if (response.access_token) {
		store.set_Token_RefreshToken(
		  response.access_token,
		  response.refresh_token
		);
		showNotification("positive", "Inicio de sesión exitoso");
		router.replace("/path/home");
	  } else {
		showNotification("negative", "Usuario o contraseña incorrectos");
	  }
	} catch (error) {
	  handleLoginError(error);
	} finally {
	  loading.value = false;
	}
  };
  
  const showNotification = (type, message) => {
	$q.notify({
	  type,
	  message,
	  position: "top-right",
	  timeout: 3000,
	});
  };
  
  const handleLoginError = (error) => {
	let errorMessage = "Error al iniciar sesión";
	if (
	  error.response &&
	  error.response.data &&
	  error.response.data.error_description
	) {
	  errorMessage = error.response.data.error_description;
	} else if (error.message) {
	  errorMessage = error.message;
	}
	showNotification("negative", errorMessage);
  };
  </script>
  
  <style scoped>
  .login {
	min-width: 350px;
	max-width: 500px;
	min-height: 400px;
	margin: 100px auto;
	padding: 40px;
	border: 1px solid #ffffff;
	border-radius: 15px;
	background-color: white;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
  }
  
  h2 {
	font-family: "Trebuchet MS", sans-serif;
	color: #234161ff;
	text-align: center;
	margin-bottom: 30px;
  }
  
  .input-group {
	width: 100%;
	margin-bottom: 20px;
  }
  
  label {
	font-family: "Arial", sans-serif;
	color: #234161ff;
	font-weight: bold;
	display: block;
	margin-bottom: 5px;
	font-size: medium;
  }
  
  .password-wrapper {
	position: relative;
	width: 100%;
  }
  
  input {
	width: 100%;
	padding: 12px;
	padding-right: 40px; /* Deja espacio para el icono */
	border: 2px solid #dddddd;
	border-radius: 8px;
	font-size: 16px;
	transition: transform 0.3s ease-in-out, border-color 0.3s ease;
  }
  
  input:focus {
	border-color: #ffeb3b;
	transform: scale(1.05);
  }
  
  .toggle-password {
	position: absolute;
	top: 50%;
	right: 8px;
	transform: translateY(-50%);
	color: #777;
  }
  
  .toggle-password:hover {
	color: #234161ff;
  }
  </style>