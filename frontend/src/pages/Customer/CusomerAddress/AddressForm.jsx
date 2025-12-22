export default function AddressForm({
  title,
  form,
  setForm,
  onSubmit,
  submitText = "Save Address",
  showBack = true,
  onBack,
}) {
  const renderInput = (key, options = {}) => {
    const isSelect = options.type === "select";

    return (
      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-300">
          {options.label}
        </label>

        {isSelect ? (
          <select
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="px-4 py-3 rounded-lg bg-black/40 border border-white/20
                       focus:ring-2 focus:ring-blue-600 transition"
          >
            {options.options.map((opt) => (
              <option key={opt} value={opt} className="bg-black">
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={options.type || "text"}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={options.placeholder}
            className="px-4 py-3 rounded-lg bg-black/40 border border-white/20
                       text-white placeholder-gray-500
                       focus:ring-2 focus:ring-blue-600 transition"
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[url('/assets/restaurant/bg.jpg')] bg-cover bg-center
                    text-white flex items-center justify-center p-6 "
    >
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* CONTENT */}
      <div className="relative z-10"></div>

      <div
        className="w-full max-w-lg bg-white/5 backdrop-blur-xl
                      border border-white rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>

          {showBack && (
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              ← Back
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("fullName", {
              label: "Full Name",
              placeholder: "Enter full name",
            })}
            {renderInput("phone", {
              label: "Phone Number",
              placeholder: "Enter phone number",
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("addressLine1", {
              label: "Address Line 1",
              placeholder: "House no, street",
            })}
            {renderInput("addressLine2", {
              label: "Address Line 2",
              placeholder: "Apartment, suite",
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput("city", { label: "City" })}
            {renderInput("state", { label: "State" })}
            {renderInput("pincode", { label: "Pincode" })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("landmark", {
              label: "Landmark",
              placeholder: "Nearby landmark",
            })}
            {renderInput("type", {
              label: "Address Type",
              type: "select",
              options: ["Home", "Work", "Other"],
            })}
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 rounded-xl bg-blue-600 font-semibold
                       hover:bg-blue-700 active:scale-[0.98] transition"
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );
}
