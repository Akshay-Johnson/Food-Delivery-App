import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Trash } from "lucide-react";

/* ⭐ STAR RENDER HELPER */
function renderStars(rating = 0) {
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
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  /* LOAD REVIEWS */
  const load = async () => {
    const res = await api.get("/api/admins/reviews");
    setReviews(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  /* DELETE REVIEW */
  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await api.delete(`/api/admins/reviews/${id}`);
    load();
  };

  /* 🔍 FILTER */
  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.restaurantId?.name?.toLowerCase().includes(q) ||
      r.customerId?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  /* 🧠 GROUP BY RESTAURANT */
  const grouped = filteredReviews.reduce((acc, review) => {
    const rid = review.restaurantId?._id;
    if (!acc[rid]) {
      acc[rid] = {
        restaurant: review.restaurantId,
        reviews: [],
      };
    }
    acc[rid].reviews.push(review);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews Moderation</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by restaurant, customer, or comment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {Object.values(grouped).length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No reviews found.
        </p>
      )}

      {/* 🏬 RESTAURANT GROUPS */}
      {Object.values(grouped).map(({ restaurant, reviews }) => (
        <div key={restaurant._id} className="mb-10">
          <h3 className="text-xl font-semibold text-white mb-4">
            {restaurant.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-2xl max-w-3xl">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between"
              >
                {/* INFO */}
                <div>
                  <p className="font-medium mb-2">
                    Name: {r.customerId?.name || "Unknown"}
                  </p>

                  {/* ⭐ STARS */}
                  <div className="mb-2">
                    {renderStars(r.rating)}
                  </div>

                  {/* 💬 COMMENT */}
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {r.comment}
                  </p>
                </div>

                {/* ACTION */}
                <button
                  onClick={() => remove(r._id)}
                  className="mt-4 text-sm text-red-400 hover:text-red-500 transition self-end"
                >
                 <Trash/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
