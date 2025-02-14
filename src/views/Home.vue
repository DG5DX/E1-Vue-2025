<template>
    <div class="home-container">
      <h2>¡Bienvenido!</h2>
      <p>Te has registrado con éxito.</p>
      <button @click="confirmLogout">Cerrar sesión</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      confirmLogout() {
        this.$q.dialog({
          title: 'Cerrar sesión',
          message: '¿Estás seguro de que deseas cerrar sesión?',
          ok: 'Sí',
          cancel: 'No',
        }).onOk(() => {
          this.logout();
        }).onCancel(() => {
          console.log('Cierre de sesión cancelado');
        });
      },
  
      logout() {
        this.$router.push('/');  // Redirige a la página de login
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
  