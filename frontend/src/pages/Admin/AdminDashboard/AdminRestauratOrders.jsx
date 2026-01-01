import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

export default function AdminRestaurantOrders() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState(""); // ✅ FIX
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // 🔢 Pagination config (3 rows × 5 cols)
  const perPage = 15;

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    api.get("/api/admins/restaurants").then((res) => {
      setRestaurants(res.data || []);
      setPage(1);
    });
  }, []);

  /* ================= SEARCH FILTER ================= */
  const filteredRestaurants = restaurants.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredRestaurants.length / perPage);

  const startIndex = (page - 1) * perPage;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + perPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="text-white max-w-7xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders by Restaurant</h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search restaurant name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {/* GRID — 5 COLUMNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {paginatedRestaurants.map((r) => (
          <button
            key={r._id}
            onClick={() =>
              navigate(`/admin/dashboard/orders/restaurant/${r._id}`)
            }
            className="bg-black/70 border border-white/20 rounded-xl overflow-hidden
                       hover:scale-[1.03] transition transform text-left flex flex-col"
          >
            {/* IMAGE */}
            <img
              src={r.image || "/assets/restaurant.png"}
              alt={r.name}
              className="w-full h-32 object-cover"
            />

            {/* CONTENT */}
            <div className="p-3 flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                {/* NAME */}
                <p className="font-semibold text-gray-200 truncate">
                  {r.name}
                </p>

                {/* RATING */}
                <p className="text-sm text-yellow-400 font-semibold">
                  ⭐ {r.averageRating?.toFixed(1) || "0.0"}
                </p>
              </div>

              {/* ORDER COUNT */}
              <p className="text-sm text-blue-400 mt-auto">
                🧾 {r.orderCount || 0} orders
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-green-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
