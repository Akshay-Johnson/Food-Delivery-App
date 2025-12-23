import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore auth on refresh
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    let tokenKey = null;
    if (storedRole === "customer") tokenKey = "customerToken";
    if (storedRole === "restaurant") tokenKey = "restaurantToken";
    if (storedRole === "agent") tokenKey = "agentToken";
    if (storedRole === "admin") tokenKey = "adminToken";

    const storedToken = tokenKey ? localStorage.getItem(tokenKey) : null;

    if (storedToken && storedRole && storedUser) {
      try {
        setRole(storedRole);
        setUser(JSON.parse(storedUser));

        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch {
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const Login = async (selectedRole, credentials) => {
    let route = "";
    let tokenKey = "";

    switch (selectedRole) {
      case "customer":
        route = "/api/customers/login";
        tokenKey = "customerToken";
        break;
      case "restaurant":
        route = "/api/restaurants/login";
        tokenKey = "restaurantToken";
        break;
      case "agent":
        route = "/api/agents/login";
        tokenKey = "agentToken";
        break;
      case "admin":
        route = "/api/admins/login";
        tokenKey = "adminToken";
        break;
      default:
        throw new Error("Invalid role");
    }

    const res = await api.post(route, credentials);

    localStorage.setItem(tokenKey, res.data.token);
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    setRole(selectedRole);
    setUser(res.data.user);

    return res.data;
  };

  const Logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, Login, Logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
