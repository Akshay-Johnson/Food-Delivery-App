import { NavLink } from "react-router-dom";

export default function DashboardNav({
  brand = "DX",
  title = "Dashboard",
  items = [],
  onLogout,
  logoutLabel = "Logout",
}) {
  return (
    <aside className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg md:sticky md:h-screen md:w-24 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:flex-col md:items-stretch md:justify-start md:px-3 md:py-4">
        <div className="flex items-center gap-3 md:mb-8 md:flex-col md:items-center md:gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-black text-white shadow-lg shadow-blue-500/30">
            {brand}
          </div>

          <div className="md:text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/60 md:hidden">
              {title}
            </p>
            <p className="hidden text-xs uppercase tracking-[0.35em] text-white/50 md:block">
              {title}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 md:hidden"
        >
          {logoutLabel}
        </button>
      </div>

      <nav className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-3 md:flex md:flex-col md:gap-3 md:px-3 md:pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              `group flex items-center justify-start gap-3 rounded-2xl px-3 py-3 text-sm transition md:justify-center md:px-2 md:py-3 ${
                isActive
                  ? "bg-blue-600/25 text-blue-300"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            <span className="truncate md:hidden">{item.label}</span>
            <span className="hidden text-xs leading-none md:block md:text-[10px]">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden p-3 md:block">
        <button
          onClick={onLogout}
          className="group relative flex w-full items-center justify-center rounded-2xl bg-red-600/90 p-3 text-white transition hover:bg-red-600"
        >
          <span className="text-xs font-semibold">{logoutLabel}</span>
        </button>
      </div>
    </aside>
  );
}