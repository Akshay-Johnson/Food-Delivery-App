import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function Navbar() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-6 right-6 flex items-center gap-3 z-30">

      {/* Home Button */}
      <button 
        onClick={() => scrollTo("home")}
        className="nav-btn"
      >
        Home
      </button>

      {/* About Button */}
      <button 
        onClick={() => scrollTo("about")}
        className="nav-btn"
      >
        About
      </button>

      {/* Testimonials Button */}
      <button 
        onClick={() => scrollTo("review")}
        className="nav-btn"
      >
        Testimonials
      </button>

      {/* Login */}
      <Link
        to="/customer/login"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md flex items-center gap-2 transition"
      >
        <User size={16} />
        Login
      </Link>
    </div>
  );
}
