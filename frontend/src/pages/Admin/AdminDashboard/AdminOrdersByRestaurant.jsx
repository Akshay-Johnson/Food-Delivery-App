import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axiosInstance";
import { ArrowLeft } from "lucide-react";

export default function AdminOrdersByRestaurant() {
  const { restaurantId } = useParams();

  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 15;

  useEffect(() => {
    api.get(`/api/admins/orders/restaurant/${restaurantId}`).then((res) => {
      setOrders(res.data.orders || []);
      setRestaurant(res.data.restaurant || null);
      setPage(1);
    });
  }, [restaurantId]);

  /* FILTER */
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id?.toLowerCase().includes(q) ||
      o.customerId?.name?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      String(o.totalPrice).includes(q)
    );
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  useEffect(() => setPage(1), [search]);

  return (
    <div className="text-white max-w-7xl mx-auto px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        {/* LEFT: BACK + TITLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-black/70 hover:bg-gray-600 rounded-md shadow-md transition border border-white/20"
          >
            <ArrowLeft size={16} />
          </button>

          <h2 className="text-2xl font-bold truncate max-w-[70vw] sm:max-w-none">
            Orders – {restaurant?.name || "Restaurant"}
          </h2>
        </div>

        {/* RIGHT: SEARCH */}
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 sm:ml-auto px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {paginatedOrders.map((o) => (
          <div
            key={o._id}
            className="bg-black/70 border border-white/20 rounded-xl p-4 flex flex-col"
          >
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="text-blue-400 text-sm break-all mb-2">{o._id}</p>

            <p className="text-sm text-gray-300 line-clamp-1">
              <span className="text-gray-400">Customer:</span>{" "}
              {o.customerId?.name || "—"}
            </p>

            <span
              className={`mt-2 w-fit px-3 py-1 text-xs rounded-full capitalize ${
                o.status === "delivered"
                  ? "bg-green-600/20 text-green-400"
                  : o.status === "cancelled"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-yellow-600/20 text-yellow-400"
              }`}
            >
              {o.status}
            </span>

            <div className="mt-auto flex justify-between text-sm pt-3">
              <span className="text-green-400 font-semibold">
                ₹{o.totalPrice}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
