import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
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
      config.url?.includes("/login") || config.url?.includes("/register");

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

/* ================= FIX IMAGE URLS GLOBALLY ================= */
api.interceptors.response.use(
  (response) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const fixImages = (data) => {
      if (!data || typeof data !== "object") return;

      if (Array.isArray(data)) {
        data.forEach(fixImages);
        return;
      }

      for (const key in data) {
        if (key === "image" && typeof data[key] === "string") {
          // If already a full URL (Cloudinary or any CDN), keep it
          if (data[key].startsWith("http")) return;

          // Fallback ONLY for old local images (if any still exist)
          data[key] = `${API_URL}/uploads/${data[key]}`;
        } else {
          fixImages(data[key]);
        }
      }
    };

    fixImages(response.data);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
