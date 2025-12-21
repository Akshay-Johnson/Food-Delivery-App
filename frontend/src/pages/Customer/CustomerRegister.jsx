import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/toast/toast";

export default function CustomerRegister() {
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await api.post("/api/customers/register", form);
      setToast({ type: "success", message: "Registration successful 🎉" });

      setTimeout(() => {
        navigate("/customer/login");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Registration failed",
      });

      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AuthLayout title="Customer Register">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={submit}>
        <div className="mb-4 flex flex-row gap-4">
          <AuthInput
            label="Name"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <AuthInput
            label="Phone"
            type="tel"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="mb-4 flex flex-row gap-4">
        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />
        </div>

        {/* Same row buttons like login */}
        <div className="flex gap-3 mt-4">
          <button className="w-1/2 bg-blue-600 text-white py-2 rounded-md">
            Register
          </button>

          <Link
            to="/customer/login"
            className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-md"
          >
            Back to Login ?
          </Link>
        </div>
      </form>

      <div className="mt-6">
        <RoleSwitcher />
      </div>
    </AuthLayout>
  );
}
