import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/admins/orders").then((res) => setOrders(res.data));
  }, []);

  /* 🔍 SEARCH FILTER */
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Orders</h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by order ID, customer, restaurant, status, or amount..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {/* 🧾 CARDS */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No matching orders found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-2xl">
          {filteredOrders.map((o) => (
            <div
              key={o._id}
              className="bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl p-5 flex flex-col justify-between"
            >
              {/* HEADER */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Order ID</p>
                <p className="text-blue-400 text-sm break-all">{o._id}</p>
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
      )}
    </div>
  );
}
