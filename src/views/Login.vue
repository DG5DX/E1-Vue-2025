<template>
    <div class="login-container">
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
        <button type="submit">Iniciar sesión</button>
    </form>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

let username = ''
let password = ''

const handleLogin = () => {
    if (username === 'Daniel' && password === '12345') {
    router.push('/home')
    } else {
    $q.notify({
        color: 'negative',
        position: 'top',
        message: 'Usuario o contraseña incorrectos',
        icon: 'warning'
    })
    }
}
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
}
.input-group {
    margin-bottom: 10px;
}
input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
}
button {
    width: 100%;
    padding: 10px;
    background-color: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}
</style>