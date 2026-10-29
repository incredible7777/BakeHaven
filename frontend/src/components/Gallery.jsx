// Purpose: Visual Cake Gallery with Hover Overlays
import React from "react";

const Gallery = () => {
  const galleryItems = [
    { image: "/image/o1.png", title: "Donuts" },
    { image: "/image/o2.png", title: "Ice Cream" },
    { image: "/image/o3.png", title: "Cup Cake" },
    { image: "/image/o4.png", title: "Delicious Cake" },
    { image: "/image/o5.png", title: "Chocolate Cake" },
    { image: "/image/o6.png", title: "Slice Cake" },
    { image: "/image/menu1.jpg", title: "Delicious Cake" },
    { image: "/image/menu2.jpg", title: "Chocolate Cake" },
    { image: "/image/menu3.jpg", title: "Slice Cake" },
    { image: "/image/menu4.jpg", title: "Delicious Cake" },
    { image: "/image/menu5.jpg", title: "Chocolate Cake" },
    { image: "/image/menu6.jpg", title: "Slice Cake" },
  ];

  return (
    <section id="gallary" className="max-w-7xl mx-auto px-4 mt-20 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#a16d0e] drop-shadow border-b-2 border-[#a16d0e] pb-3 mb-10 tracking-widest">
        OUR GALLERY
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            className="group relative rounded-lg overflow-hidden shadow-xl cursor-pointer bg-white"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
            />
            {/* Dark Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
              <h3 className="text-white text-2xl font-bold drop-shadow-lg tracking-wider transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;