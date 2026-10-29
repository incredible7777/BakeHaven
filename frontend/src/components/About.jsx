// ========================================================
// File: frontend/src/components/About.jsx
// Purpose: Interactive About Us Section with Expandable Story & Photography
// ========================================================
import React, { useState } from "react";

const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="about" className="max-w-7xl mx-auto px-4 mt-20 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
        ABOUT US
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#a16d0e]/10 p-6 md:p-10 rounded-2xl border border-[#a16d0e]/30 shadow-xl transition-all duration-300">
        {/* Left Image Card */}
        <div className="rounded-xl overflow-hidden shadow-2xl bg-[#a16d0e] self-start">
          <img
            src="/image/about.png"
            alt="About Cake Bakery"
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Story */}
        <div className="space-y-4 text-[#e2b58d]">
          <p className="text-sm md:text-base leading-relaxed drop-shadow">
            How do you describe a good cake? It should be as smooth as velvet without being flimsy or crumbly.
            A cake's texture should be smooth and creamy; cakes with a grainy, gritty, lumpy, or loose texture
            are not ideal. Cakes with savory or sweet flavors pair best with a light, airy texture for a
            sublime gastronomic experience.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-semibold italic text-white drop-shadow">
            "I just wanted to say THANK YOU so much for the wonderful job you did with our wedding cake. It
            couldn't have been more perfect. It was so beautiful and tasted so good. It was hard to put the top
            in the freezer as we wanted to keep eating this delicious cake."
          </p>

          {/* Expandable Rich Story Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[600px] opacity-100 space-y-3 pt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-[#a16d0e]/40 pt-3">
              <h4 className="text-white font-bold text-base md:text-lg mb-1 tracking-wide">
                Our Baking Philosophy & Heritage
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#f3e5d8]">
                Founded with a passionate heart and an oven full of dreams, Cake Bakery crafts every confection
                with 100% natural ingredients: stone-ground flour, organic Madagascar bourbon vanilla, and
                single-origin Belgian chocolate. We bake daily in small batches with zero artificial preservatives.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-base md:text-lg mb-1 tracking-wide">
                Artisan Custom Creations
              </h4>
              <p className="text-sm md:text-base leading-relaxed text-[#f3e5d8]">
                From grand wedding centerpieces to intimate celebration slices, each layer is handcrafted to
                harmonize sweetness and texture. We also specialize in eggless, dairy-free, and custom dietary options
                so every guest can share in the celebration.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center space-x-2 bg-[#a16d0e] hover:bg-[#573818] active:scale-95 text-white font-bold tracking-widest px-6 py-2.5 rounded shadow-lg transition duration-300 cursor-pointer"
            >
              <span>{isExpanded ? "Show Less" : "Read More..."}</span>
              <i className={`bx bx-chevron-${isExpanded ? "up" : "down"} text-xl transition-transform duration-300`}></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
