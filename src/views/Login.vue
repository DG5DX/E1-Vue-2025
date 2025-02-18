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
                <input type="password" id="password" v-model="password" required />
            </div>
            <q-btn type="submit" label="Iniciar sesión" color="blue" :loading="loading" :disable="isDisabled"
                icon="login" class="full-width" @click="validateAndLogin()" />
        </form>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { postData } from '../services/apiclient'
import { useStore } from '../stores/General'
import { useQuasar } from 'quasar'

const username = ref('')
const password = ref('')
const store = useStore()
const router = useRouter()
const $q = useQuasar()
const loading = ref(false)

const isDisabled = computed(() => !username.value || !password.value)

function validateAndLogin() {
    if (!username.value || !password.value) {
        $q.notify({
            type: 'warning',
            message: 'Todos los campos son obligatorios',
            position: 'top-right',
            timeout: 3000
        })
        return
    }
    login()
}

async function login() {
    loading.value = true

    try {
        const response = await postData("/oauth/token", {
            grant_type: "password",
            client_id: import.meta.env.VITE_CLIENT_ID,
            client_secret: import.meta.env.VITE_CLIENT_SECRET,
            username: username.value,
            password: password.value
        })
        const token = response.access_token

        if (token) {
            store.set_Token_RefreshToken(response.access_token, response.refresh_token)

            $q.notify({
                type: 'positive',
                message: 'Inicio de sesión exitoso',
                position: 'top-right',
                timeout: 3000
            })

            router.replace("/home")
        } else {
            $q.notify({
                type: 'negative',
                message: 'Usuario o contraseña incorrectos',
                position: 'top-right',
                timeout: 3000
            })
        }
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: 'Usuario o contraseña incorrectos',
            position: 'top-right',
            timeout: 3000
        })
    } finally {
        loading.value = false
    }
}
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
    font-family: 'Trebuchet MS', sans-serif;
    color: #234161FF;
    text-align: center;
    margin-bottom: 30px;
}

.input-group {
    width: 100%;
    margin-bottom: 20px;
}

label {
    font-family: 'Arial', sans-serif;
    color: #234161FF;
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
    font-size: medium;
}

input {
    width: 100%;
    padding: 12px;
    margin-top: 5px;
    border: 2px solid #dddddd;
    border-radius: 8px;
    font-size: 16px;
    transition: transform 0.3s ease-in-out, border-color 0.3s ease;
}

input:focus {
    border-color: #FFEB3B;
    transform: scale(1.05);
}
</style>
