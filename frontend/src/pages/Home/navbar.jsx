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
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md flex items-center gap-2 transition"
      >
        Home
      </button>

      {/* About Button */}
      <button
        onClick={() => scrollTo("about")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md flex items-center gap-2 transition"
      >
        About
      </button>

      {/* Testimonials Button */}
      <button
        onClick={() => scrollTo("review")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md flex items-center gap-2 transition"
      >
        Testimonials
      </button>

      {/* Contact Us Button */}
      <button
        onClick={() => scrollTo("contact")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-md flex items-center gap-2 transition"
      >
        Contact Us
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
