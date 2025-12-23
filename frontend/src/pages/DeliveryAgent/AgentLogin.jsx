import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { messaging } from "../../firebase";
import { getToken } from "firebase/messaging";
import api from "../../api/axiosInstance";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function AgentLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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
      await Login("agent", form);
      await saveAgentToken();

      setToast({ type: "success", message: "Login successful 🎉" });

      setTimeout(() => {
        setToast(null);
        navigate("/agent/dashboard");
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
    <AuthLayout title="Agent Login">
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
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="Enter your email"
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
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="Enter your password"
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
