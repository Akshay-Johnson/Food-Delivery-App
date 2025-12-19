import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Edit, Star, Loader, Home } from "lucide-react";

export default function CustomerAddressList() {
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    LoadAddresses();
  }, []);

  const LoadAddresses = async () => {
    try {
      const res = await api.get("/api/address");
      setAddresses(res.data);
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/api/address/delete/${id}`);
      LoadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const setDefault = async (id) => {
    try {
      await api.put(`/api/address/default/${id}`, {});
      LoadAddresses();
    } catch (error) {
      console.error("Failed:", error.response?.data || error);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/assets/address/address.jpg')] text-white p-6">
      <div className="flex justify-between items-center mb-20">
        <h1 className="text-4xl font-extrabold">My Addresses</h1>
        <div className="flex gap-4">
           <Link
            to="/customer/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Home /> Home
          </Link>
          <Link
            to="/customer/address/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus /> Add New Address
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            ← Back
          </button>{" "}
        </div>
      </div>
      {addresses.length === 0 && <p>No addresses found. Please add one.</p>}

      {addresses.map((address) => (
        <div
          key={address._id}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-4 shadow-lg border border-black border-2 relative"
        >
          <div className="flex justify-between">
            <div className="pointer-events-auto">
              <p className="text-lg font-bold">{address.fullName}</p>
              <p className="text-gray-300">{address.phone}</p>
              <p className="text-gray-300">
                {address.addressLine1}, {address.city}, {address.state} –{" "}
                {address.pincode}
                {address.type && ` (${address.type})`}
              </p>

              {address.isDefault && (
                <p className="text-yellow-400 mt-1 flex items-center gap-1">
                  <Star size={16} /> Default Address
                </p>
              )}
            </div>

            {/* FIXED BUTTON CONTAINER */}
            <div className="flex flex-col gap-2 relative z-10 pointer-events-auto">
              <button
                onClick={() =>
                  navigate(`/customer/address/edit/${address._id}`)
                }
                className="bg-blue-500 px-3 py-1 rounded flex items-center gap-1"
              >
                <Edit size={16} /> Edit
              </button>

              <button
                onClick={() => deleteAddress(address._id)}
                className="bg-red-600 px-3 py-1 rounded flex items-center gap-1"
              >
                <Trash size={16} /> Delete
              </button>

              {!address.isDefault && (
                <button
                  onClick={() => setDefault(address._id)}
                  className="bg-yellow-500 px-3 py-1 rounded flex items-center gap-1"
                >
                  <Star size={16} /> Set Default
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
