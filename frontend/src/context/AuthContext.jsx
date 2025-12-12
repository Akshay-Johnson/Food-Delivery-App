import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    try {
      if (
        storedRole &&
        storedToken &&
        storedUser &&
        storedUser !== "undefined" &&
        storedUser !== "null"
      ) {
        const parsedUser = JSON.parse(storedUser);

        setRole(storedRole);
        setToken(storedToken);
        setUser(parsedUser);

        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Invalid stored user data:", storedUser);
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const Login = async (selectedRole, credentials) => {
    let route = "";
    switch (selectedRole) {
      case "customer":
        route = "/api/customers/login";
        break;
      case "restaurant":
        route = "/api/restaurants/login";
        break;
      case "agent":
        route = "/api/agents/login";
        break;
      case "admin":
        route = "/api/admins/login";
        break;
      default:
        throw new Error("Invalid role");
    }

    const res = await api.post(route, credentials);

    const token = res.data.token;

    const userData =
      res.data.admin ||
      res.data.customer ||
      res.data.restaurant ||
      res.data.agent;

    setToken(token);
    setRole(selectedRole);
    setUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("role", selectedRole);
    localStorage.setItem("user", JSON.stringify(userData));

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return res.data;
  };

  const Logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, Login, Logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
