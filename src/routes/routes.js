import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';

const requireAuth = (to, from, next) => {
  next();
}

const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home, beforeEnter: requireAuth }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
