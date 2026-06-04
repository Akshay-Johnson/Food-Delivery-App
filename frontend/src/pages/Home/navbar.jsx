import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const links = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Testimonials", id: "review" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 pt-4">
      <div className="section-shell">
        <div className="glass-card flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <button
            onClick={() => scrollTo("home")}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30">
              <UtensilsCrossed size={20} />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-[0.3em] text-orange-200/80">
                Food delivery
              </span>
              <span className="block text-lg font-extrabold leading-none sm:text-xl">
                DineX
              </span>
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="nav-btn text-sm"
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/agent/login"
              className="nav-btn bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 text-orange-300 hover:text-orange-200"
            >
              Agent Login
            </Link>

            <Link
              to="/customer/login"
              className="nav-btn bg-gradient-to-r from-orange-500 to-red-600 text-sm font-semibold"
            >
              Order now
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="glass-card mt-3 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="nav-btn w-full justify-start text-sm"
                >
                  {link.label}
                </button>
              ))}
              
              <Link
                to="/agent/login"
                className="nav-btn w-full bg-white/5 border border-white/10 text-sm font-semibold text-orange-300"
                onClick={() => setMenuOpen(false)}
              >
                Agent Login
              </Link>

              <Link
                to="/customer/login"
                className="nav-btn w-full bg-gradient-to-r from-orange-500 to-red-600 text-sm font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                Order now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
