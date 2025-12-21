import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/toast/toast";

export default function RestaurantLogin() {
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
      await Login("restaurant", form);
      setToast({ type: "success", message: "Login Successful 🎉" });
      setTimeout(() => {
        setToast(null);
        navigate("/restaurant/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Login Failed:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Login Failed",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AuthLayout title="Restaurant Login">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={submit}>
        <AuthInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex gap-3 mt-4">
          <button
            className="w-1/2 bg-blue-600 text-white py-2 rounded-md"
            type="submit"
          >
            Login
          </button>

          <Link
            to="/restaurant/register"
            className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-md"
          >
            Register ?
          </Link>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
