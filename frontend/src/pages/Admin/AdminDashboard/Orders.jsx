import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const ordersPerPage = 15;

  useEffect(() => {
    api.get("/api/admins/orders").then((res) => {
      setOrders(res.data || []);
      setPage(1);
    });
  }, []);

  /* 🔍 FILTER */
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id?.toLowerCase().includes(q) ||
      o.customerId?.name?.toLowerCase().includes(q) ||
      o.restaurantId?.name?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      String(o.totalPrice).includes(q)
    );
  });

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="text-white">
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-2xl font-bold">All Orders</h2>

        <input
          type="text"
          placeholder="Search by order ID, customer, restaurant, status, or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-sm px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
        />
      </div>

      {paginatedOrders.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No matching orders found.
        </p>
      ) : (
        <>
          {/* GRID — SAME AS OTHER ADMIN PAGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {paginatedOrders.map((o) => (
              <div
                key={o._id}
                className="bg-black/70 backdrop-blur-lg border border-white/20
                           rounded-xl p-4 flex flex-col h-45"
              >
                {/* ORDER ID */}
                <p className="text-xs text-gray-400">Order ID</p>
                <p className="text-blue-400 text-sm break-all mb-2">{o._id}</p>

                {/* DETAILS */}
                <p className="text-sm text-gray-300 line-clamp-1">
                  <span className="text-gray-400">Customer:</span>{" "}
                  {o.customerId?.name || "—"}
                </p>

                <p className="text-sm text-gray-300 line-clamp-1">
                  <span className="text-gray-400">Restaurant:</span>{" "}
                  {o.restaurantId?.name || "—"}
                </p>

                {/* STATUS */}
                <span
                  className={`mt-2 inline-block w-fit px-3 py-1 text-xs rounded-full capitalize ${
                    o.status === "delivered"
                      ? "bg-green-600/20 text-green-400"
                      : o.status === "cancelled"
                      ? "bg-red-600/20 text-red-400"
                      : "bg-yellow-600/20 text-yellow-400"
                  }`}
                >
                  {o.status}
                </span>

                {/* FOOTER */}
                <div className="mt-auto flex items-center justify-between">
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
        </>
      )}
    </div>
  );
}
