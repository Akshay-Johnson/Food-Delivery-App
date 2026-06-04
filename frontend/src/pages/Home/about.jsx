import HowItWorks from "./howitworks";

export default function About() {
  return (
    <section
      id="about"
      className="relative flex flex-col items-center text-center py-20 sm:py-24 min-h-[unset] bg-[url('/assets/loginimage.webp')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md"></div>

      <div className="relative z-10 section-shell max-w-4xl">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl mb-6 sm:mb-8">
          About DineX
        </h2>

        <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-2xl font-medium leading-relaxed text-gray-200 drop-shadow-lg text-balance">
          DineX is a modern food delivery platform that connects hungry
          customers with favorite restaurants. Fast delivery, real-time
          tracking, and a cleaner ordering flow keep the experience useful on
          mobile, tablet, and desktop.
        </p>
      </div>
      <div className="w-full mt-12 sm:mt-16">
        <HowItWorks />
      </div>
    </section>
  );
}
