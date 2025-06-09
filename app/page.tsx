import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import { HeroBgAtas } from "@/components/home/HeroBg";
import BuildWith from "@/components/home/BuildWith";
import Cards from "@/components/home/Card";
import HeroAlpha from "@/components/home/HeroAlpha";
import HeroGamma from "@/components/home/HeroGamma";
import HeroDelta from "@/components/home/HeroDelta";
import FooterBefore from "@/components/home/FooterBefore";
import WithLove from "@/components/home/WithLove";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HeroBgAtas />
        <Cards />
        <BuildWith />
        <HeroAlpha />
        <HeroGamma />
        <WithLove />
        <HeroDelta />
        <FooterBefore />
      </main>
      <Footer />
    </div>
  );
}
