import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  LogOut,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CustomerProfile() {
  const [user, setUser] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchDefaultAddress();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/customers/profile");
      setUser(res.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const res = await api.get("/api/address/default");
      setDefaultAddress(res.data);
    } catch (err) {
      console.error("Failed to load default address", err);
    }
  };

  if (!user) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white flex items-center justify-center py-12 px-4 ">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center pb-5">
            <h1 className="text-4xl  font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-blue-600 text-white bg-clip-text drop-shadow-lg">
              My Profile
            </h1>
          </div>

          {/* Card */}
          <div className="  bg-black/90 rounded-2xl p-8 shadow-2xl border border-white   transition-all  hover:scale-[1.01]">
            {/* Avatar Section */}
            <div className="flex justify-end gap-2">
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

            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={user.profileImage || "/assets/default-avatar.png"}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/40 shadow-xl transition-transform hover:scale-105"
                />
              </div>

              <p className="text-2xl font-bold mt-4">{user.name}</p>
              <p className="text-gray-300 flex items-center gap-2">
                <Mail size={16} /> {user.email}
              </p>
            </div>

            {/* Info */}
            <div className="space-y-6 text-gray-200">
              <div className="flex items-center gap-5 bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                <Phone className="text-blue-400" size={18} />
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {user.phone || "Not added"}
                </p>

                <Calendar className="text-blue-400" size={18} />
                <p>
                  <span className="font-semibold">Member since:</span>{" "}
                  {new Date(user.createdAt).toDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                <MapPin className="text-blue-400" size={18} />
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {defaultAddress ? (
                    <>
                      {defaultAddress.addressLine1}
                      {defaultAddress.addressLine2 &&
                        `, ${defaultAddress.addressLine2}`}
                      , {defaultAddress.city}, {defaultAddress.state} -{" "}
                      {defaultAddress.pincode}
                      {defaultAddress.type && ` (${defaultAddress.type})` }
                    </>
                  ) : (
                    "No default address added"
                  )}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10 gap-4 h-8 text-sm">
              <button
                onClick={() => navigate("/customer/profile/edit")}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg shadow-lg shadow-blue-900/40 transition-all"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

              <button
                onClick={() => navigate("/customer/address")}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg shadow-lg shadow-green-900/40 transition-all"
              >
                <MapPin size={18} />
                Manage Addresses
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/customer/login";
                }}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg shadow-lg shadow-red-900/40 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
