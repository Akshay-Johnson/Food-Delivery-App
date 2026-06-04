import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Home, ArrowLeft, User, Phone, Lock, Save, X } from "lucide-react";
import Toast from "../../../components/toast/toast";

export default function CustomerEditProfile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
    password: "",
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/customers/profile");
      setForm({
        name: res.data.name,
        phone: res.data.phone || "",
        profileImage: res.data.profileImage || "",
        password: "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put("/api/customers/profile/edit", form);
      setToast({ type: "success", message: "Profile updated successfully!" });

      setTimeout(() => {
        setToast(null);
        navigate("/customer/profile");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Update failed",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await api.post("/api/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, profileImage: res.data.imageUrl }));
      setToast({ type: "success", message: "Avatar uploaded successfully!" });
    } catch (error) {
      console.error("Image upload failed:", error);
      setToast({ type: "error", message: "Avatar upload failed" });
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
    <div className="relative min-h-screen text-white flex items-center justify-center py-12 px-4">
      {/* Background and Ambient Layer */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center -z-20 opacity-30 filter blur-[3px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10" />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-4 rounded-xl flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition font-bold text-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          
          <Link to="/customer/dashboard">
            <button className="h-10 px-4 rounded-xl flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white transition text-xs font-bold cursor-pointer shadow-lg shadow-orange-500/10">
              <Home size={14} />
              Home
            </button>
          </Link>
        </div>

        {/* Edit Card container */}
        <div className="bg-black/70 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-md space-y-6">
          <h2 className="text-xl font-black text-center tracking-tight border-b border-white/10 pb-4">
            Edit Profile Settings
          </h2>

          <form onSubmit={submit} className="space-y-5">
            {/* Avatar Update Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-rose-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <img
                  src={form.profileImage || "/assets/customer.png"}
                  alt="Profile"
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white px-4 py-2 rounded-xl text-xs font-bold text-gray-300 transition active:scale-95">
                <Upload size={14} className="text-orange-400" />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    value={form.name}
                    placeholder="Enter full name"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
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
                    autoComplete="new-password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="grid grid-cols-2 gap-3.5 pt-4">
              <button
                type="submit"
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/10 active:scale-[0.98] transition cursor-pointer"
              >
                <Save size={14} />
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => navigate("/customer/profile")}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer"
              >
                <X size={14} className="text-red-400" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
