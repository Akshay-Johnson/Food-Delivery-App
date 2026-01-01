import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { MessageSquare, ArrowLeft } from "lucide-react";

/* ⭐ STAR RENDER */
function Stars({ rating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? "text-yellow-400" : "text-gray-500"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { restaurantId } = useParams(); // ✅ restaurant from URL

  const [reviews, setReviews] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const reviewsPerPage = 15;

  /* LOAD REVIEWS FOR ONE RESTAURANT */
  const load = async () => {
    const res = await api.get(`/api/reviews/admin/restaurant/${restaurantId}`);

    setReviews(res.data.reviews || []);
    setRestaurant(res.data.restaurant || null);
    setPage(1);
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  /* ACTIONS */
  const toggleHide = async (id, isHidden) => {
    await api.put(`/api/reviews/admin/${id}/hide`, {
      isHidden: !isHidden,
    });
    load();
  };

  const flagReview = async (id) => {
    await api.put(`/api/reviews/admin/${id}/flag`);
    load();
  };

  /* SEARCH FILTER (within this restaurant) */
  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.customerId?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="text-white max-w-7xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-black/70 hover:bg-gray-600 rounded-md shadow-md transition border border-white/20"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-2xl font-bold">
            Reviews - {restaurant?.name || "Restaurant"}
          </h2>
          <p className="text-sm text-gray-400">
            <MessageSquare className="inline-block w-4 h-4 mr-1" />{" "}
            {reviews.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by customer or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:ml-auto w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {paginatedReviews.length === 0 ? (
        <p className="text-center text-gray-400 py-2  ">No reviews found.</p>
      ) : (
        <>
          {/* REVIEWS GRID */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5
                       gap-4  p-4 rounded-xl"
            style={{
              backgroundImage: "url('/assets/review-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {paginatedReviews.map((r) => (
              <div
                key={r._id}
                className={`bg-black/70 border border-white/30 rounded-xl p-3
                flex flex-col gap-2 shadow-lg
                ${r.isHidden ? "opacity-50" : ""}`}
              >
                {r.isFlagged && (
                  <span className="text-xs text-red-400 font-semibold">
                    🚩 Reported
                  </span>
                )}

                <p className="font-semibold text-gray-300 truncate">
                  {r.customerId?.name || "Unknown"}
                </p>

                <Stars rating={r.rating} />

                {/* COMMENT — compact */}
                <p className="text-gray-200 text-sm line-clamp-3">
                  {r.comment}
                </p>

                {/* ACTIONS */}
                <div className="mt-auto flex justify-between text-sm pt-2">
                  <button
                    onClick={() => toggleHide(r._id, r.isHidden)}
                    className="text-blue-400 hover:text-blue-500"
                  >
                    {r.isHidden ? "Unhide" : "Hide"}
                  </button>

                  {!r.isFlagged && (
                    <button
                      onClick={() => flagReview(r._id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Flag
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
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
