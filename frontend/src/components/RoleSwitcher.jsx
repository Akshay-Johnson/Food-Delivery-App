import { Link } from "react-router-dom";
import { User, Utensils, Truck, Shield, Home } from "lucide-react";

export default function RoleSwitcher() {
  return (
    <div className="flex justify-center mt-6">
      <div className="text-sm text-gray-300">
        <div className="flex gap-4 flex-wrap justify-center">
          {/* Customer */}
          <Link to="/customer/login" className="relative group">
            <div
              className="
                            w-12 h-12 flex items-center justify-center
                            bg-black/10 backdrop-blur-md border border-white/30
                            rounded-full shadow-md 
                            hover:bg-blue-600/30
                            transition 
                        "
            >
              <User className="text-white" size={22} />
            </div>

            <span
              className="
                            absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1
                            text-xs text-white bg-black/70 rounded opacity-0
                            group-hover:opacity-100 transition-opacity
                        "
            >
              Customer
            </span>
          </Link>

          {/* Restaurant */}
          <Link to="/restaurant/login" className="relative group">
            <div
              className="
                            w-12 h-12 flex items-center justify-center
                            bg-black/10 backdrop-blur-md border border-white/30
                            rounded-full shadow-md 
                            hover:bg-blue-600/30
                            transition 
                        "
            >
              <Utensils className="text-white" size={22} />
            </div>

            <span
              className="
                            absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1
                            text-xs text-white bg-black/70 rounded opacity-0
                            group-hover:opacity-100 transition-opacity
                        "
            >
              Restaurant
            </span>
          </Link>

          {/* Agent */}
          <Link to="/agent/login" className="relative group">
            <div
              className="
                            w-12 h-12 flex items-center justify-center
                            bg-black/10 backdrop-blur-md border border-white/30
                            rounded-full shadow-md 
                            hover:bg-blue-600/30
                            transition 
                        "
            >
              <Truck className="text-white" size={22} />
            </div>

            <span
              className="
                            absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1
                            text-xs text-white bg-black/70 rounded opacity-0
                            group-hover:opacity-100 transition-opacity
                        "
            >
              Agent
            </span>
          </Link>

          {/* Admin */}
          <Link to="/admin/login" className="relative group">
            <div
              className="
                            w-12 h-12 flex items-center justify-center
                            bg-black/10 backdrop-blur-md border border-white/30
                            rounded-full shadow-md 
                            hover:bg-blue-600/30
                            transition 
                        "
            >
              <Shield className="text-white" size={22} />
            </div>

            <span
              className="
                            absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1
                            text-xs text-white bg-black/70 rounded opacity-0
                            group-hover:opacity-100 transition-opacity
                        "
            >
              Admin
            </span>
          </Link>

          {/* Home */}
          <Link to="/" className="relative group">
            <div
              className="
                            w-12 h-12 flex items-center justify-center
                            bg-black/10 backdrop-blur-md border border-white/30
                            rounded-full shadow-md 
                            hover:bg-blue-600/30
                            transition 
                        "
            >
              <Home className="text-white" size={22} />
            </div>

            <span
              className="
                            absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1
                            text-xs text-white bg-black/70 rounded opacity-0
                            group-hover:opacity-100 transition-opacity
                        "
            >
              Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
