import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import RoleSwitcher from "../../components/RoleSwitcher";
import api from "../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../components/toast/toast";
import { Eye, EyeOff } from "lucide-react";

export default function RestaurantRegister() {
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!form.email) {
      setToast({ type: "error", message: "Email is required" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/restaurants/send-otp", {
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

      await api.post("/api/restaurants/register", {
        ...form,
        otp,
      });

      setToast({
        type: "success",
        message: "Registration successful 🎉",
      });

      setTimeout(() => {
        navigate("/restaurant/login");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Restaurant Register">
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
            <label className="block text-sm text-gray-300 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter restaurant name"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Enter restaurant address"
            className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email"
            className="w-full px-4 py-2 rounded-md bg-black/40 text-white border border-white/20"
          />
        </div>

        {/* PASSWORDS */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
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
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Confirm password"
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
        <div className="flex gap-3 mt-6 justify-center">
          {!otpSent ? (
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="w-30 bg-blue-600 text-white py-2 rounded-md"
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
            onClick={() => navigate("/restaurant/login")}
            className="w-30 bg-blue-600 text-white py-2 rounded-md
              cursor-pointer "
          >
            Back to Login
          </button>
        </div>
      </form>

      <RoleSwitcher />
    </AuthLayout>
  );
}
