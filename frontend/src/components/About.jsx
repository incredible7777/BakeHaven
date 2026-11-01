// Purpose: Interactive About Us Section with Expandable Story & Photography
import React, { useState } from "react";

const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 mt-24 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-12 tracking-widest uppercase">
        About Us
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-[#a16d0e]/10 p-6 md:p-10 rounded-3xl border border-[#a16d0e]/30 shadow-2xl transition-all duration-300">
        {/* Left Image Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#a16d0e] p-4 sm:p-6 flex items-center justify-center border border-black/10 self-center">
          <img
            src="/image/about.png"
            alt="About BakeHaven"
            className="w-full max-w-md h-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-xl"
          />
        </div>

        {/* Right Story */}
        <div className="space-y-5 text-[#e2b58d]">
          <p className="text-sm md:text-base leading-relaxed text-[#f3e5d8] drop-shadow">
            How do you describe a good cake? It should be as smooth as velvet without being flimsy or crumbly.
            A cake's texture should be smooth and creamy; cakes with a grainy, gritty, lumpy, or loose texture
            are not ideal. Cakes with savory or sweet flavors pair best with a light, airy texture for a
            sublime gastronomic experience.
          </p>

          <blockquote className="border-l-4 border-[#a16d0e] pl-4 italic text-white text-sm md:text-base leading-relaxed drop-shadow bg-black/20 p-3 rounded-r-xl">
            "I just wanted to say THANK YOU so much for the wonderful job you did with our wedding cake. It
            couldn't have been more perfect. It was so beautiful and tasted so good. It was hard to put the top
            in the freezer as we wanted to keep eating this delicious cake."
          </blockquote>

          {/* Expandable Story Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[600px] opacity-100 space-y-4 pt-1" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-[#a16d0e]/40 pt-4 space-y-2">
              <h4 className="text-white font-bold text-base md:text-lg tracking-wide flex items-center space-x-2">
                <i className="bx bxs-badge-check text-[#a16d0e]"></i>
                <span>Our Baking Philosophy & Heritage</span>
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#f3e5d8]">
                Founded with a passionate heart and an oven full of dreams, BakeHaven crafts every confection
                with 100% natural ingredients: stone-ground unbleached flour, organic Madagascar bourbon vanilla, and
                single-origin Belgian chocolate. We bake daily in small batches with zero artificial preservatives.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-base md:text-lg tracking-wide flex items-center space-x-2">
                <i className="bx bxs-heart text-[#a16d0e]"></i>
                <span>Artisan Custom Creations</span>
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#f3e5d8]">
                From grand wedding centerpieces to intimate celebration slices, each layer is handcrafted to
                harmonize sweetness and texture. We also specialize in eggless, dairy-free, and custom dietary options
                so every guest can share in the celebration.
              </p>
            </div>
          </div>

          <div id="bt" className="pt-2">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center space-x-2 bg-[#a16d0e] hover:bg-[#573818] active:scale-95 text-white font-bold tracking-[3px] uppercase text-xs md:text-sm px-7 py-2.5 rounded shadow-xl transition-all duration-300 cursor-pointer"
            >
              <span>{isExpanded ? "Show Less" : "Read More..."}</span>
              <i className={`bx bx-chevron-${isExpanded ? "up" : "down"} text-lg transition-transform duration-300`}></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
