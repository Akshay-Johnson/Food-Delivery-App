export default function AuthInput({ label, type = 'text', value, onChange, autoComplete }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1 " >
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={`Enter your ${label.toLowerCase()}`} 
                onChange={onChange}
                autoComplete={autoComplete || "off"}
                className="
                    w-full px-3 py-2 rounded-md 
                    border border-white/20 
                    bg-black/40
                    text-white
                    focus:bg-black-50
                    focus:border-blue-10
                    focus:ring-2 focus:ring-blue-400 
                    outline-none 
                    transition-all
                    placeholder-white
     
                "
            />
        </div>
    );
}
