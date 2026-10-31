// Purpose: Discount Promotional Banner Matching Original Style 1:1
import React from "react";

const PromoBanner = () => {
  return (
    <section
      className="w-full min-h-[55vh] flex items-center justify-center bg-cover bg-center mt-20 px-6 md:px-16 py-14 shadow-2xl font-uchen"
      data-aos="fade-up"
      data-aos-duration="1500"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/image/banner2.png')`,
      }}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Banner Copy */}
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-[#a16d0e] font-bold text-2xl md:text-3xl tracking-wide drop-shadow">
            Delicious Cake
          </h3>
          <h2 className="text-4xl md:text-6xl font-bold text-[#a16d0e] drop-shadow-lg tracking-wider">
            UPTO 50% OFF
          </h2>
          <p className="text-[#e2b58d] italic text-base md:text-xl font-semibold drop-shadow">
            "Cake is not just a food, it's an emotion."
          </p>
          <div className="pt-2" id="btnorder">
            <a
              href="/#product-cards"
              className="inline-block bg-[#a16d0e] hover:bg-[#573818] text-white tracking-[5px] font-bold px-8 py-2.5 rounded shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer uppercase text-sm"
            >
              Order Now
            </a>
          </div>
        </div>

        {/* Banner Graphic */}
        <div className="flex justify-center items-center">
          <img
            src="/image/banner-background.png"
            alt="Delicious Cake Offer"
            className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
