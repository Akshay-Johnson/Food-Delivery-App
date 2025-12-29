import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Flag, Star } from "lucide-react";
import Toast from "../../../../components/toast/toast";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  //  Pagination
  const [page, setPage] = useState(1);
  const reviewsPerPage = 15;

  const loadReviews = async () => {
    try {
      const res = await api.get("/api/reviews/restaurant/my-reviews");

      console.log("Restaurant Reviews API:", res.data);

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

  const report = async (id) => {
    if (!window.confirm("Report this review to admin?")) return;

    try {
      await api.put(`/api/reviews/restaurant/${id}/report`);

      // Update local state so UI shows "Reported"
      setReviews((prev) =>
        prev.map((review) =>
          review._id === id ? { ...review, isFlagged: true } : review
        )
      );

      setToast({ type: "success", message: "Review reported to admin" });
    } catch (error) {
      console.error("Failed to report review", error);
      setToast({ type: "error", message: "Failed to report review" });
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {paginatedReviews.map((r) => (
              <div
                key={r._id}
                className="bg-black/70 border border-white/20 rounded-lg p-4 flex justify-between flex-col h-full relative"
              >
                <div className="flex items-center mb-2 ">
                  <img
                    className="w-16 h-16 object-cover rounded-full border border-white/30 mr-4"
                    src={
                      r.customerId?.profileImage?.trim()
                        ? r.customerId.profileImage
                        : "/assets/customer.png"
                    }
                    alt="Customer"
                  />

                  <div className="absolute top-2 right-2 flex items-center text-sm">
                    {r.isFlagged ? (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <Flag size={14} className="text-red-400" />
                        Reported
                      </span>
                    ) : (
                      <button
                        onClick={() => report(r._id)}
                        className="flex items-center text-green-400 hover:text-red-500"
                      >
                        <Flag size={14} className="mr-1 text-green-400" />
                        Report
                      </button>
                    )}
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
