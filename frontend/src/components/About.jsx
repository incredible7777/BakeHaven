// Purpose: About Us Section with Story & Photography
import React from "react";

const About = () => {
  return (
    <section id="about" className="max-w-7xl mx-auto px-4 mt-20 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
        ABOUT US
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#a16d0e]/10 p-6 md:p-10 rounded-2xl border border-[#a16d0e]/30 shadow-xl">
        {/* Left Image Card */}
        <div className="rounded-xl overflow-hidden shadow-2xl bg-[#a16d0e]">
          <img src="/image/about.png" alt="About Cake Bakery" className="w-full h-auto object-cover" />
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

          <button className="bg-[#a16d0e] hover:bg-[#573818] text-white font-bold tracking-widest px-6 py-2 rounded shadow transition duration-300">
            Read More...
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;