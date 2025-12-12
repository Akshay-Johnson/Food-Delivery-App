import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/api/admins/orders").then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Order</th><th>Customer</th><th>Restaurant</th><th>Status</th><th>Total</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-b border-white/20">
              <td>{o._id}</td>
              <td>{o.customerId.name}</td>
              <td>{o.restaurantId.name}</td>
              <td>{o.status}</td>
              <td>₹{o.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
