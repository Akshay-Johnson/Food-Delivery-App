import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../components/toast/toast";

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
    return <p className="text-white p-6">Loading menu...</p>;
  }

  return (
    <div className="text-white">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <h2 className="text-2xl font-bold whitespace-nowrap">
            Manage Menu
          </h2>

          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
          />
        </div>

        <button
          onClick={() => navigate("/restaurant/dashboard/menu/add")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full sm:w-auto"
        >
          + Add New Item
        </button>
      </div>

      {paginatedItems.length === 0 ? (
        <p className="text-gray-400">No matching menu items found.</p>
      ) : (
        <>
          {/* ================= MENU GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedItems.map((item) => (
              <div
                key={item._id}
                className="bg-black/70 p-4 rounded-xl border border-white/20 flex flex-col min-h-[360px]"
              >
                {/* IMAGE */}
                <img
                  src={
                    (item.image || "/assets/dishimage.jpg") + "?t=" + Date.now()
                  }
                  className="h-40 w-full object-cover rounded"
                  alt={item.name}
                />

                {/* CONTENT */}
                <h3 className="mt-3 font-semibold truncate">{item.name}</h3>

                <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>

                <p className="text-green-400 text-sm mt-1">₹{item.price}</p>

                <p className="text-xs text-gray-400 mt-1">
                  Category: {item.category}
                </p>

                {/* ACTIONS */}
                <div className="mt-auto pt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/restaurant/dashboard/menu/edit/${item._id}`
                        )
                      }
                      className="bg-blue-600 px-3 py-2 rounded flex items-center"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteItem(item._id)}
                      className="bg-red-600 px-3 py-2 rounded flex items-center"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      toggleAvailability(item._id, item.isAvailable)
                    }
                    className={`mt-3 w-full py-1.5 rounded text-sm font-semibold transition ${
                      item.isAvailable
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? "bg-green-600"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50"
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
