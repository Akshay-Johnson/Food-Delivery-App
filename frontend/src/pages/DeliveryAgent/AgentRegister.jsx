import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function AgentRegister() {
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await api.post("/api/agents/register", form);
      setToast({ type: "success", message: "Registration Successful 🎉" });

      setTimeout(() => {
        setToast(null);
        navigate("/agent/login");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Registration Failed",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AuthLayout title="Delivery Agent Register">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={submit}>
        {/* NAME & PHONE */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Email</label>
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

        {/* PASSWORDS */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PASSWORD */}
          <div className="relative">
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

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-2 pr-12 rounded-md bg-black/40 text-white border border-white/20"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-[38px] text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-2 rounded-md"
          >
            Register
          </button>

          <Link
            to="/agent/login"
            className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-md"
          >
            Back to Login
          </Link>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
