import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ NEW
import api from "../../../api/axiosInstance";

export default function Restaurants() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate(); // ⭐ NEW

  // Pagination
  const [page, setPage] = useState(1);
  const restaurantsPerPage = 10;

  const loadData = async () => {
    const res = await api.get("/api/admins/restaurants");
    setList(res.data || []);
  };

  const toggleStatus = async (id, value) => {
    await api.put(`/api/admins/restaurant/status/${id}`, { status: value });
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  /* 🔍 FILTER */
  const filteredRestaurants = list.filter((r) => {
    const q = search.toLowerCase();
    const displayStatus = r.status === "approved" ? "approved" : "blocked";
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      displayStatus.includes(q)
    );
  });

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
  const startIndex = (page - 1) * restaurantsPerPage;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + restaurantsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="text-white">
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-2xl font-bold">Restaurants</h2>

        <input
          type="text"
          placeholder="Search by name, email, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {paginatedRestaurants.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No matching restaurants found.
        </p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {paginatedRestaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/admin/dashboard/reviews/${r._id}`)}
                className="cursor-pointer bg-black/70 backdrop-blur-lg border border-white/20
                           rounded-xl p-4 flex flex-col h-70 hover:bg-white/10 transition"
              >
                {/* IMAGE */}
                <img
                  src={r.image || "/assets/restaurant.png"}
                  alt={r.name}
                  className="w-full h-25 object-cover rounded-md"
                />

                {/* NAME + STATUS */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {r.name}
                  </h3>

                  <span
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      r.status === "approved"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* EMAIL */}
                <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                  {r.email}
                </p>

                {/* RATING */}
                <p className="text-sm text-yellow-400 font-semibold mt-1">
                  ⭐ {r.averageRating?.toFixed(1) || "0.0"}
                </p>

                {/* ACTION BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ⭐ IMPORTANT
                    toggleStatus(
                      r._id,
                      r.status === "approved" ? "blocked" : "approved"
                    );
                  }}
                  className={`mt-auto w-full py-2 rounded-lg font-medium transition ${
                    r.status === "approved"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {r.status === "approved"
                    ? "Block Restaurant"
                    : "Approve Restaurant"}
                </button>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
