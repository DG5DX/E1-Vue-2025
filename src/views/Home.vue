<template>
    <div class="home-container">
      <h2>¡Bienvenidos!</h2>
      <p>Te haz registrado con exito.</p>
      <button @click="logout">Cerrar Sección</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        // Lógica de logout
        alert('You have logged out');
        this.$router.push('/');
      }
    }
  }
  </script>
  
  <style scoped>
  .home-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    text-align: center;
  }
  button {
    margin-top: 20px;
    padding: 10px;
    background-color: #DC3545;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #c82333;
  }
  </style>
  