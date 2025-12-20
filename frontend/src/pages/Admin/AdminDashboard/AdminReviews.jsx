import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

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

/* ⭐ AVG RATING */
function averageRating(reviews) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / reviews.length).toFixed(1);
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await api.get("/api/reviews/admin/all");

    setReviews(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  /* 🔁 HIDE / UNHIDE */
  const toggleHide = async (id, isHidden) => {
    await api.put(`/api/reviews/admin/${id}/hide`, {
      isHidden: !isHidden,
    });

    load();
  };

  /* 🚩 FLAG */
  const flagReview = async (id) => {
    await api.put(`/api/reviews/admin/${id}/flag`);

    load();
  };

  /* 🔍 FILTER */
  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.restaurantId?.name?.toLowerCase().includes(q) ||
      r.customerId?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  /* 🧠 GROUP + SORT (LOWEST RATING FIRST) */
  const grouped = filtered.reduce((acc, r) => {
    const id = r.restaurantId._id;
    if (!acc[id]) {
      acc[id] = {
        restaurant: r.restaurantId,
        reviews: [],
      };
    }
    acc[id].reviews.push(r);
    return acc;
  }, {});

  Object.values(grouped).forEach((g) => {
    g.reviews.sort((a, b) => a.rating - b.rating);
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews Moderation</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by restaurant, customer, or comment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-black/40 border border-white/20 text-white"
      />

      {Object.values(grouped).map(({ restaurant, reviews }) => (
        <div key={restaurant._id} className="mb-12">
          {/* RESTAURANT HEADER */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-400">
              {restaurant.name}
            </h3>

            <div className="flex items-center gap-2 text-sm">
              <Stars rating={Math.round(averageRating(reviews))} />
              <span className="text-gray-300">({averageRating(reviews)})</span>
            </div>
          </div>

          {/* REVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div
                key={r._id}
                className={`relative bg-black/60 border border-white/20 rounded-xl p-5 ${
                  r.isHidden ? "opacity-50" : ""
                }`}
              >
                {/* FLAGS */}
                {r.isFlagged && (
                  <span
                    className="absolute top-2 right-2 flex items-center gap-1
                   text-xs bg-red-600/20 text-red-400
                   border border-red-500/30 px-2 py-1 rounded"
                  >
                    🚩 Reported
                  </span>
                )}

                <p className="text-sm text-gray-400">
                  {r.customerId?.name || "Unknown"}
                </p>

                <Stars rating={r.rating} />

                <p className="text-sm text-gray-300 mt-2">{r.comment}</p>

                {/* ACTIONS */}
                <div className="flex justify-between items-center mt-4 text-sm">
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
        </div>
      ))}
    </div>
  );
}
