import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://api-sandbox.factus.com.co"
});

apiClient.interceptors.request.use(
    (config) => {
        const dataStore = JSON.parse(localStorage.getItem("tienda"));
        const token = dataStore?.token || "";

        // 🚨 No agregar "token" en la autenticación
        if (!config.url.includes("/oauth/token")) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
