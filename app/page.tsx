import { Navbar } from "@/components/navbar";
// import Navbar from "@/components/navbar-client";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import CategorySlider from "@/components/home/CategorySlider";
import { HeroBgAtas } from "@/components/home/HeroBg";
import BuildWith from "@/components/home/BuildWith";
import Cards from "@/components/home/Card";
import HeroAlpha from "@/components/home/HeroAlpha";
import HeroDelta from "@/components/home/HeroDelta";
import FooterBefore from "@/components/home/FooterBefore";
import WithLove from "@/components/home/WithLove";
import CardBawah from "@/components/home/CardBawah";
import Fonts from "@/components/home/Font";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <CategorySlider />
        <Hero />
        <Fonts />
        <HeroAlpha />
        {/* <HeroGamma /> */}
        <WithLove />
        <CardBawah />
        <HeroDelta />
        <FooterBefore />
      </main>
      <Footer />
    </div>
  );
}
