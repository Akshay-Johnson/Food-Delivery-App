import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(6);

  /* ======================
     GRID CALCULATION
  ====================== */
  const CARD_WIDTH = 260; // must match minmax()
  const ROWS = 2;

  const calculateOrdersPerPage = () => {
    const sidebarWidth = 100; // DX sidebar
    const padding = 48; // page padding
    const availableWidth =
      window.innerWidth - sidebarWidth - padding;

    const columns = Math.floor(availableWidth / CARD_WIDTH);
    return Math.max(columns, 1) * ROWS;
  };

  /* ======================
     LOAD ORDERS
  ====================== */
  useEffect(() => {
    api.get("/api/admins/orders").then((res) => {
      setOrders(res.data || []);
      setPage(1);
    });
  }, []);

  /* ======================
     HANDLE RESIZE
  ====================== */
  useEffect(() => {
    const update = () => {
      setOrdersPerPage(calculateOrdersPerPage());
      setPage(1);
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  /* ======================
     SEARCH FILTER
  ====================== */
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

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ======================
     PAGINATION LOGIC
  ====================== */
  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ordersPerPage,
    page * ordersPerPage
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by order ID, customer, restaurant, status, or amount..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-xl mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {/* 🧾 CARDS */}
      {paginatedOrders.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No matching orders found.
        </p>
      ) : (
        <>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {paginatedOrders.map((o) => (
              <div
                key={o._id}
                className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between"
              >
                {/* HEADER */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="text-blue-400 text-sm break-all">
                    {o._id}
                  </p>
                </div>

                {/* DETAILS */}
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-400">Customer:</span>{" "}
                    {o.customerId?.name || "—"}
                  </p>
                  <p>
                    <span className="text-gray-400">Restaurant:</span>{" "}
                    {o.restaurantId?.name || "—"}
                  </p>
                  <p>
                    <span className="text-gray-400">Status:</span>{" "}
                    <span className="capitalize">{o.status}</span>
                  </p>
                </div>

                {/* FOOTER */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-green-400 font-semibold">
                    ₹{o.totalPrice}
                  </span>

                  <span
                    className={`px-3 py-1 text-xs rounded-full capitalize ${
                      o.status === "delivered"
                        ? "bg-green-600/20 text-green-400"
                        : o.status === "cancelled"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-yellow-600/20 text-yellow-400"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 📄 PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
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
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
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
