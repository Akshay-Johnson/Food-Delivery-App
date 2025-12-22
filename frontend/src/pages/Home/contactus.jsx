import { useState } from "react";
import api from "../../api/axiosInstance";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await api.post("/api/contact/send", formData);

      if (res.data.success) {
        setStatus("Message Sent Successfully!");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (error) {
      console.error("Contact Error:", error);
      setStatus("Failed to send. Please try again.");
      setTimeout(() => setStatus(""), 3000);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="contact"
      className="relative py-24 px-10 bg-[url('/assets/loginimage.jpg')] bg-cover bg-center text-white"
    >
      {/* Dark Overlay with Blur to match Testimonials */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
          Get In Touch
        </h2>
        <p className="text-center text-gray-300 mb-12">
          Have a question about your order or want to partner with DineX?
        </p>

        <div className="bg-black p-8 rounded-2xl border border-white backdrop-blur-lg shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Message
              </label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-sm m-auto flex justify-center items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-4 rounded-lg font-bold text-lg shadow-lg transform active:scale-95 transition-all duration-200"
            >
              {status || "Send Message"}
            </button>
          </form>

          {/* Contact Info Footer */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t border-white/10 pt-8">
            <div>
              <p className="text-orange-400 font-bold">Email Us</p>
              <p className="text-sm text-gray-300">support@dinex.com</p>
            </div>
            <div>
              <p className="text-orange-400 font-bold">Call Us</p>
              <p className="text-sm text-gray-300">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-orange-400 font-bold">Visit Us</p>
              <p className="text-sm text-gray-300">Kerala, India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
