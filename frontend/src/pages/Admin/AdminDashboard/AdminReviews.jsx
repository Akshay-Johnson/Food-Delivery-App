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

  /* 📄 PAGINATION */
  const [page, setPage] = useState(1);
  const [restaurantsPerPage, setRestaurantsPerPage] = useState(2);

  /* ======================
     GRID CALCULATION
  ====================== */
  const CARD_WIDTH = 300; // review card width
  const ROWS = 2;

  const calculateRestaurantsPerPage = () => {
    const sidebarWidth = 100;
    const padding = 48;
    const availableWidth =
      window.innerWidth - sidebarWidth - padding;

    const columns = Math.floor(availableWidth / CARD_WIDTH);
    return Math.max(columns, 1) * ROWS;
  };

  /* ======================
     LOAD REVIEWS
  ====================== */
  const load = async () => {
    const res = await api.get("/api/reviews/admin/all");
    setReviews(res.data || []);
    setPage(1);
  };

  useEffect(() => {
    load();
  }, []);

  /* ======================
     HANDLE RESIZE
  ====================== */
  useEffect(() => {
    const update = () => {
      setRestaurantsPerPage(calculateRestaurantsPerPage());
      setPage(1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* 🔁 RESET PAGE ON SEARCH */
  useEffect(() => {
    setPage(1);
  }, [search]);

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

  /* 🧠 GROUP BY RESTAURANT */
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

  Object.values(grouped).forEach((g) =>
    g.reviews.sort((a, b) => a.rating - b.rating)
  );

  /* 📄 PAGINATION */
  const restaurantsArray = Object.values(grouped);
  const totalPages = Math.ceil(
    restaurantsArray.length / restaurantsPerPage
  );

  const paginatedRestaurants = restaurantsArray.slice(
    (page - 1) * restaurantsPerPage,
    page * restaurantsPerPage
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews Moderation</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by restaurant, customer, or comment..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
      />

      {paginatedRestaurants.map(({ restaurant, reviews }) => (
        <div key={restaurant._id} className="mb-12">
          {/* RESTAURANT HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-blue-400">
              {restaurant.name}
            </h3>

            <div className="flex items-center gap-1 text-sm">
              <Stars rating={Math.round(averageRating(reviews))} />
              <span className="text-gray-300">
                ({averageRating(reviews)})
              </span>
            </div>
          </div>

          {/* REVIEW GRID – AUTO FILL, 2 ROWS */}
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {reviews.map((r) => (
              <div
                key={r._id}
                className={`relative bg-black/60 border border-white/20 rounded-xl p-5 ${
                  r.isHidden ? "opacity-50" : ""
                }`}
              >
                {r.isFlagged && (
                  <span className="absolute top-2 right-2 text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                    🚩 Reported
                  </span>
                )}

                <p className="text-sm text-gray-400">
                  {r.customerId?.name || "Unknown"}
                </p>

                <Stars rating={r.rating} />

                <p className="text-sm text-gray-300 mt-2">{r.comment}</p>

                <div className="flex justify-between mt-4 text-sm">
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

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
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
    </div>
  );
}
