import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
        const res = await api.post('/api/admins/login', form);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", "admin");
    localStorage.setItem("user", JSON.stringify(res.data.admin));

    alert("Admin Logged In Successfully");
    navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login Failed:", error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <AuthLayout title="Admin Login">
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

        <div className="flex gap-3 mt-4 justify-center">
          <button className="w-1/2 bg-blue-600 text-white py-2 rounded-md">
            Login
          </button>

          {/* <Link 
                        to="/admin/register"
                        className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-md"
                    >
                        Register
                    </Link> */}
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
