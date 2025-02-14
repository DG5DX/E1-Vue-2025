import Login from "../views/Login.vue"
import Home from "../views/Home.vue"
import {createRouter, createWebHashHistory} from "vue-router"

// Asegúrate de definir `requireAuth` si es necesario
const requireAuth = (to, from, next) => {
    // Aquí puedes agregar lógica de autenticación
    const isAuthenticated = false; // Esta es solo una demostración
    if (isAuthenticated) {
      next();
    } else {
      next('/');
    }
  }
  
  const routes = [
    { path: '/', component: Login },
    { path: '/home', component: Home, beforeEnter: requireAuth }
  ]
  
  export const router = createRouter({
    history: createWebHashHistory(),
    routes
  })