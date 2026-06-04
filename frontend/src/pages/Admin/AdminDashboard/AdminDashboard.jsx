import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import DashboardNav from "../../../components/DashboardNav";
import ResponsiveImage from "../../../components/ResponsiveImage";

import {
  LayoutDashboard,
  Users,
  Building2,
  Truck,
  ScrollText,
  BarChart3,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const location = useLocation();
  const { role, loading } = useAuth();

  const token = localStorage.getItem("adminToken");

  const isOverview = location.pathname === "/admin/dashboard";

  const [stats, setStats] = useState({
    restaurants: 0,
    customers: 0,
    agents: 0,
    orders: 0,
    revenue: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  /* ================= LOAD DASHBOARD DATA ================= */
  const loadDashboardStats = async () => {
    try {
      const [r, c, a, o] = await Promise.all([
        api.get("/api/admins/restaurants"),
        api.get("/api/admins/customers"),
        api.get("/api/admins/agents"),
        api.get("/api/admins/orders"),
      ]);

      const restaurants = r.data || [];
      const customers = c.data || [];
      const agents = a.data || [];
      const orders = o.data || [];

      const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      setStats({
        restaurants: restaurants.length,
        customers: customers.length,
        agents: agents.length,
        orders: orders.length,
        revenue,
      });

      setTopRestaurants(
        [...restaurants]
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          .slice(0, 8)
      );

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      orders.forEach((o) => {
        const day = days[new Date(o.createdAt).getDay()];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      setChartData(
        days.map((d) => ({
          day: d,
          orders: grouped[d] || 0,
        }))
      );
    } catch (err) {
      console.error("Admin dashboard error", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!loading && role === "admin" && isOverview) {
      loadDashboardStats();
    }
  }, [loading, role, isOverview]);

  /* ================= HARD SECURITY GUARD ================= */
  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/admin/login" replace />;
  }

  if (!loading && role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("role");
    window.location.replace("/admin/login");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="relative min-h-screen text-white bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        <DashboardNav
          brand="DX"
          title="Admin"
          onLogout={logout}
          logoutLabel="Logout"
          items={[
            { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
            { to: "/admin/dashboard/restaurants", icon: Building2, label: "Restaurants" },
            { to: "/admin/dashboard/customers", icon: Users, label: "Customers" },
            { to: "/admin/dashboard/agents", icon: Truck, label: "Agents" },
            { to: "/admin/dashboard/orders", icon: ScrollText, label: "Orders" },
          ]}
        />

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {isOverview ? (
            loadingStats ? (
              <p className="text-gray-400">Loading stats…</p>
            ) : (
              <>
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <StatCard
                    label="Restaurants"
                    value={stats.restaurants}
                    icon={Building2}
                    color="text-yellow-400"
                  />
                  <StatCard
                    label="Customers"
                    value={stats.customers}
                    icon={Users}
                    color="text-blue-400"
                  />
                  <StatCard
                    label="Agents"
                    value={stats.agents}
                    icon={Truck}
                    color="text-purple-400"
                  />
                  <StatCard
                    label="Orders"
                    value={stats.orders}
                    icon={ScrollText}
                    color="text-green-400"
                  />
                  <StatCard
                    label="Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={BarChart3}
                    color="text-pink-400"
                  />
                </div>

                {/* TOP RESTAURANTS */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Top Restaurants
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topRestaurants.map((r, index) => (
                      <div
                        key={r._id}
                        className="bg-black/70 border border-white/20 rounded-xl p-4 flex items-center gap-4"
                      >
                        <span className="text-xl font-bold text-blue-400">
                          #{index + 1}
                        </span>

                        <div className="flex-1">
                          <p className="font-semibold truncate">{r.name}</p>
                          <p className="text-sm text-yellow-400">
                             {r.averageRating?.toFixed(1) || "0.0"}
                          </p>
                          <p className="text-sm text-blue-400">
                             {r.orderCount || 0} orders
                          </p>
                        </div>

                        <ResponsiveImage
                          src={r.image || "/assets/restaurant.png"}
                          alt={r.name}
                          className="w-14 h-14 rounded-md object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CHART */}
                <div className="bg-black/70 border border-white/20 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Weekly Orders (Platform)
                  </h3>

                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const Icon = icon;

  return (
    <div className="bg-black/70 border border-white/20 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className={`text-xl md:text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </div>

      <Icon size={26} className={color} />
    </div>
  );
}
