import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";

export default function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, []);

  const loadItem = async () => {
    try {
      const res = await api.get(`/api/menu/${id}`);
      setForm(res.data);
    } catch (error) {
      console.error("Error loading menu item:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECT IMAGE UPLOAD (MATCHES YOUR BACKEND)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profileImage", file); // ✅ must match backend

    try {
      const res = await api.post("/api/upload/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ backend returns: { imageUrl }
      setForm({ ...form, image: res.data.imageUrl });
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Image upload failed");
    }
  };

  // ✅ CORRECT UPDATE API
  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/menu/${id}`, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
      });

      alert("Menu item updated!");
      navigate("/restaurant/dashboard/menu");
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Update failed");
    }
  };

  if (loading) return <p className="text-white p-6">Loading menu item...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Menu Item</h1>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          
          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={(form.image || "/assets/dishimage.jpg") + "?t=" + Date.now()}
              className="w-40 h-40 rounded-lg object-cover border border-white/30"
            />

            <label className="mt-3 cursor-pointer bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              Upload New Image
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm">Dish Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm">Description</label>
            <textarea
              rows="3"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm">Price</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm">Category</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
