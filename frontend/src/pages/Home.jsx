// Purpose: Home Landing Page
import React from "react";
import Hero from "../components/Hero";
import TopCards from "../components/TopCards";
import PromoBanner from "../components/PromoBanner";
import ProductSection from "../components/ProductSection";
import Gallery from "../components/Gallery";
import About from "../components/About";
import Contact from "../components/Contact";

const Home = ({ selectedCategory, onSelectCategory, onQuickView, onOpenAuth }) => {
  return (
    <div className="bg-[#2e1700] text-white font-uchen pb-16">
      <Hero />
      <TopCards />
      <PromoBanner />
      <ProductSection
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onQuickView={onQuickView}
        onOpenAuth={onOpenAuth}
      />
      <Gallery />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
