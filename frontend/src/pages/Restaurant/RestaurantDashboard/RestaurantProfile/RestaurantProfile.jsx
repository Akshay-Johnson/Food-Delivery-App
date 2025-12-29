import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";
import Toast from "../../../../components/toast/toast";

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

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-1 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">Restaurant Profile</h1>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="bg-black/70 p-6 rounded-xl border border-white/20 w-full max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={
                (form.image || "/assets/restaurant.png") + "?t=" + Date.now()
              }
              className="w-80 h-40 rounded-lg object-cover border border-white/30"
              alt="Restaurant"
            />

            <label className="mt-3 cursor-pointer bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* NAME & PHONE */}
          <div className="flex gap-2">
            <input
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Restaurant Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* DESCRIPTION & ADDRESS */}
          <div className="flex gap-2">
            <textarea
              rows="3"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* CUISINE */}
          <input
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
            placeholder="Cuisine Type"
            value={form.cuisineType}
            onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
          />

          <input
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
            placeholder="New Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* TIME */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Opening Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
                value={form.openingTime}
                onChange={(e) =>
                  setForm({ ...form, openingTime: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm">Closing Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
                value={form.closingTime}
                onChange={(e) =>
                  setForm({ ...form, closingTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* SAVE */}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex gap-2 items-center mx-auto"
          >
            <Save size={18} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
