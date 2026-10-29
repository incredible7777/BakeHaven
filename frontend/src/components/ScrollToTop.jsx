// Purpose: Floating Button to Smoothly Scroll to Page Top
import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-10 right-10 w-12 h-12 bg-[#a16d0e] hover:bg-[#573818] text-white rounded-full flex items-center justify-center shadow-2xl transition duration-300 z-40 focus:outline-none"
      title="Back to Top"
    >
      <img src="/image/up-arrow.png" alt="Up Arrow" className="w-6 h-6 object-contain" />
    </button>
  );
};

export default ScrollToTop;