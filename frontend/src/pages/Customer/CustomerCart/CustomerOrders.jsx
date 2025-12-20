import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { Home } from "lucide-react";

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
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "preparing":
        return "bg-purple-500";
      case "ready":
        return "bg-orange-500";
      case "picked":
        return "bg-indigo-500";
      case "delivered":
        return "bg-green-600";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) return <p className="p-6 text-white">Loading orders...</p>;

  return (
     <div className="relative min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center text-white">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-none"></div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto ">
      
      <div className="mb-6 flex justify-end gap-2 pt-10">

      <Link to="/customer/dashboard">
      <button className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700">
        <Home size={18} /> 
      </button>
      </Link>

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
      >
        ← Back
      </button>
      </div>
      <h1 className="text-3xl font-bold p-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-300">You have not placed any orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-black/70 border border-white rounded-xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold mb-2">
                  {order.items.map((item) => item.name).join(", ")}
                </h3>

                <span
                  className={`text-sm px-3 py-1 rounded-full ${statusColor(
                    order.status
                  )}`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-2">
                Ordered on {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-300">
                From: {order.restaurantId?.name}
              </p>
              <p className="font-bold mt-3">Total: ₹{order.totalPrice}</p>

              <button
                onClick={() => navigate(`/customer/orders/${order._id}`)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
