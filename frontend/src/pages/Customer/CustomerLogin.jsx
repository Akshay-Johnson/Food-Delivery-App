import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerFCMToken } from "../../services/notification";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function CustomerLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
      await Login("customer", form);
      setToast({ type: "success", message: "Login successful 🎉" });

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setTimeout(() => {
          registerFCMToken();
        }, 300);
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
        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Emailllll</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
          />
        </div>

        {/* PASSWORD WITH TOGGLE */}
        <div className="mb-4 relative">
          <label className="block text-sm text-gray-300 mb-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full px-4 py-2 pr-12 rounded-md bg-black/40 text-white border border-white/20"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="w-1/2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-md"
          >
            Login
          </button>

          <Link
            to="/customer/register"
            className="w-1/2 text-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-md"
          >
            Register?
          </Link>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
