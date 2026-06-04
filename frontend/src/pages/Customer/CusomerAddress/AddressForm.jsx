import LocationPicker from "../../../components/LocationPicker";
import { ArrowLeft, MapPin } from "lucide-react";

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
      <div className="flex flex-col gap-1 w-full text-left">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {options.label}
        </label>

        {isSelect ? (
          <select
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:border-orange-500/50 transition-all text-sm"
          >
            {options.options.map((opt) => (
              <option key={opt} value={opt} className="bg-zinc-900 text-white">
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
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all text-sm shadow-inner"
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* BACKGROUND BACKGROUND */}
      <div className="fixed inset-0 bg-[url('/assets/restaurant/bg.webp')] bg-cover bg-center -z-20 pointer-events-none opacity-40 filter blur-[2px]" />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950 -z-10 pointer-events-none" />

      {/* CARD CONTAINER (Wider for split layout) */}
      <div className="w-full max-w-4xl bg-black/70 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="text-2xl font-black text-white">{title}</h1>

          {showBack && (
            <button
              onClick={onBack}
              className="h-9 px-3.5 rounded-xl flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
        </div>

        {/* SPLIT LAYOUT FORM */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: FIELDS */}
          <div className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput("fullName", {
                label: "Full Name",
                placeholder: "Enter full name",
              })}
              {renderInput("phone", {
                label: "Phone Number",
                placeholder: "Enter phone number",
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput("addressLine1", {
                label: "Address Line 1",
                placeholder: "House no, street",
              })}
              {renderInput("addressLine2", {
                label: "Address Line 2",
                placeholder: "Apartment, suite",
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {renderInput("city", { label: "City", placeholder: "City" })}
              {renderInput("state", { label: "State", placeholder: "State" })}
              {renderInput("pincode", { label: "Pincode", placeholder: "Pincode" })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 font-extrabold text-sm uppercase tracking-wider text-white shadow-lg shadow-orange-500/10 active:scale-[0.98] transition cursor-pointer"
              >
                {submitText}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: MAP PIN PICKER */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="flex-1 flex flex-col justify-start">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={16} className="text-orange-400" />
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pin Location on Map
                </label>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/35 p-3 flex-1 flex flex-col justify-center">
                <LocationPicker
                  value={form.location}
                  onChange={(loc) => setForm((prev) => ({ ...prev, location: loc }))}
                />
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
