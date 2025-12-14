import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  User,
  LogOut,
  UtensilsCrossed,
  Bike,
} from "lucide-react";

export default function RestaurantDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/restaurant/login");
  };

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded hover:text-blue-400 transition ${
      isActive ? "bg-white/10 text-blue-400 font-semibold" : ""
    }`;

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar */}
      <div className="w-64 bg-black/80 border-r border-white/20 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-blue-500 mb-10">DineX</h1>

        <nav className="space-y-2">
          <NavLink to="/restaurant/dashboard" className={navItem}>
            <LayoutDashboard size={18} /> Dashboard Overview
          </NavLink>

          <NavLink to="/restaurant/dashboard/menu" className={navItem}>
            <UtensilsCrossed size={18} /> Manage Menu
          </NavLink>

          <NavLink to="/restaurant/dashboard/menu/add" className={navItem}>
            <PlusCircle size={18} /> Add Menu Item
          </NavLink>

          <NavLink to="/restaurant/dashboard/orders" className={navItem}>
            <ClipboardList size={18} /> Orders
          </NavLink>

          <NavLink to="/restaurant/dashboard/agents" className={navItem}>
            <Bike size={18} /> Delivery Agents
          </NavLink>

          <NavLink to="/restaurant/dashboard/profile" className={navItem}>
            <User size={18} /> Restaurant Profile
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-12 w-full bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2 transition"
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
