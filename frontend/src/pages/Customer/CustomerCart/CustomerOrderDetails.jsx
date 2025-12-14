import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

export default function CustomerOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-white">Loading order...</p>;
  }

  if (!order) {
    return <p className="p-6 text-red-500">Order not found</p>;
  }

  return (
    <div className="min-h-screen bg-black/80 text-white p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-white/10 px-4 py-2 rounded hover:bg-white/20"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      <div className="bg-white/10 border border-white/20 rounded-xl p-6">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total:</strong> ₹{order.totalPrice}
        </p>
        <p>
          <strong>Placed On:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
       <p>
  <strong>Ordered From:</strong> {order.restaurantId?.name}
</p>

        <hr className="my-4 border-white/20" />

        <h2 className="text-xl font-semibold mb-3">Items</h2>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between bg-black/40 p-3 rounded-lg"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-white/70">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">₹{item.price * item.quantity}</p>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
