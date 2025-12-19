import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const role = localStorage.getItem("role");

  let tokenKey = null;
  if (role === "customer") tokenKey = "customerToken";
  if (role === "restaurant") tokenKey = "restaurantToken";
  if (role === "agent") tokenKey = "agentToken";
  if (role === "admin") tokenKey = "adminToken";

  const token = tokenKey ? localStorage.getItem(tokenKey) : null;

  const isAuthRoute =
    config.url.includes("/login") || config.url.includes("/register");

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
