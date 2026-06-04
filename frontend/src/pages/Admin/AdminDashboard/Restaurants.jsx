import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { Search, Mail, Ban, CheckCircle, AlertCircle, Star, MessageSquare } from "lucide-react";

export default function Restaurants() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Pagination
  const [page, setPage] = useState(1);
  const restaurantsPerPage = 10;

  /* ================= LOAD DATA ================= */
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

  /* ================= FILTER ================= */
  const filteredRestaurants = list.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const paginatedRestaurants = filteredRestaurants.slice(
    (page - 1) * restaurantsPerPage,
    page * restaurantsPerPage
  );

  useEffect(() => setPage(1), [search]);

  /* ================= STATUS COUNTS ================= */
  const approvedCount = list.filter((r) => r.status === "approved").length;
  const pendingCount = list.filter((r) => r.status === "pending").length;
  const blockedCount = list.filter((r) => r.status === "blocked").length;

  return (
    <div className="text-white max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Restaurants</h2>
          <p className="text-xs text-gray-400 mt-1">Audit merchant accounts, reviews, and approval state</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
            />
          </div>

          {/* COUNTS */}
          <div className="flex gap-2 text-xs font-bold shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Approved: {approvedCount}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Pending: {pendingCount}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Blocked: {blockedCount}
            </span>
          </div>
        </div>
      </div>

      {paginatedRestaurants.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No restaurants found matching your query.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedRestaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/admin/dashboard/reviews/${r._id}`)}
                className="cursor-pointer bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[320px] group"
              >
                <div className="space-y-3">
                  {/* IMAGE */}
                  <img
                    src={r.image || "/assets/restaurant.png"}
                    alt={r.name}
                    className="w-full h-28 object-cover border border-white/10 rounded-xl bg-white/5"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/restaurant.png";
                    }}
                  />

                  {/* NAME + STATUS */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <h3 className="font-bold text-white truncate text-sm group-hover:text-orange-400 transition">{r.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        r.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : r.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {/* EMAIL */}
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Mail size={10} />
                    {r.email}
                  </p>

                  {/* RATING + REVIEWS */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={12} className="fill-amber-400" />
                      <span>{r.averageRating?.toFixed(1) || "0.0"}</span>
                    </div>

                    <div className="flex items-center gap-1 text-blue-400 font-semibold">
                      <MessageSquare size={12} />
                      <span>{r.reviewCount || 0} reviews</span>
                    </div>
                  </div>
                </div>

                {/* ACTION */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(
                        r._id,
                        r.status === "approved" ? "blocked" : "approved"
                      );
                    }}
                    className={`w-full py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 text-white ${
                      r.status === "approved"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {r.status === "approved" ? (
                      <>
                        <Ban size={12} />
                        Block Merchant
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        Approve Merchant
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                      page === i + 1
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg"
                        : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
