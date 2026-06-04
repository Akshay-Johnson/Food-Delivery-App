import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Flag, Star, Search, AlertCircle, MessageSquare } from "lucide-react";
import Toast from "../../../../components/toast/toast";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  /* SEARCH */
  const [search, setSearch] = useState("");

  /* PAGINATION */
  const [page, setPage] = useState(1);
  const reviewsPerPage = 15;

  const loadReviews = async () => {
    try {
      const res = await api.get("/api/reviews/restaurant/my-reviews");
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  /* REPORT REVIEW */
  const report = async (id) => {
    if (!window.confirm("Report this review to admin?")) return;

    try {
      await api.put(`/api/reviews/restaurant/${id}/report`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isFlagged: true } : r))
      );
      setToast({ type: "success", message: "Review reported to admin" });
    } catch {
      setToast({ type: "error", message: "Failed to report review" });
    }
  };

  /* SEARCH FILTER */
  const filteredReviews = reviews.filter((r) => {
    const name = r.customerId?.name?.toLowerCase() || "";
    const comment = r.comment?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      comment.includes(search.toLowerCase())
    );
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading customer reviews...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-7xl mx-auto space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Customer Reviews</h2>
          <p className="text-xs text-gray-400 mt-1">Read feedback from clients and flag inappropriate comments</p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
          />
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No matching reviews found.</p>
        </div>
      ) : (
        <>
          {/* REVIEWS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedReviews.map((r) => (
              <div
                key={r._id}
                className="bg-black/70 border border-white/20 rounded-2xl p-4 flex flex-col justify-between relative hover:border-orange-500/30 transition duration-300 shadow-lg min-h-[220px]"
              >
                {/* REPORT BUTTON */}
                <div className="absolute top-4 right-4 z-10">
                  {r.isFlagged ? (
                    <span 
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/25 border border-red-500/40 text-red-500"
                      title="Reported to admin"
                    >
                      <Flag size={12} fill="currentColor" />
                    </span>
                  ) : (
                    <button
                      onClick={() => report(r._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 hover:border-red-500 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
                      title="Report Review"
                    >
                      <Flag size={12} />
                    </button>
                  )}
                </div>

                {/* USER INFO */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-12 h-12 object-cover rounded-full border border-white/10 bg-white/5"
                      src={
                        r.customerId?.profileImage?.trim()
                          ? r.customerId.profileImage
                          : "/assets/customer.png"
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/customer.png";
                      }}
                      alt="Customer"
                    />

                    <div className="min-w-0 pr-8">
                      <p className="font-bold text-white truncate text-sm">
                        {r.customerId?.name || "Anonymous"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* STARS */}
                  <div className="flex gap-0.5 border-t border-b border-white/5 py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-700"
                        }
                      />
                    ))}
                  </div>

                  {/* COMMENT */}
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 pt-1 font-medium">
                    "{r.comment}"
                  </p>
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
        </>
      )}
    </div>
  );
}
