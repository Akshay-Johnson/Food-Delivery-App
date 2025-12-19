import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
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
    image: "",
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
        headers: { "Content-Type": "multipart/form-data" },
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
    <div className="p-6 text-white flex flex-col items-center m-auto">
      <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>

      <div className="bg-black/70 p-6 rounded-xl border border-white/20 max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={
                (form.image || "/assets/restaurantimage.jpeg") +
                "?t=" +
                new Date().getTime()
              }
              className="w-80 h-40 rounded-lg object-cover border border-white/30"
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

          {/* Name */}
          <div className="flex row gap-2 ">
            <input
              type="text"
              className="w-100 mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              placeholder="Restaurant Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

  

          {/* Description */}
          <div className="flex row gap-2">
          
            <textarea
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              rows="3"
              value={form.description}
              placeholder="Description"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
             <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.address}
              placeholder="Address"
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Address */}
          <div className="flex row gap-2">
                <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.password}
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.cuisineType}
              placeholder="Cusine"
              onChange={(e) =>
                setForm({ ...form, cuisineType: e.target.value })
              }
            />

          </div>

          {/* Opening / Closing Time */}
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <label className="text-sm">Opening Time</label>
              <input
                type="time"
                className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded "
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
                className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
                value={form.closingTime}
                onChange={(e) =>
                  setForm({ ...form, closingTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* Submit */}
          <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex justify-end gap-2 mx-auto items-center">
            <Save size={18} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
