import { useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CustomerAddAddress() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "Home",
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/api/address/add", form);
    navigate("/customer/address");
  };

  return (
    <div className="min-h-screen bg-black/90 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Add Address</h1>

      <form onSubmit={submit} className="space-y-4 max-w-md">

        {Object.keys(form).map((key) => (
          <div key={key}>
            <label className="text-gray-300 capitalize">{key}</label>

            <input
              type="text"
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 rounded bg-black/40 border border-white/20 outline-none"
            />
          </div>
        ))}

        <button className="w-full bg-blue-600 py-2 rounded-md hover:bg-blue-700">
          Save Address
        </button>
      </form>
    </div>
  );
}
