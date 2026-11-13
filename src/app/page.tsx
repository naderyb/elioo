import Hero from "@/components/Hero";
import About from "@/components/About";
import Music from "@/components/Music";
import Films from "@/components/Films";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const CURRENT_YEAR = 2026;

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Music />
      <Films />
      <Contact />
      <Footer currentYear={CURRENT_YEAR} />
    </main>
  );
}
