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
import { prisma } from "@/lib/prisma"; // Ensure correct import path

export default async function Home() {
  const posts = await prisma.post.findMany({
    distinct: ['category'],
    select: {
      category: true,
    },
    // Optional: add orderBy or where clause if needed, e.g. where: { published: true }
  });

  const uniqueCategories = posts.map((post) => post.category).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <CategorySlider fetchedCategories={uniqueCategories} />
        <Hero />
        {/* <HeroBgAtas /> */}
        {/* <Cards /> */}
        {/* <BuildWith />s */}
        {/* <InteractiveHero /> */}
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

