// Purpose: Hero Section with Changing Text Animation
import React from "react";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative w-full min-h-[85vh] flex items-center justify-center bg-cover bg-center font-uchen px-6 md:px-16 py-12"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/image/background2.png')`,
      }}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div data-aos="zoom-out-right" className="text-white space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-md">
            Delicious <br /> Cakes Bakery
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
            Category <span className="changecontent"></span>
          </h2>
          <p className="text-gray-200 font-semibold text-sm md:text-base max-w-lg drop-shadow">
            Gently place the parchment on your cake. Using a toothpick, prick the message onto the
            frosting. Once you remove the parchment, you can connect the dots with your toothpick.
          </p>
          <a
            href="#product-cards"
            className="inline-block bg-[#573818] hover:bg-[#a16d0e] text-white font-bold px-6 py-2.5 rounded shadow-lg transition duration-300 transform hover:-translate-y-0.5"
          >
            Order Now
          </a>
        </div>

        {/* Right Cake Image */}
        <div data-aos="zoom-out-left" className="flex justify-center">
          <img
            src="/image/background.png"
            alt="Artisanal Bakery Cake"
            className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;