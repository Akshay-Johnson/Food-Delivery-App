import { useEffect, useState } from "react";
import api from "../../../../api/axiosInstance";
import { Bike, Phone, User2 } from "lucide-react";

export default function RestaurantAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 NEW
  const [search, setSearch] = useState("");

  const loadAgents = async () => {
    try {
      const res = await api.get("/api/agents/available");
      setAgents(res.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 FILTER LOGIC
  const filteredAgents = agents.filter((agent) => {
    const q = search.toLowerCase();

    return (
      agent.name?.toLowerCase().includes(q) ||
      agent.email?.toLowerCase().includes(q) ||
      agent.phone?.includes(q) ||
      agent.vehicleType?.toLowerCase().includes(q) ||
      agent.status?.toLowerCase().includes(q)
    );
  });

  if (loading) return <p className="text-white">Loading agents...</p>;

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Delivery Agents</h1>

      {/* 🔍 SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search by name, phone, vehicle, status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-400"
      />

      {filteredAgents.length === 0 ? (
        <p className="text-gray-400">No matching agents found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent._id}
              className="bg-black/70 p-2 w-sm max-w-2xl rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={
                    agent.image && agent.image.trim() !== ""
                      ? agent.image
                      : "/assets/agent-avatar.png"
                  }
                  alt={`${agent.name}'s Avatar`}
                  className="w-10 h-10 object-cover border-1 border-black"
                />
                <div>
                  <h2 className="text-xl font-semibold">{agent.name}</h2>
                  <p className="text-sm text-gray-300">{agent.email}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  {agent.phone}
                </p>

                <p className="flex items-center gap-2">
                  <Bike size={16} />
                  {agent.vehicleType} - {agent.vehicleNumber}
                </p>

                <span
                  className={`px-3 py-1 rounded inline-block mt-2 text-sm ${
                    agent.status === "available"
                      ? "bg-green-600"
                      : agent.status === "on-delivery"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
