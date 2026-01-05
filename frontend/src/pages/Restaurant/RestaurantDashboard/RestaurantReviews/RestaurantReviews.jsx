import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Flag, Star } from "lucide-react";
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

  if (loading) return <p className="text-white">Loading reviews...</p>;

  return (
    <div className="text-white">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold whitespace-nowrap">
          Customer Reviews
        </h2>

        <input
          type="text"
          placeholder="Search by name or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {filteredReviews.length === 0 ? (
        <p className="text-gray-400">No matching reviews found.</p>
      ) : (
        <>
          {/* ================= REVIEWS GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {paginatedReviews.map((r) => (
              <div
                key={r._id}
                className="
    bg-black/70 border border-white/20 rounded-lg
    p-3 sm:p-4
    flex flex-col justify-between relative
    min-h-[180px] sm:min-h-[200px]
  "
              >
                {/* USER INFO */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    className="w-12 h-12 object-cover rounded-full border border-white/30"
                    src={
                      r.customerId?.profileImage?.trim()
                        ? r.customerId.profileImage
                        : "/assets/customer.png"
                    }
                    alt="Customer"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {r.customerId?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* REPORT */}
                  {r.isFlagged ? (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <Flag size={14} /> Reported
                    </span>
                  ) : (
                    <button
                      onClick={() => report(r._id)}
                      className="flex items-center gap-1 text-xs text-green-400 hover:text-red-500"
                    >
                      <Flag size={14} /> Report
                    </button>
                  )}
                </div>

                {/* STARS */}
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i <= r.rating ? "text-yellow-400" : "text-gray-600"
                      }
                    />
                  ))}
                </div>

                {/* COMMENT */}
                <p className="text-white/80 text-sm line-clamp-4">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
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
