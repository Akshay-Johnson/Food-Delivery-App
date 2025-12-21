import { useState, useEffect } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerFCMToken } from "../../services/notification";
import Toast from "../../components/toast/toast";

export default function CustomerLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const data = await Login("customer", form);
      setToast({ type: "success", message: "Login successful 🎉" });

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await registerFCMToken();
      }
      setTimeout(() => {
        setToast(null);  
        navigate("/customer/dashboard");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Login failed",
      });

      setTimeout(() => setToast(null), 3000);

    }
  };

  return (
    <AuthLayout title="Customer Login">
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
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex gap-3 mt-4">
          <button className="w-1/2 bg-blue-600 text-white py-2 rounded-md">
            Login
          </button>

          <Link
            to="/customer/register"
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
