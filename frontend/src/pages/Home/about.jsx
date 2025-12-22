import HowItWorks from "./howitworks";

export default function About() {
  return (
    <section
      id="about"
      className="relative flex flex-col items-center text-center px-10 py-24 min-h-[900px] bg-[url('/assets/loginimage.jpg')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      <div className="relative z-10 max-w-3xl">
        <h2 className="text-6xl font-bold mb-10">About DineX</h2>

        <p className="text-gray-300 text-2xl font-bold leading-relaxed drop-shadow-lg text-justify">
          "FoodExpress is a modern food delivery platform that connects hungry
          customers with their favorite restaurants. With fast delivery,
          real-time tracking, and a seamless ordering experience, we ensure your
          meals arrive hot and fresh..."
        </p>
      </div>
      <div className="w-full mt-10">
        <HowItWorks />
      </div>
    </section>
  );
}
