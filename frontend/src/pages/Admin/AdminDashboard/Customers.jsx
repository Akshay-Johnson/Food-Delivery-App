import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";

export default function Customers() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/api/admins/customers").then(res => setList(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customers</h2>

      <table className="w-full text-left">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
        </thead>

        <tbody>
          {list.map((c) => (
            <tr key={c._id} className="border-b border-white/20">
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
