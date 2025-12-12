import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function Restaurants() {
  const [list, setList] = useState([]);

  const loadData = async () => {
    const res = await api.get("/api/admins/restaurants");
    setList(res.data);
  };

  const toggleStatus = async (id, value) => {
    await api.put(`/api/admins/restaurant/status/${id}`, { status: value });
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Restaurants</h2>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Status</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((r) => (
            <tr key={r._id} className="border-b border-white/20">
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.status}</td>
              <td>
                <button
                  className="bg-blue-600 px-3 py-1 rounded"
                  onClick={() => toggleStatus(r._id, r.status === "approved" ? "blocked" : "approved")}
                >
                  {r.status === "approved" ? "Block" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
