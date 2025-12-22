import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden text-white"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/home.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 text-center">
        <h1 className="font-extrabold mb-6 text-center">
          <span className="text-5xl">Welcome to </span>
          <span className="text-9xl bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
            DineX
          </span>
        </h1>

        <p className="text-2xl text-gray-200 font-bold leading-relaxed mt-20">
          Where Great Food
          <br />
          Meets
          <br />
          Fast Delivery.
        </p>

        <div className="flex justify-center gap-6 mt-30">
          <Link
            to="/customer/login"
            className="hero-btn bg-black/40 hover:bg-green-600 border-white "
          >
            Order Now
          </Link>

          <Link
            to="/restaurant/register"
            className="hero-btn bg-blue-500 hover:bg-blue-600"
          >
            Partner with Us
          </Link>
        </div>
      </div>
    </section>
  );
}
