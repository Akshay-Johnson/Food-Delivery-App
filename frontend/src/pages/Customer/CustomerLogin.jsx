import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";

export default function CustomerLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/customers/login", form);

      // ⭐ Save token
      localStorage.setItem("token", res.data.token);

      alert("Customer Logged In Successfully");
      window.location.href = "/customer/dashboard";
    } catch (error) {
      console.error("Login Failed:", error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <AuthLayout title="Customer Login">
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
