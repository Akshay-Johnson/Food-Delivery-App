import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await api.get("/api/admins/reviews");
    setReviews(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/api/admins/reviews/${id}`);
    load();
  };

  // 🔍 filter reviews
  const filteredReviews = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.restaurantId?.name?.toLowerCase().includes(q) ||
      r.customerId?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  // 🧠 group by restaurant
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
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Reviews Moderation</h2>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search by restaurant, customer, or comment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-black/40 border border-white/20"
      />

      {Object.values(grouped).length === 0 && (
        <p className="text-gray-400">No reviews found</p>
      )}

      {/* 🏬 Restaurant-wise display */}
      {Object.values(grouped).map(({ restaurant, reviews }) => (
        <div key={restaurant._id} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">
            {restaurant.name}
          </h3>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="border border-white/20 p-3 rounded"
              >
                <p className="text-sm text-gray-300">
                  <b>{r.customerId?.name}</b>
                </p>
                <p className="mt-1">{r.comment}</p>

                <button
                  onClick={() => remove(r._id)}
                  className="text-red-400 text-sm mt-2"
                >
                  Delete Review
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
