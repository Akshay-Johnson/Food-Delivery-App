import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";
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

  //image upload
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
      setToast({ type: "success", message: "Profile updated successfully" });
      await loadProfile();
    } catch (error) {
      console.error("Profile update failed:", error);
      setToast({ type: "error", message: "Update failed" });
    }
  };

  if (loading) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="p-6 text-white flex items-center m-auto justify-center mt-15">
      <div className="bg-black/70 p-6 rounded-xl border border-white/20 w-full max-w-xl">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <form onSubmit={submit} className="space-y-4">
          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={
                form.image && form.image.trim() !== ""
                  ? form.image
                  : "/assets/agent.png"
              }
              alt="Agent Avatar"
              className="w-40 h-40 object-cover border border-white/30"
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

          {/* NAME */}
          <div className="flex items-end gap-2">
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.phone}
              placeholder="Phone"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="New Password"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* VEHICLE TYPE */}
          <div>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.vehicleType}
              placeholder="Vehicle Type (e.g., Bike, Car)"
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value })
              }
            />
          </div>

          {/* VEHICLE NUMBER */}
          <div>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.vehicleNumber}
              placeholder="Vehicle Number (e.g., ABC-1234)"
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
            />
          </div>

          {/* SUBMIT */}
          <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2 m-auto">
            <Save size={18} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
