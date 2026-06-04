import { NavLink } from "react-router-dom";

export default function DashboardNav({
  brand = "DX",
  title = "Dashboard",
  items = [],
  onLogout,
  logoutLabel = "Logout",
}) {
  return (
    <aside className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/85 backdrop-blur-xl md:sticky md:h-screen md:w-64 md:border-b-0 md:border-r md:flex md:flex-col md:justify-between shrink-0">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:flex-row md:items-center md:gap-3 md:px-5 md:py-6 md:border-b md:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-blue-500/30">
            {brand}
          </div>

          <div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 md:hidden"
        >
          {logoutLabel}
        </button>
      </div>

      <nav className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-3 md:flex md:flex-col md:gap-2 md:px-4 md:py-6 md:flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              `group flex items-center justify-start gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-blue-600/25 text-blue-300 border border-blue-500/20"
                  : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-semibold text-sm truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 hidden md:block border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600/90 py-3 text-white transition hover:bg-red-600 font-bold text-sm shadow-md"
        >
          {logoutLabel}
        </button>
      </div>
    </aside>
  );
}
