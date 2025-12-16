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
      <h2 className="text-2xl font-bold mb-4">Customers</h2>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-gray-400 py-4 text-center">
                No matching customers found.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((c) => (
              <tr key={c._id} className="border-b border-white/20">
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
