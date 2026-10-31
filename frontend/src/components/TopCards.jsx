// Purpose: Feature Boxes (box1, box2, box3) with Smooth Elevating Hover
import React from "react";

const TopCards = () => {
  const boxes = [
    { image: "/image/box1.jpg", alt: "Artisan Chocolate Cakes" },
    { image: "/image/box2.jpg", alt: "Fresh Fruit Tarts & Pastries" },
    { image: "/image/box3.jpg", alt: "Celebration Cupcakes" },
  ];

  return (
    <section id="box" className="max-w-7xl mx-auto px-4 mt-14 font-uchen" data-aos="fade-up" data-aos-duration="1500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boxes.map((item, idx) => (
          <div
            key={idx}
            className="group rounded-2xl overflow-hidden shadow-xl hover:-translate-y-3 transition-all duration-500 cursor-pointer bg-white border border-[#a16d0e]/20"
          >
            <img
              src={item.image}
              alt={item.alt}
              className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCards;
