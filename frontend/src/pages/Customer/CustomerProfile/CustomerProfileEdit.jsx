import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
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
    <div
      className="
  relative
  min-h-screen
  text-white
  p-6
  bg-cover
  bg-center
  bg-[url('/assets/profile/editprofile.jpg')]
"
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-20">

      <h1 className="text-3xl font-bold mb-16 mt-10 text-center">
        Edit Profile
      </h1>

      <div className=" bg-black/90 rounded-xl p-6 border border-black border-2 max-w-md mx-auto ">
        <div className="flex justify-end  mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition mb-4 align-middle"
        >
          ← Back
        </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">Profile Image </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 mt-1 rounded bg-white border border-white/40 text-black outline-none"
            />

            {/* Display current profile image */}
            {form.profileImage && (
              <img
                src={form.profileImage}
                alt="Profile"
                className="mt-2 w-14 h-14 object-cover rounded-full"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 rounded bg-white border border-white/40 text-black outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 rounded bg-white border border-white/40 text-black outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Phone</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 rounded bg-white border border-white/40 text-black outline-none"
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
          className="mt-4 w-full bg-black/40 py-2 rounded-md hover:bg-gray-700"
          onClick={() => navigate("/customer/profile")}
        >
          Cancel
        </button>
        </div>
      </div>
    </div>
  );
}
