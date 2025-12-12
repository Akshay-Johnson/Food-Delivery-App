import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Upload, Save } from "lucide-react";

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

  useEffect(() => {
    loadProfile();
  }, []);

  // ✅ FIXED PROFILE LOAD
  const loadProfile = async () => {
    try {
      const res = await api.get("/api/agents/profile");

      setForm({
        name: res.data.agent.name || "",
        email: res.data.agent.email || "",
        phone: res.data.agent.phone || "",
        password: "",
        vehicleType: res.data.agent.vehicleType || "",
        vehicleNumber: res.data.agent.vehicleNumber || "",
        image: res.data.agent.image || "",
        status: res.data.agent.status || "",
      });
    } catch (error) {
      console.error("Failed to load agent profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMAGE UPLOAD WORKING
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

  // ✅ FIXED UPDATE API ROUTE
  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put("/api/agents/profile", form);
      alert("Profile updated successfully");
      loadProfile();
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Update failed");
    }
  };

  if (loading) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Agent Profile</h1>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-2xl">
        <form onSubmit={submit} className="space-y-4">

          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <img
              src={form.image || "/assets/agent-avatar.png"}
              className="w-36 h-36 rounded-full object-cover border border-white/30"
            />

            <label className="mt-3 cursor-pointer bg-blue-600 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} />
              Upload Image
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm">Name</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm">Phone</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm">New Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* VEHICLE TYPE */}
          <div>
            <label className="text-sm">Vehicle Type</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            />
          </div>

          {/* VEHICLE NUMBER */}
          <div>
            <label className="text-sm">Vehicle Number</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({ ...form, vehicleNumber: e.target.value })
              }
            />
          </div>

          {/* SUBMIT */}
          <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}
