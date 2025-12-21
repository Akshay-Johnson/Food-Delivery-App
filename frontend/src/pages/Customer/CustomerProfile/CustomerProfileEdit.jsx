import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { Home } from "lucide-react";
import Toast from "../../../components/toast/toast";

export default function CustomerEditProfile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    profileImage: "",
    password: "",
  });

  const [toast, setToast] = useState(null);
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

      setToast({ type: "success", message: "Profile updated successfully 🎉" });

      setTimeout(() => {
        setToast(null);
        navigate("/customer/profile");
      }, 1200);
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Update failed",
      });

      setTimeout(() => setToast(null), 3000);
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
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* TOAST */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-20">
          <h1 className="text-3xl font-bold pb-25 pt-10 text-center">
            Edit Profile
          </h1>

          <div className=" bg-black/90 rounded-xl p-6 border border-white border-2 max-w-md mx-auto ">
            <div className="flex justify-end  mb-4 gap-2">
              <Link to="/customer/dashboard">
                <button className="text-sm bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition mb-4 align-middle">
                  <Home />
                </button>
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="text-sm bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition mb-4 align-middle"
              >
                ← Back
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="flex flex-col justify-center items-center ">
                {/* Display current profile image */}
                {form.profileImage && (
                  <img
                    src={form.profileImage}
                    alt="Profile"
                    className="mb-4 w-20 h-20 object-cover "
                  />
                )}

                <label className="inline-flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition">
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <input
                  type="text"
                  className="w-full px-3 py-2 mt-1 rounded bg-white/5 border border-white text-white "
                  value={form.name}
                  placeholder="Name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <input
                  type="password"
                  className="w-full px-3 py-2 mt-1 rounded bg-white/5 border border-white/40 text-white outline-none"
                  placeholder="New Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div>
                <input
                  type="text"
                  className="w-full px-3 py-2 mt-1 rounded bg-white/5 border border-white/40 text-white outline-none"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/customer/profile")}
                  className="flex-1 bg-red-600 py-2 rounded-md hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
