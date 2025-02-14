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
      // Notificación de inicio de sesión exitoso
    $q.notify({
        color: 'positive',  // Color verde para éxito
        position: 'top',
        message: 'Inicio de sesión exitoso',
        icon: 'check_circle'  // Icono de éxito
    })
    
      // Redirige a la página de inicio (home)
    router.push('/home')
    } else {
      // Notificación de error por credenciales incorrectas
    $q.notify({
        color: 'negative',  // Color rojo para error
        position: 'top',
        message: 'Usuario o contraseña incorrectos',
        icon: 'warning'  // Icono de advertencia
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
    background-color: #0E529BFF;
    color: white;
    border: none;
    cursor: pointer;
}
button:hover {
    background-color: #2F80D6FF;
}
</style>
