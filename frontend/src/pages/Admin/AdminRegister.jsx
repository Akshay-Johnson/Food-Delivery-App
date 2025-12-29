import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!form.email) {
      setToast({ type: "error", message: "Email is required" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/admins/send-otp", {
        email: form.email,
      });

      setOtpSent(true);
      setToast({
        type: "success",
        message: "OTP sent to your email 📩",
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= REGISTER ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      return;
    }

    if (!otp) {
      setToast({ type: "error", message: "Please enter OTP" });
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/admins/register", {
        ...form,
        otp,
      });

      setToast({
        type: "success",
        message: "Admin Registered Successfully 🎉",
      });

      setTimeout(() => {
        navigate("/admin/login");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Registration Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Register">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={submit}>
        {/* NAME */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
          />
        </div>

        {/* PASSWORDS */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* OTP */}
        {otpSent && (
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
            />
          </div>
        )}

        {/* ACTION BUTTON */}
        <div className="gap-3 flex flex-row m-auto justify-center align-center">
          <div className="flex  gap-3 mt-4">
            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="w-30 bg-blue-600 text-white py-2 rounded-md cursor-pointer"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-30 bg-green-600 text-white py-2 rounded-md"
              >
                {loading ? "Registering..." : "Verify & Register"}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="w-30 bg-blue-600 text-white py-2 rounded-md
              cursor-pointer "
            >
              Back to Login
            </button>
          </div>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
