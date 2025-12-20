import Navbar from "./navbar";
import Hero from "./hero";
import About from "./about";
import Testimonials from "./testimonials";
import ContactUs from "./contactus";

export default function Home() {
  return (
    <div className="text-white overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Testimonials />
      <ContactUs />
    </div>
  );
}
