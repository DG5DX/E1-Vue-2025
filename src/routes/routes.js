import { createRouter, createWebHashHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Post from "../views/Post.vue";
import Cliente from "../views/Post_Cliente.vue";
import Producto from "../views/Post_Producto.vue";
import Sidebar from "../views/sidebar.vue";

const requireAuth = (to, from, next) => {
	next();
};

const routes = [
	{ path: "/", component: Login },
	{
		path: "/path",
		component: Sidebar,
		children: [
			{ path: "home", component: Home, beforeEnter: requireAuth },
			{ path: "post", component: Post, beforeEnter: requireAuth },
			{ path: "cliente", component: Cliente, beforeEnter: requireAuth },
			{ path: "producto", component: Producto, beforeEnter: requireAuth },
		],
	},
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});
