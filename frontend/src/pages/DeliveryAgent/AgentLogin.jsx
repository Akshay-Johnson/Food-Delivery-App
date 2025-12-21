import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import AuthInput from "../../components/AuthInput";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { messaging } from "../../firebase";
import { getToken } from "firebase/messaging";
import api from "../../api/axiosInstance";
import Toast from "../../components/toast/toast";

export default function AgentLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { Login } = useAuth();

  const saveAgentToken = async () => {
    try {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        await api.post("/api/agents/save-fcm-token", {
          fcmToken: token,
        });
        console.log("Agent FCM token saved");
      }
    } catch (err) {
      console.error("Failed to save agent FCM token:", err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const result = await Login("agent", form);
      console.log("AGENT LOGIN SUCCESS:", result);

      await saveAgentToken();
      setToast({ type: "success", message: "Login successful 🎉" });
      setTimeout(() => {
        setToast(null);
        navigate("/agent/dashboard");
      }, 1200);
    } catch (error) {
      console.error("AGENT LOGIN FAILED:", error?.response?.data || error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Login failed",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <AuthLayout title="Agent Login">
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
