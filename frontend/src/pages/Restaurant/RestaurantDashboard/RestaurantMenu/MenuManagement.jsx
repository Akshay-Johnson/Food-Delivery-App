import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../../components/toast/toast";

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // 🔍 Search
  const [search, setSearch] = useState("");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  /* ================= LOAD MENU ================= */
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get("/api/menu/my/menu");
      setItems(res.data || []);
    } catch (error) {
      console.error(
        "Failed to load menu:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/api/menu/${id}`);
      loadMenu();
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      setToast({ type: "error", message: "Delete failed" });
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      String(item.price).includes(q)
    );
  });

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return <p className="text-white p-6">Loading menu...</p>;
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manage Menu</h2>

        {toast && <Toast type={toast.type} message={toast.message} />}

        <button
          onClick={() => navigate("/restaurant/dashboard/menu/add")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          + Add New Item
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search menu items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white"
      />

      {paginatedItems.length === 0 ? (
        <p className="text-gray-400">No matching menu items found.</p>
      ) : (
        <>
          {/* MENU GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedItems.map((item) => (
              <div
                key={item._id}
                className="bg-black/70 p-4 rounded-xl border border-white/20"
              >
                <img
                  src={
                    (item.image || "/assets/dishimage.jpg") +
                    "?t=" +
                    Date.now()
                  }
                  className="h-32 w-full object-cover rounded"
                />

                <h3 className="mt-2 font-semibold">{item.name}</h3>

                <p className="text-gray-300 text-sm mt-1">
                  {item.description}
                </p>

                <p className="text-gray-300 text-sm mt-1">₹{item.price}</p>

                <p className="text-xs text-gray-400 mt-1">
                  Category: {item.category}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-4">
                  {/* EDIT */}
                  <button
                    onClick={() =>
                      navigate(
                        `/restaurant/dashboard/menu/edit/${item._id}`
                      )
                    }
                    className="relative group bg-blue-600 px-3 py-1 rounded flex items-center"
                  >
                    <Pencil size={16} />

                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                      Edit
                    </span>
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="relative group bg-red-600 px-3 py-1 rounded flex items-center"
                  >
                    <Trash size={16} />

                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
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
