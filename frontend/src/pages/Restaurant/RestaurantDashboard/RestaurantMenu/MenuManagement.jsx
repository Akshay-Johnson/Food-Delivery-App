import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 NEW
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get("/api/menu/my/menu");
      setItems(res.data);
    } catch (error) {
      console.error(
        "Failed to load menu:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await api.delete(`/api/menu/${id}`);
      loadMenu();
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      alert("Failed to delete item");
    }
  };

  // 🔍 FILTER LOGIC
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      String(item.price).includes(q)
    );
  });

  if (loading) {
    return <p className="text-white p-6">Loading menu...</p>;
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manage Menu</h2>

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
        className="w-full mb-4 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white "
      />

      {filteredItems.length === 0 ? (
        <p className="text-gray-400">No matching menu items found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-black/70 p-4 rounded-xl border border-white/20"
            >
              <img
                src={
                  (item.image || "/assets/dishimage.jpg") + "?t=" + Date.now()
                }
                className="h-32 w-full object-cover rounded"
              />

              <h3 className="mt-2 font-semibold">{item.name}</h3>

              <p className="text-gray-300 text-sm mt-1">{item.description}</p>

              <p className="text-gray-300 text-sm mt-1">₹{item.price}</p>

              <p className="text-xs text-gray-400 mt-1">
                Category: {item.category}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    navigate(`/restaurant/dashboard/menu/edit/${item._id}`)
                  }
                  className="bg-blue-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <Pencil size={16} /> Edit
                </button>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <Trash size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
