import ResponsiveImage from "../../components/ResponsiveImage";

export default function Testimonials() {
  const reviews = [
    {
      img: "/assets/profile1.jpeg",
      name: "John",
      text: "Amazing service! My food always arrives hot and fast.",
    },
    {
      img: "/assets/profile2.jpeg",
      name: "Priya Sharma",
      text: "Clean UI and polite delivery agents. Love it!",
    },
    {
      img: "/assets/profile3.jpeg",
      name: "Rahul Mehta",
      text: "Live order tracking is extremely accurate!",
    },
    {
      img: "/assets/profile4.jpeg",
      name: "Sneha Kapoor",
      text: "Great variety! Reordering food is super easy.",
    },
    {
      img: "/assets/profile5.jpeg",
      name: "Amit Verma",
      text: "Reliable delivery, always on time.",
    },
  ];

  return (
    <section
      id="review"
      className="relative py-20 sm:py-24 bg-[url('/assets/review.jpg')] bg-cover bg-center text-white"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 section-shell">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-10 sm:mb-16 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 text-center">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300"
            >
              <ResponsiveImage
                src={r.img}
                alt={r.name}
                className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-white/30 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">{r.name}</h3>
              <p className="text-gray-300 italic leading-relaxed">{r.text}</p>
              <p className="mt-2 text-lg text-yellow-400 animate-bounce">
                ★★★★★
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
