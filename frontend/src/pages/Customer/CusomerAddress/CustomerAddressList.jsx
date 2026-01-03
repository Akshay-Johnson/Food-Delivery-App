import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash, Edit, Star, Loader, Home, ArrowLeft } from "lucide-react";

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
    <div className="relative min-h-screen pt-10 bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-20">
          <h1 className="text-4xl font-extrabold pl-2 ">My Addresses</h1>
          <div className="flex gap-4 mr-2">
            <Link
              to="/customer/address/add"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus /> Add New Address
            </Link>
            <Link
              to="/customer/dashboard"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Home />
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <ArrowLeft />
            </button>{" "}
          </div>
        </div>
        {addresses.length === 0 && <p>No addresses found. Please add one.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pl-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white relative"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
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

                <div className="flex flex-col gap-2">
                  <div className="relative group">
                    <button
                      onClick={() =>
                        navigate(`/customer/address/edit/${address._id}`)
                      }
                      className="bg-blue-500 px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Edit size={16} />
                    </button>

                    <span
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2
                                bg-black text-white text-xs px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      Edit
                    </span>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => deleteAddress(address._id)}
                      className="bg-red-600 px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Trash size={16} />
                    </button>

                    <span
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2
                                bg-black text-white text-xs px-2 py-1 rounded
                                opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      Delete
                    </span>
                  </div>

                  {!address.isDefault && (
                    <div className="relative group">
                      <button
                        onClick={() => setDefault(address._id)}
                        className="bg-yellow-500 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Star size={16} />
                      </button>

                      <span
                        className="absolute left-full ml-2 top-1/2 -translate-y-1/2
                                  bg-black text-white text-xs px-2 py-1 rounded
                                  opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                      >
                        Set Default
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
