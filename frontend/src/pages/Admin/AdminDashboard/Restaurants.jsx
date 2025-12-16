import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function Restaurants() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    const res = await api.get("/api/admins/restaurants");
    setList(res.data);
  };

  const toggleStatus = async (id, value) => {
    await api.put(`/api/admins/restaurant/status/${id}`, { status: value });
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔍 FILTER LOGIC
  const filteredRestaurants = list.filter((r) => {
    const q = search.toLowerCase();

    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Restaurants</h2>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name, email, or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredRestaurants.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-gray-400 py-4 text-center">
                No matching restaurants found.
              </td>
            </tr>
          ) : (
            filteredRestaurants.map((r) => (
              <tr key={r._id} className="border-b border-white/20">
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td className="capitalize">{r.status}</td>
                <td>
                  <button
                    className={`px-3 py-1 rounded ${
                      r.status === "approved"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() =>
                      toggleStatus(
                        r._id,
                        r.status === "approved" ? "blocked" : "approved"
                      )
                    }
                  >
                    {r.status === "approved" ? "Block" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
