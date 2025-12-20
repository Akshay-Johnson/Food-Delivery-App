import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Star } from "lucide-react";

export default function RestaurantReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const res = await api.get("/api/reviews/restaurant/my-reviews");
      setReviews(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load reviews", error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const report = async (id) => {
    if (!window.confirm("Report this review to admin?")) return;
    await api.put(`/api/reviews/restaurant/${id}/report`);
    alert("Review reported");
  };

  if (loading) return <p className="text-white">Loading reviews...</p>;

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {reviews.length === 0 && <p className="text-gray-400">No reviews yet.</p>}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="bg-black/70 border border-white/20 rounded-lg p-4 w-sm max-w-2xl"
          >
            <div className="flex items-between items-center mb-1 ">
              <img
                className="w-15 h-15 object-cover rounded-full border-2 border-white/30 mr-4"
                src={
                  r.customerId?.profileImage?.trim()
                    ? r.customerId.profileImage
                    : "/assets/default-avatar.png"
                }
              />

              <p className="font-semibold ">{r.customerId?.name}</p>
              <span className="text-sm text-gray-400 gap-2 ml-auto">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>

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
    </div>
  );
}
