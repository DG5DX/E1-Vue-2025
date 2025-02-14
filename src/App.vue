<template>
  <div id="app">
    <router-view></router-view> <!-- Aquí se renderizan las vistas basadas en las rutas -->
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
/* Estilos generales para la aplicación */
#app {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
