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
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">{r.customerId?.name}</p>
              <span className="text-sm text-gray-400">
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
          </div>
        ))}
      </div>
    </div>
  );
}
