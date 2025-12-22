import { useState } from "react";
import api from "../../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../components/toast/toast";

export default function AddMenuItem() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // IMAGE UPLOAD (matches your backend)
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
    } catch (error) {
      console.error(
        "Image upload failed:",
        error.response?.data || error.message
      );
      setToast({ type: "error", message: "Image upload failed" });
    }
  };

  // ADD MENU ITEM
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/menu", {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
      });

      setToast({ type: "success", message: "Menu item added successfully!" });
      setTimeout(() => {
        navigate("/restaurant/dashboard/menu");
        setToast(null);
      }, 3000);
    } catch (error) {
      console.error("Add menu failed:", error.response?.data || error.message);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Add menu failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Add Menu Item</h1>
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="bg-black/70 p-6 rounded-2xl border border-white/20 max-w-2xl mx-auto">
        <form onSubmit={submit} className="space-y-4">
          {/* Image */}
          <div className="flex flex-col items-center">
            <img
              src={(form.image || "/assets/dishimage.jpg") + "?t=" + Date.now()}
              className="w-80 h-40 rounded-2xl object-cover border border-white/30"
            />

            <label className="mt-6 mb-2 cursor-pointer bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              Upload Image
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dish Name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              rows="3"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {/* Price */}
          <div className="flex items-center justify-end gap-4">
            <input
              type="number"
              className="w-100 mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded "
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              type="text"
              className="w-100 mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Add Menu Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
