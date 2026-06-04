import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Upload, Save, User, Phone, Lock, Truck, CreditCard, ShieldAlert } from "lucide-react";
import Toast from "../../../components/toast/toast";

export default function AgentProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "",
    vehicleNumber: "",
    image: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/agents/profile");

      setForm((prev) => ({
        ...prev,
        name: res.data.agent.name || "",
        email: res.data.agent.email || "",
        phone: res.data.agent.phone || "",
        password: "",
        vehicleType: res.data.agent.vehicleType || "",
        vehicleNumber: res.data.agent.vehicleNumber || "",
        image: res.data.agent.image ?? prev.image,
        status: res.data.agent.status || "",
      }));
    } catch (error) {
      console.error("Failed to load agent profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profileImage", file);

    try {
      const res = await api.post("/api/upload/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ ...form, image: res.data.imageUrl });
      setToast({ type: "success", message: "Profile image uploaded!" });
    } catch (error) {
      console.error("Image upload failed:", error);
      setToast({ type: "error", message: "Image upload failed" });
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      phone: form.phone,
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (form.image) {
      payload.image = form.image;
    }

    try {
      await api.put("/api/agents/profile", payload);
      setToast({ type: "success", message: "Profile updated successfully!" });
      await loadProfile();
    } catch (error) {
      console.error("Profile update failed:", error);
      setToast({ type: "error", message: "Update failed" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center py-12 px-4">
      {/* Background layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <div className="bg-black/70 p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center border-b border-white/10 pb-4">
            <h1 className="text-2xl font-black tracking-tight">Agent Profile Settings</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Manage your driver information</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-rose-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <img
                  src={
                    form.image && form.image.startsWith("http")
                      ? form.image
                      : "/assets/agent.png"
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/agent.png";
                  }}
                  alt="Agent Avatar"
                  className="relative w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white px-4 py-2 rounded-xl text-xs font-bold text-gray-300 transition active:scale-95">
                <Upload size={14} className="text-orange-400" />
                Change Image
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Status / Active Info Banner */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                form.status === "active" || form.status === "available" || form.status === "on-delivery"
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
              }`}>
                {form.status || "offline"}
              </span>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    value={form.name}
                    placeholder="Name"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    value={form.phone}
                    placeholder="Phone"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">New Password (leave empty to keep current)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="New Password"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Vehicle Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Vehicle Type</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Truck size={16} />
                    </span>
                    <input
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                      value={form.vehicleType}
                      placeholder="e.g. Motorcycle, Bicycle"
                      onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Vehicle Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <CreditCard size={16} />
                    </span>
                    <input
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                      value={form.vehicleNumber}
                      placeholder="e.g. KL-07-CD-1234"
                      onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Submit */}
            <button className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/10 active:scale-[0.98] transition cursor-pointer pt-4">
              <Save size={16} />
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
