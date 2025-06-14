import { Navbar } from "@/components/navbar";
import Hero from "@/components/home/Hero";
import { HeroBgAtas } from "@/components/home/HeroBg";
import Cards from "@/components/home/Card";
import HeroAlpha from "@/components/home/HeroAlpha";
import HeroGamma from "@/components/home/HeroGamma";
import WithLove from "@/components/home/WithLove";
import HeroDelta from "@/components/home/HeroDelta";
import FooterBefore from "@/components/home/FooterBefore";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HeroBgAtas />
      <Cards />
      {/* <BuildWith /> */}
      <HeroAlpha />
      <HeroGamma />
      <WithLove />
      <HeroDelta />
      <FooterBefore />

      <Footer />
    </>
  );
}
