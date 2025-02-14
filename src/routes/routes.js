import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';

// Lógica para proteger las rutas (aún no implementada, pero puedes usarla más adelante)
const requireAuth = (to, from, next) => {
  // Aquí puedes agregar lógica de autenticación real
  next(); // Permite el acceso sin restricciones por ahora
}

const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home, beforeEnter: requireAuth }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
