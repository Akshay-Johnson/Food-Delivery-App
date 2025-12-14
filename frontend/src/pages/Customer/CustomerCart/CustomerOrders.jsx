import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/my-orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-blue-500";
      case "preparing": return "bg-purple-500";
      case "ready": return "bg-orange-500";
      case "picked": return "bg-indigo-500";
      case "delivered": return "bg-green-600";
      case "rejected": return "bg-red-600";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return <p className="p-6 text-white">Loading orders...</p>;
  }

  return (
    <div className="min-h-screen bg-black/90 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <nav className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 hover:underline"
        >
          &larr; Back
        </button>
      </nav>

      {orders.length === 0 ? (
        <p className="text-gray-300">You have not placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/10 border border-white/20 rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold">Order ID: {order._id}</p>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${statusColor(order.status)}`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-2">
                Ordered on {new Date(order.createdAt).toLocaleString()}
              </p>

              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="font-bold">Total: ₹{order.totalPrice}</p>
                <button
                  onClick={() => navigate(`/customer/orders/${order._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
