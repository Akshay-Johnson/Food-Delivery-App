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
  ArrowLeft,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center py-12 px-4">
      {/* Background with Ambient Glow */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center -z-20 opacity-30 filter blur-[3px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-lg relative z-10 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-4 rounded-xl flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition font-bold text-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          
          <Link to="/customer/dashboard">
            <button className="h-10 px-4 rounded-xl flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white transition text-xs font-bold cursor-pointer shadow-lg shadow-orange-500/10">
              <Home size={14} />
              Home
            </button>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-black/70 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Avatar and Name */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-rose-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <img
                src={user.profileImage || "/assets/customer.png"}
                alt="avatar"
                className="relative w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-400">
                <User size={12} className="text-orange-400" />
                Customer Account
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Email */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Mail size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-semibold truncate text-white">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Phone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-sm font-semibold text-white">{user.phone || "Not added yet"}</p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Calendar size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-semibold text-white">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Default Address */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                <MapPin size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Address</p>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {defaultAddress ? (
                    <>
                      {defaultAddress.addressLine1}
                      {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}
                      , {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded">
                        {defaultAddress.type || "Home"}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 italic">No default address selected</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <button
              onClick={() => navigate("/customer/profile/edit")}
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/10 active:scale-[0.98] transition cursor-pointer"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>

            <button
              onClick={() => navigate("/customer/address")}
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer"
            >
              <MapPin size={14} className="text-orange-400" />
              Manage Addresses
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/customer/login";
              }}
              className="w-full sm:col-span-2 py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-extrabold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer"
            >
              <LogOut size={14} />
              Log Out of Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
