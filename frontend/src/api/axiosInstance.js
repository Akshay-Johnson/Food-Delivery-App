import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem("role");

    let token =
      (role === "restaurant" && localStorage.getItem("restaurantToken")) ||
      (role === "agent" && localStorage.getItem("agentToken")) ||
      (role === "admin" && localStorage.getItem("adminToken")) ||
      (role === "customer" && localStorage.getItem("customerToken"));

    if (!token) {
      token =
        localStorage.getItem("restaurantToken") ||
        localStorage.getItem("agentToken") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("customerToken");
    }

    const isAuthRoute =
      config.url?.includes("/login") ||
      config.url?.includes("/register");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

export default api;
