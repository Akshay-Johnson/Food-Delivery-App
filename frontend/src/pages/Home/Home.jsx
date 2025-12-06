import Navbar from "./navbar";
import Hero from "./hero";
import About from "./about";
import HowItWorks from "./howitworks";
import Testimonials from "./testimonials";

export default function Home() {
  return (
    <div className="text-white overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Testimonials />
    </div>
  );
}
