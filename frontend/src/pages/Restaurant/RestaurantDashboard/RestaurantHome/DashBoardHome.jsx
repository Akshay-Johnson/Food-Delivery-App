import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    menuItems: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        api.get("/api/restaurants/orders"),
        api.get("/api/menu/my/menu"),
      ]);

      const orders = ordersRes.data.orders || [];
      const menuItems = menuRes.data || [];

      const revenue = orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );

      setStats({
        orders: orders.length,
        revenue,
        menuItems: menuItems.length,
      });
    } catch (error) {
      console.error(
        "Failed to load dashboard stats:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold">Restaurant Dashboard</h2>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* TOTAL ORDERS */}
        <div className="p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.orders}</p>
        </div>

        {/* TOTAL REVENUE */}
        <div className="p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg">Revenue</h3>
          <p className="text-3xl font-bold text-green-400">₹{stats.revenue}</p>
        </div>

        {/* TOTAL MENU ITEMS */}
        <div className="p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg">Menu Items</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {stats.menuItems}
          </p>
        </div>
      </div>
    </div>
  );
}
