import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Pencil, Trash, Search, Plus, AlertCircle, Eye, EyeOff, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../components/toast/toast";
import ResponsiveImage from "../../../../components/ResponsiveImage";

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get("/api/menu/my/menu");
      setItems(res.data || []);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/api/menu/${id}`);
      loadMenu();
      setToast({ type: "success", message: "Item deleted successfully!" });
    } catch {
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.put(`/api/menu/${id}/availability`, {
        isAvailable: !currentStatus,
      });

      setToast({
        type: "success",
        message: `Item marked as ${
          currentStatus ? "Not Available" : "Available"
        }`,
      });

      loadMenu();
    } catch {
      setToast({ type: "error", message: "Update failed" });
    }
  };

  /* ================= SEARCH ================= */
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      String(item.price).includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400 font-medium">Loading restaurant menu...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-7xl mx-auto space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Manage Menu</h2>
            <p className="text-xs text-gray-400 mt-1">Add, update, or remove menu options from your restaurant listings</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* SEARCH BOX */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all duration-300 text-sm shadow-inner"
              />
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={() => navigate("/restaurant/dashboard/menu/add")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 text-white shrink-0"
            >
              <Plus size={16} />
              Add New Item
            </button>
          </div>
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <div className="bg-black/70 border border-white/20 rounded-2xl py-16 text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-500">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-400 text-base font-medium">No matching menu items found.</p>
        </div>
      ) : (
        <>
          {/* MENU GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedItems.map((item) => (
              <div
                key={item._id}
                className="bg-black/70 rounded-2xl border border-white/20 overflow-hidden flex flex-col hover:border-orange-500/30 transition duration-300 shadow-lg"
              >
                {/* IMAGE */}
                <div className="relative h-44 w-full bg-white/5">
                  <ResponsiveImage
                    src={item.image || "/assets/dishimage.jpg"}
                    className="h-full w-full object-cover"
                    alt={item.name}
                  />
                  {/* CATEGORY BADGE */}
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 text-xs font-bold text-orange-400 flex items-center gap-1">
                    <Tag size={10} />
                    {item.category || "General"}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white truncate text-base">{item.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pricing</span>
                      <p className="text-lg font-black text-emerald-400">₹{item.price}</p>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => navigate(`/restaurant/dashboard/menu/edit/${item._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 p-2.5 rounded-xl text-white transition flex items-center justify-center"
                        title="Edit Item"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteItem(item._id)}
                        className="bg-red-600 hover:bg-red-700 p-2.5 rounded-xl text-white transition flex items-center justify-center"
                        title="Delete Item"
                      >
                        <Trash size={16} />
                      </button>

                      <button
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-1 text-white ${
                          item.isAvailable
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                        {item.isAvailable ? "Available" : "Not Available"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-8 border-t border-white/10 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                      page === i + 1
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg"
                        : "bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/5 text-xs font-bold"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
