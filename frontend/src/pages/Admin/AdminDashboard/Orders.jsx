import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/admins/orders").then((res) => setOrders(res.data));
  }, []);

  // 🔍 SEARCH FILTER
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
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by order ID, customer, restaurant, status, or amount..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Restaurant</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-gray-400 py-4 text-center">
                No matching orders found.
              </td>
            </tr>
          ) : (
            filteredOrders.map((o) => (
              <tr key={o._id} className="border-b border-white/20">
                <td className="text-blue-400">{o._id}</td>
                <td>{o.customerId?.name || "—"}</td>
                <td>{o.restaurantId?.name || "—"}</td>
                <td className="capitalize">{o.status}</td>
                <td className="text-green-400">₹{o.totalPrice}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
