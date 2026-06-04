import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full overflow-hidden text-white"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/assets/home.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 section-shell flex flex-1 items-center justify-center py-28 sm:py-32 text-center">
        <div className="max-w-4xl">
          <p className="mx-auto mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-orange-100/90 backdrop-blur-sm sm:text-sm">
            Fast delivery, premium experience
          </p>

          <h1 className="font-black leading-[0.95] tracking-tight mb-6">
            <span className="block text-4xl sm:text-6xl lg:text-7xl">
              Welcome to
            </span>
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-6xl text-transparent sm:text-8xl lg:text-[8rem]">
              DineX
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-gray-200 sm:text-2xl">
            Where great food meets fast delivery, with a smooth ordering flow
            that stays usable on every screen size.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              to="/customer/login"
              className="hero-btn w-full max-w-xs bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Order now
            </Link>

            <Link
              to="/agent/login"
              className="hero-btn w-full max-w-xs bg-white/5 border border-white/10 hover:bg-white/10 text-orange-300"
            >
              Deliver with us
            </Link>

            <Link
              to="/restaurant/register"
              className="hero-btn w-full max-w-xs bg-white/10 hover:bg-white/20"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
