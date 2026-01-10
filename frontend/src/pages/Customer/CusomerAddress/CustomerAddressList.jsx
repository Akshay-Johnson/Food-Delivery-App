import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Edit, Star, Home, ArrowLeft } from "lucide-react";

export default function CustomerAddressList() {
  const [addresses, setAddresses] = useState([]);
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
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const setDefault = async (id) => {
    try {
      await api.put(`/api/address/default/${id}`, {});
      loadAddresses();
    } catch (error) {
      console.error("Failed:", error.response?.data || error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            My Addresses
          </h1>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/customer/address/add"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-2 rounded text-sm sm:text-base"
            >
              <Plus size={18} /> Add
            </Link>

            <Link
              to="/customer/dashboard"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-2 rounded text-sm sm:text-base"
            >
              <Home size={18} />
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-3 py-2 rounded text-sm sm:text-base"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {addresses.length === 0 && (
          <p className="text-center text-gray-300">
            No addresses found. Please add one.
          </p>
        )}

        {/* Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 flex flex-col justify-between"
            >
              {/* Info */}
              <div>
                <p className="text-lg font-bold break-words">
                  {address.fullName}
                </p>
                <p className="text-gray-300 text-sm">{address.phone}</p>

                <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                  {address.addressLine1}, {address.city}, {address.state} –{" "}
                  {address.pincode}
                  {address.type && ` (${address.type})`}
                </p>

                {address.isDefault && (
                  <p className="text-yellow-400 mt-2 flex items-center gap-1 text-sm">
                    <Star size={14} /> Default Address
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Edit */}
                <button
                  onClick={() =>
                    navigate(`/customer/address/edit/${address._id}`)
                  }
                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded text-xs sm:text-sm"
                >
                  <Edit size={14} /> Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteAddress(address._id)}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs sm:text-sm"
                >
                  <Trash size={14} /> Delete
                </button>

                {/* Set Default */}
                {!address.isDefault && (
                  <button
                    onClick={() => setDefault(address._id)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded text-xs sm:text-sm text-black"
                  >
                    <Star size={14} /> Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
