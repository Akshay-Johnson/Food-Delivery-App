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

  /* IMAGE UPLOAD */
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
      console.error("Image upload failed:", error);
      setToast({ type: "error", message: "Image upload failed" });
    }
  };

  /* SUBMIT */
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
      }, 2000);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Add menu failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Add Menu Item
      </h1>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="bg-black/70 p-4 sm:p-6 rounded-2xl border border-white/20 max-w-xl mx-auto">
        <form onSubmit={submit} className="space-y-4">
          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={(form.image || "/assets/dishimage.jpg") + "?t=" + Date.now()}
              className="w-full max-w-md h-40 sm:h-44 rounded-xl object-cover border border-white/30"
              alt="Dish"
            />

            <label className="mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              Upload Image
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* NAME */}
          <input
            type="text"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dish Name"
            required
          />

          {/* DESCRIPTION */}
          <textarea
            rows="3"
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            required
          />

          {/* PRICE + CATEGORY */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              type="text"
              className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-60 mx-auto"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Add Menu Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
