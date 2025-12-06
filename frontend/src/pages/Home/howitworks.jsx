import { ShoppingCart, Clock, MapPin } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    { icon: ShoppingCart, title: "1. Choose Your Meal", text: "Pick dishes from top-rated restaurants near you." },
    { icon: Clock, title: "2. Quick Delivery", text: "Our delivery agents pick up your meal instantly." },
    { icon: MapPin, title: "3. Track Live", text: "Track your delivery from kitchen to doorstep." },
  ];

  return (
    <section className="relative py-24 text-center ">
      <h2 className="text-6xl font-bold mb-16">How It Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-10 max-w-6xl mx-auto">

        {steps.map((step, i) => (
          <div 
            key={i}
            className="p-6 bg-black/90  rounded-xl border border-white/20 "
          >
            <step.icon size={50} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-300">{step.text}</p>
          </div>
        ))}

      </div>
    </section>
  );
}
