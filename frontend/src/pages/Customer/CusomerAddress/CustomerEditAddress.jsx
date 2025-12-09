import { useState, useEffect } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

export default function CustomerEditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const [loading, setLoading] = useState(true);

  // Load the selected address
  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      const res = await api.get("/api/address");
      const address = res.data.find((a) => a._id === id);

      if (!address) return alert("Address not found.");

      setForm({
        fullName: address.fullName || "",
        phone: address.phone || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        isDefault: address.isDefault || false,
      });
      
      setLoading(false);

    } catch (error) {
      console.error("Failed to load address:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/address/update/${id}`, form);
      alert("Address updated successfully");
      navigate("/customer/address");
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-black/80 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Address</h1>

      <div className="bg-white/10 p-6 rounded-xl max-w-md mx-auto border border-white/20">

        <form onSubmit={submit} className="space-y-4">

          <input
            className="w-full p-2 rounded bg-black/40 border border-white/20"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <input
            className="w-full p-2 rounded bg-black/40 border border-white/20"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="w-full p-2 rounded bg-black/40 border border-white/20"
            placeholder="Address Line 1"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              className="p-2 rounded bg-black/40 border border-white/20"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              className="p-2 rounded bg-black/40 border border-white/20"
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <input
            className="w-full p-2 rounded bg-black/40 border border-white/20"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
            Set as Default Address
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>

        <button
          className="mt-4 w-full bg-gray-700 py-2 rounded hover:bg-gray-600"
          onClick={() => navigate("/customer/address")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
