import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AgentLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { Login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const result = await Login("agent", form);

      console.log("AGENT LOGIN SUCCESS RESULT:", result);

      alert("Login Successful");

      // Important: timeout ensures extension scripts cannot interrupt navigation
      setTimeout(() => {
        navigate("/agent/dashboard");
      }, 50);

    } catch (error) {
      console.error("ADMIN LOGIN FAILED:", error);
      alert(error?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <AuthLayout title="Agent Login">
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
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-2 rounded-md"
          >
            Login
          </button>
          <button
            type="button"
           className="w-1/2 bg-blue-600 text-white py-2 rounded-md"
            onClick={() => navigate("/agent/register")}
          >
            Register?
          </button>

        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
