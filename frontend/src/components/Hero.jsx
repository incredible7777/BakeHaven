
// Purpose: Dynamic Hero with Synchronized Text & Cake Image Transitions

import React, { useState, useEffect } from "react";

const cakeCategories = [
  {
    title: "Birthday cake",
    image: "/image/c9.png",
    desc: "Celebrate unforgettable moments with our signature handcrafted birthday cakes, frosted with velvety cream.",
  },
  {
    title: "Chocolate cake",
    image: "/image/background.png",
    desc: "Gently place the parchment on your cake. Using a toothpick, prick the message onto the rich chocolate frosting.",
  },
  {
    title: "Party cake",
    image: "/image/c1.png",
    desc: "Make every celebration grand with our soft-layered cream cakes designed to be the life of the party.",
  },
  {
    title: "Slice cake",
    image: "/image/c3.png",
    desc: "Indulge in perfectly sliced portions of moist sponge cake paired with delectable creamy layers.",
  },
  {
    title: "Cup cake",
    image: "/image/c10.png",
    desc: "Delight in artisan cupcakes topped with swirls of delicious frosting and festive handcrafted sprinkles.",
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Start fade out animation
      setFade(true);

      // 2. Switch text and image synchronously
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cakeCategories.length);
        setFade(false); // 3. Fade in new cake & text
      }, 350);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const currentCake = cakeCategories[currentIndex];

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
            Delicious Cakes <br /> at BakeHaven
          </h1>

          {/* Synchronized Category Title */}
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md flex items-center flex-wrap gap-2">
            <span>Category</span>
            <span
              className={`text-[#a16d0e] transition-all duration-300 transform inline-block ${
                fade ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              {currentCake.title}
            </span>
          </h2>

          {/* Synchronized Description */}
          <p
            className={`text-gray-200 font-medium text-sm md:text-base max-w-lg drop-shadow min-h-[56px] leading-relaxed transition-opacity duration-300 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          >
            {currentCake.desc}
          </p>

          <a
            href="/#product-cards"
            className="inline-block bg-[#573818] hover:bg-[#a16d0e] text-white font-bold tracking-widest px-8 py-3 rounded-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            Order Now
          </a>
        </div>

        {/* Right Cake Image - Changes synchronously with text */}
        <div data-aos="zoom-out-left" className="flex justify-center items-center min-h-[380px]">
          <img
            key={currentCake.title}
            src={currentCake.image}
            alt={currentCake.title}
            className={`w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl transition-all duration-500 ease-in-out transform ${
              fade ? "opacity-0 scale-90 translate-y-3" : "opacity-100 scale-100 translate-y-0"
            }`}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
