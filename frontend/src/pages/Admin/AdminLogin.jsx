import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
      await Login("admin", form);
      setToast({ type: "success", message: "Login Successful 🎉" });
      setTimeout(() => {
        setToast(null);
        navigate("/admin/dashboard");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Login Failed",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AuthLayout title="Admin Login">
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

        {/* PASSWORD WITH TOGGLE */}
        <div className="relative">
          <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex gap-3 mt-4 justify-center">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-2 rounded-md"
          >
            Login
          </button>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
