import axios from "axios";

const clientFactus = axios.create({
    baseURL: "http://api-sandbox.factus.com.co"
});

clientFactus.interceptors.request.use(
    (config) => {
        if (!config.url.includes("/oauth/token")) {
            const store = JSON.parse(localStorage.getItem("tienda"));
            const token = store.token || "";
            config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default clientFactus;