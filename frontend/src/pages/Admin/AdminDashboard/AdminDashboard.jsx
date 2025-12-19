import { Link, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, Truck, ScrollText, LogOut, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

const logout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  navigate("/admin/login");
};


  return (
    <div className="flex min-h-screen text-white">

      {/* Sidebar */}
      <div className="w-64 bg-black/80 border-r border-white/20 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-blue-500 mb-10">DineX Admin</h1>

        <nav className="space-y-3">
          <Link to="/admin/dashboard" className="flex items-center gap-3 hover:text-blue-400">
            <LayoutDashboard /> Dashboard Overview
          </Link>

          <Link to="/admin/dashboard/restaurants" className="flex items-center gap-3 hover:text-blue-400">
            <Building2 /> Restaurants
          </Link>

          <Link to="/admin/dashboard/customers" className="flex items-center gap-3 hover:text-blue-400">
            <Users /> Customers
          </Link>

          <Link to="/admin/dashboard/agents" className="flex items-center gap-3 hover:text-blue-400">
            <Truck /> Delivery Agents
          </Link>

          <Link to="/admin/dashboard/orders" className="flex items-center gap-3 hover:text-blue-400">
            <ScrollText /> Orders
          </Link>

          <Link to="/admin/dashboard/reviews" className="flex items-center gap-3 hover:text-blue-400">
            <MessageSquare /> Reviews
          </Link>

        </nav>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-black/90 p-6">
        <Outlet />
      </div>
    </div>
  );
}
