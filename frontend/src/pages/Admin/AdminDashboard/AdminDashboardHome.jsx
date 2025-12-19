import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axiosInstance";

export default function AdminDashboardHome() {
  const { role, loading } = useAuth();

  const [stats, setStats] = useState({
    restaurants: 0,
    customers: 0,
    agents: 0,
    orders: 0,
  });

  const loadStats = async () => {
    try {
      const [r, c, a, o] = await Promise.all([
        api.get("/api/admins/restaurants"),
        api.get("/api/admins/customers"),
        api.get("/api/admins/agents"),
        api.get("/api/admins/orders"),
      ]);

      setStats({
        restaurants: r.data.length,
        customers: c.data.length,
        agents: a.data.length,
        orders: o.data.length,
      });
    } catch (err) {
      console.error("Failed to load admin stats", err);
    }
  };

  useEffect(() => {
    if (!loading && role === "admin") {
      loadStats();
    }
  }, [loading, role]);

  return (
    <div>
      <h2 className="text-2xl font-bold">Admin Dashboard Overview</h2>

      <div className="grid grid-cols-4 gap-6 mt-6">
        <StatCard label="Restaurants" value={stats.restaurants} color="text-blue-400" />
        <StatCard label="Customers" value={stats.customers} color="text-green-400" />
        <StatCard label="Delivery Agents" value={stats.agents} color="text-yellow-400" />
        <StatCard label="Orders" value={stats.orders} color="text-purple-400" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="p-6 bg-white/10 rounded-xl border border-white/20">
      <h3 className="text-lg">{label}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
