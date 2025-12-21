import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Star } from "lucide-react";
import Toast from "../../../../components/toast/toast";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const reviewsPerPage = 5;

  const loadReviews = async () => {
    try {
      const res = await api.get("/api/reviews/restaurant/my-reviews");
      setReviews(res.data || []);
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const report = async (id) => {
    if (!window.confirm("Report this review to admin?")) return;
    await api.put(`/api/reviews/restaurant/${id}/report`);
    setToast({ type: "success", message: "Review reported to admin" });
  };

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = reviews.slice(
    startIndex,
    startIndex + reviewsPerPage
  );

  if (loading) return <p className="text-white">Loading reviews...</p>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {toast && <Toast type={toast.type} message={toast.message} />}

      {reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet.</p>
      ) : (
        <>
          {/* REVIEWS LIST */}
          <div className="space-y-4">
            {paginatedReviews.map((r) => (
              <div
                key={r._id}
                className="bg-black/70 border border-white/20 rounded-lg p-4 max-w-2xl"
              >
                <div className="flex items-center mb-2 ">
                  <img
                    className="w-12 h-12 object-cover rounded-full border border-white/30 mr-4"
                    src={
                      r.customerId?.profileImage?.trim()
                        ? r.customerId.profileImage
                        : "/assets/default-avatar.png"
                    }
                    alt="Customer"
                  />

                  <div>
                    <p className="font-semibold">
                      {r.customerId?.name || "Anonymous"}
                    </p>
                    <span className="text-sm text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
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

                <p className="text-white/80">{r.comment}</p>

                {r.isFlagged ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-red-400">
                    🚩 Reported
                  </span>
                ) : (
                  <button
                    onClick={() => report(r._id)}
                    className="mt-3 text-sm text-red-400 hover:text-red-500"
                  >
                    Report to Admin
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
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
