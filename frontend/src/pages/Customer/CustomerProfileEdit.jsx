import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CustomerEditProfile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load existing profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/customers/profile");
      setForm({
        name: res.data.name,
        phone: res.data.phone,
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
      alert("Profile updated successfully!");
      navigate("/customer/profile");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert(error.response?.data?.message || "Update failed");
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
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-black/80 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 max-w-md mx-auto">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Profile Image </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 mt-1 rounded bg-black/40 border border-white/20 text-white outline-none"
            />

            {/* Display current profile image */}
            {form.profileImage && (
              <img
                src={form.profileImage}
                alt="Profile"
                className="mt-2 w-24 h-24 object-cover rounded-full"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 rounded bg-black/40 border border-white/20 text-white outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 mt-1 rounded bg-black/40 border border-white/20 text-white outline-none"
              value={form.email}
              placeholder={"Email cannot be changed"}
              disabled
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 rounded bg-black/40 border border-white/20 text-white outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Phone</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 rounded bg-black/40 border border-white/20 text-white outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>

        <button
          className="mt-4 w-full bg-gray-600 py-2 rounded-md hover:bg-gray-700"
          onClick={() => navigate("/customer/profile")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
