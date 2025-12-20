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

  /* 🔍 FILTER LOGIC */
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
      <h2 className="text-2xl font-bold mb-6">Restaurants</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email, or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {/* 🧾 CARDS */}
      {filteredRestaurants.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No matching restaurants found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-2xl">
          {filteredRestaurants.map((r) => (
            <div
              key={r._id}
              className="bg-black/70 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between"
            >
              {/* INFO */}
              <div>
                <h3 className="text-lg font-semibold mb-1">{r.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{r.email}</p>

                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full capitalize ${
                    r.status === "approved"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-red-600/20 text-red-400"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {/* ACTION */}
              <button
                className={`mt-5 py-2 rounded-lg font-medium transition ${
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
                {r.status === "approved" ? "Block Restaurant" : "Approve Restaurant"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
