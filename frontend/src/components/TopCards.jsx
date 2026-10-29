// Purpose: Feature Boxes (box1, box2, box3)
import React from "react";

const TopCards = () => {
  const boxes = ["/image/box1.jpg", "/image/box2.jpg", "/image/box3.jpg"];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-12" data-aos="fade-up" data-aos-duration="1500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boxes.map((imgSrc, idx) => (
          <div
            key={idx}
            className="rounded-lg overflow-hidden shadow-lg hover:-translate-y-2.5 transition duration-500 cursor-pointer bg-white"
          >
            <img src={imgSrc} alt={`Bakery Box ${idx + 1}`} className="w-full h-64 object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCards;