import { ShoppingCart, Clock, MapPin, Shield } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Choose Your Meal",
      text: "Pick dishes from top-rated restaurants .",
    },
    {
      icon: Clock,
      title: " Quick Delivery",
      text: "Our delivery agents pick up your meal instantly.",
    },

    {
      icon: Shield,
      title: " Quality Assurance",
      text: "Your satisfaction is our priority with every order.",
    },
  ];

  return (
    <section className="relative py-16 sm:py-20 text-center">
      <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-10 sm:mb-14">
        How It Works
      </h2>

      <div className="section-shell grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className="glass-card p-6 sm:p-8"
          >
            <step.icon size={40} className="mx-auto mb-4 text-orange-300" />
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-300 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
