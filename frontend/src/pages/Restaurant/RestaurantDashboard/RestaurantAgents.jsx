import { useEffect, useState } from "react";
import api from "../../../api/axiosInstance";
import { Bike, Phone, User2 } from "lucide-react";

export default function RestaurantAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) return <p className="text-white">Loading agents...</p>;

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-6">Delivery Agents</h1>

      <div className="grid grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="bg-white/10 p-5 rounded-xl border border-white/20"
          >
            <div className="flex items-center gap-4">
              <User2 className="text-blue-400" size={40} />
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

              <p
                className={`px-3 py-1 rounded inline-block mt-2 ${
                  agent.status === "available"
                    ? "bg-green-600"
                    : agent.status === "on-delivery"
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                {agent.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
