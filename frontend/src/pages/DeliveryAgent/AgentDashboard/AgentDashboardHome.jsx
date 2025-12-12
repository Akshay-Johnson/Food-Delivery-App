export default function AgentDashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Delivery Agent Dashboard</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg">Active Deliveries</h3>
          <p className="text-3xl font-bold text-blue-400">Live</p>
        </div>

        <div className="p-6 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg">Status</h3>
          <p className="text-3xl font-bold text-green-400">Online</p>
        </div>
      </div>
    </div>
  );
}
