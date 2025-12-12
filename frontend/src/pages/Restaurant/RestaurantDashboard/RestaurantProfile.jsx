import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";

export default function RestaurantProfile() {
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    description: "",
    address: "",
    cuisineType: "",
    openingTime: "",
    closingTime: "",
    image: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/restaurants/profile");
      setRestaurant(res.data);
      setForm(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profileImage", file);

    try {
      const res = await api.post("/api/upload/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm({ ...form, image: res.data.imageUrl });
      console.log("UPLOAD RESPONSE:", res.data);

    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put("/api/restaurants/profile", form);
      alert("Profile updated!");
      loadProfile();
    } catch (error) {
      alert("Update failed");
      console.error(error);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-2xl">

        <form onSubmit={submit} className="space-y-4">

          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={(form.image || "/assets/restaurantimage.jpeg") + "?t=" + new Date().getTime()}
              className="w-40 h-40 rounded-lg object-cover border border-white/30"
            />

            <label className="mt-3 cursor-pointer bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              Upload Image
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm">Restaurant Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        
            {/* Phone */}
          <div>
            <label className="text-sm">Phone</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
            {/* Password */}
          <div>
            <label className="text-sm">Password</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm">Address</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Cuisine */}
          <div>
            <label className="text-sm">Cuisine Type</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.cuisineType}
              onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
            />
          </div>

          {/* Opening / Closing Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Opening Time</label>
              <input
                type="time"
                className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm">Closing Time</label>
              <input
                type="time"
                className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}
