import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function Customers() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/admins/customers").then((res) => setList(res.data));
  }, []);

  // 🔍 FILTER LOGIC
  const filteredCustomers = list.filter((c) => {
    const q = search.toLowerCase();

    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customers</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {/* 🧾 CARDS */}
      {filteredCustomers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No matching customers found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-2xl">
          {filteredCustomers.map((c) => (
            <div
              key={c._id}
              className=" bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold mb-1">{c.name}</h3>

              <p className="text-sm text-gray-400 mb-2">{c.email}</p>

              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Phone:</span> {c.phone}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}