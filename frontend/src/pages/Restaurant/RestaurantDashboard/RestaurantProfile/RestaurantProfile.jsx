import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Upload, Save, User, Phone, MapPin, AlignLeft, Utensils, Lock, Clock } from "lucide-react";
import Toast from "../../../../components/toast/toast";
import ResponsiveImage from "../../../../components/ResponsiveImage";
import LocationPicker from "../../../../components/LocationPicker";

export default function RestaurantProfile() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    description: "",
    address: "",
    cuisineType: "",
    openingTime: "",
    closingTime: "",
    image: "",
    password: "",
    location: { lat: 9.9312, lng: 76.2673 },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/restaurants/profile");

      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        description: res.data.description || "",
        address: res.data.address || "",
        cuisineType: res.data.cuisineType || "",
        openingTime: res.data.openingTime || "",
        closingTime: res.data.closingTime || "",
        image: res.data.image || "",
        password: "",
        location: res.data.location || { lat: 9.9312, lng: 76.2673 },
      });

      setLoading(false);
    } catch (error) {
      console.error(
        "Error loading profile:",
        error.response?.data || error.message
      );
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

      setForm((prev) => ({ ...prev, image: res.data.imageUrl }));
      setToast({ type: "success", message: "Image uploaded successfully!" });
    } catch (error) {
      console.error(
        "Image upload error:",
        error.response?.data || error.message
      );
      setToast({ type: "error", message: "Image upload failed" });
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put("/api/restaurants/profile", form);
      setToast({ type: "success", message: "Profile updated successfully!" });
      loadProfile();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      setToast({ type: "error", message: "Profile update failed" });
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
    <div className="min-h-screen text-white flex items-center justify-center py-6 px-4">
      {/* Background layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10" />

      <div className="w-full max-w-5xl relative z-10 space-y-6">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        <div className="bg-black/70 p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Header */}
          <div className="text-center border-b border-white/10 pb-4">
            <h1 className="text-2xl font-black tracking-tight">Restaurant Profile Settings</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Configure restaurant storefront details</p>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: FIELDS */}
            <div className="space-y-4">
              
              {/* Banner Image Display */}
              <div className="flex flex-col items-center space-y-3 pb-2 border-b border-white/5">
                <div className="relative group w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/45 shadow-inner">
                  <ResponsiveImage
                    src={form.image || "/assets/restaurant.png"}
                    className="w-full h-full object-cover opacity-85 transition duration-300 group-hover:scale-[1.02]"
                    alt="Restaurant Banner"
                  />
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white px-4 py-2 rounded-xl text-xs font-bold text-gray-300 transition active:scale-95">
                  <Upload size={14} className="text-orange-400" />
                  Upload Storefront Banner
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Restaurant Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <User size={16} />
                    </span>
                    <input
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                      placeholder="Restaurant Name"
                      value={form.name}
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
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Cuisine & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Cuisines Type</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Utensils size={16} />
                    </span>
                    <input
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                      placeholder="Cuisine Type"
                      value={form.cuisineType}
                      onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Change Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                      placeholder="Leave blank to keep same"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Opening Time</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Clock size={16} />
                    </span>
                    <input
                      required
                      type="time"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner cursor-pointer"
                      value={form.openingTime}
                      onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Closing Time</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <Clock size={16} />
                    </span>
                    <input
                      required
                      type="time"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner cursor-pointer"
                      value={form.closingTime}
                      onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Store Description</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-5 text-gray-500">
                    <AlignLeft size={16} />
                  </span>
                  <textarea
                    required
                    rows="3"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner resize-none"
                    placeholder="Provide a storefront description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ADDRESS & LOCATION MAP */}
            <div className="flex flex-col justify-between space-y-4">
              
              {/* Address Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Store Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <MapPin size={16} />
                  </span>
                  <input
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition text-sm shadow-inner"
                    placeholder="Store Address Location"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Location Picker Map */}
              <div className="flex-1 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={16} className="text-orange-400" />
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Pin Store Coordinates
                  </label>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/35 p-3 flex-1 flex flex-col justify-center">
                  <LocationPicker
                    value={form.location}
                    onChange={(loc) => setForm((prev) => ({ ...prev, location: loc }))}
                  />
                </div>
              </div>

            </div>

            {/* SAVE BUTTON (Full Col Span in Grid) */}
            <div className="lg:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/10 active:scale-[0.98] transition cursor-pointer"
              >
                <Save size={16} />
                Save Changes Settings
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
