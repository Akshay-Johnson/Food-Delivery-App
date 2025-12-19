import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function RestaurantReviews({ restaurantId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  console.log("AUTH USER:", user);
  const auth = useAuth();
  console.log("AUTH CONTEXT FULL:", auth);

  const loadReviews = async () => {
    const res = await api.get(`/api/reviews/${restaurantId}`);
    setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [restaurantId]);

  const submitReview = async () => {
    if (editingId) {
      await api.put(`/api/reviews/${restaurantId}/${editingId}`, {
        rating,
        comment,
      });
      setEditingId(null);
    } else {
      await api.post(`/api/reviews/${restaurantId}`, {
        rating,
        comment,
      });
    }
    setRating(5);
    setComment("");
    loadReviews();
  };

  const deleteReview = async (id) => {
    await api.delete(`/api/reviews/${restaurantId}/${id}`);
    loadReviews();
  };

  if (loading) return <p className="text-white">Loading reviews...</p>;

  const alreadyReviewed = reviews.some((r) => r.customerId?._id === user?._id);

  return (
    <div className="mt-10 text-white">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

      {/* Add Review */}
      {user && !alreadyReviewed && (
        <div className="bg-white/10 p-4 rounded-lg mb-6">
          <p className="mb-2 font-medium">Leave a Review</p>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={22}
                onClick={() => setRating(i)}
                className={`cursor-pointer ${
                  i <= rating ? "text-yellow-400" : "text-gray-500"
                }`}
              />
            ))}
          </div>

          <textarea
            className="w-full p-2 rounded bg-black/30 border border-white/20"
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            onClick={submitReview}
            className="mt-3 bg-green-600 px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r._id}
            className="bg-white/10 p-4 rounded-lg border border-white/20"
          >
            <div className="flex justify-between items-center">
              <p className="font-medium">{r.customerId?.name}</p>

              {String(r.customerId?._id) === String(user?._id) && (
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(r._id);
                      setRating(r.rating);
                      setComment(r.comment);
                    }}
                    className="text-blue-400"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteReview(r._id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </div>
              )}

              {r.customerId?._id === user?._id && (
                <button
                  onClick={() => deleteReview(r._id)}
                  className="text-red-400 text-sm"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="flex gap-1 my-1">
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

            <p className="text-sm text-white/80">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
