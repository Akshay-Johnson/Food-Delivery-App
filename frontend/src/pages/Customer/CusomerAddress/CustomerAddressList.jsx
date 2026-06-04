import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Edit, Star, Home, ArrowLeft, MapPin, Phone, User } from "lucide-react";
import Toast from "../../../components/toast/toast";

export default function CustomerAddressList() {
  const [addresses, setAddresses] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await api.get("/api/address");
      setAddresses(res.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/api/address/delete/${id}`);
      loadAddresses();
      setToast({ type: "success", message: "Address deleted successfully!" });
    } catch (error) {
      console.error("Error deleting address:", error);
      setToast({ type: "error", message: "Failed to delete address" });
    }
  };

  const setDefault = async (id) => {
    try {
      await api.put(`/api/address/default/${id}`, {});
      loadAddresses();
      setToast({ type: "success", message: "Default address updated!" });
    } catch (error) {
      console.error("Failed:", error.response?.data || error);
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-zinc-950/40">
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center -z-20 pointer-events-none opacity-40 filter blur-[2px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10 pointer-events-none" />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Addresses</h1>
            <p className="text-xs text-gray-400 mt-1">Manage delivery locations and set default destinations</p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto shrink-0">
            <Link to="/customer/address/add">
              <button className="h-10 px-4 rounded-xl flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs transition shadow-lg shadow-orange-500/10 cursor-pointer">
                <Plus size={14} />
                Add Address
              </button>
            </Link>

            <Link to="/customer/dashboard">
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition cursor-pointer" title="Dashboard">
                <Home size={16} />
              </button>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="h-10 px-4 rounded-xl flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {addresses.length === 0 ? (
          <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
            <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
              <MapPin size={32} />
            </div>
            <p className="text-gray-400 text-base font-medium">No saved addresses found.</p>
            <Link to="/customer/address/add" className="inline-block">
              <button className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">
                Add Address
              </button>
            </Link>
          </div>
        ) : (
          /* ADDRESS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="bg-black/70 border border-white/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-orange-500/30 transition duration-300 min-h-[220px]"
              >
                <div className="space-y-3">
                  {/* HEADER */}
                  <div className="flex justify-between items-start gap-2 border-b border-white/5 pb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-white text-base truncate flex items-center gap-1.5">
                        <User size={14} className="text-gray-500 shrink-0" />
                        {address.fullName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-500 shrink-0" />
                        {address.phone}
                      </p>
                    </div>

                    {address.type && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-gray-400 uppercase tracking-wide">
                        {address.type}
                      </span>
                    )}
                  </div>

                  {/* ADDRESS TEXT */}
                  <div className="flex gap-2 text-xs leading-relaxed text-gray-300">
                    <MapPin size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-3">
                      {address.addressLine1}, {address.city}, {address.state} – {address.pincode}
                    </p>
                  </div>

                  {address.isDefault && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                      <Star size={10} className="fill-amber-400" /> Default Address
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/customer/address/edit/${address._id}`)}
                      className="h-8 px-3 rounded-lg flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <Edit size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteAddress(address._id)}
                      className="h-8 px-3 rounded-lg flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <Trash size={12} />
                      Delete
                    </button>
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => setDefault(address._id)}
                      className="h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-xs font-bold text-black transition cursor-pointer"
                    >
                      <Star size={12} />
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
