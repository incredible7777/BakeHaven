// Purpose: Discount Promotional Banner

import React from "react";

const PromoBanner = () => {
  return (
    <section
      className="w-full min-h-[50vh] flex items-center justify-center bg-cover bg-center mt-16 px-6 md:px-16 py-12 shadow-2xl font-uchen"
      data-aos="fade-up"
      data-aos-duration="1500"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/image/banner2.png')`,
      }}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Banner Copy */}
        <div className="space-y-3">
          <h3 className="text-[#a16d0e] font-bold text-2xl md:text-3xl">Delicious Cake</h3>
          <h2 className="text-4xl md:text-6xl font-bold text-[#a16d0e] drop-shadow-md">
            UPTO 50% OFF
          </h2>
          <p className="text-[#a16d0e] italic text-base md:text-lg font-semibold">
            "Cake is not just a food, it's an emotion."
          </p>
          <div className="pt-2">
            <a
              href="#product-cards"
              className="inline-block bg-[#a16d0e] hover:bg-[#573818] text-white tracking-widest font-bold px-7 py-2 rounded shadow transition duration-300"
            >
              Order Now
            </a>
          </div>
        </div>

        {/* Banner Graphic */}
        <div className="flex justify-center">
          <img
            src="/image/banner-background.png"
            alt="Delicious Cake Offer"
            className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;