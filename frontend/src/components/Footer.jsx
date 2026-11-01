// Purpose: Website Footer with Social Media Links
import React from "react";

const Footer = () => {
  return (
    <footer id="footer" className="w-full bg-[#573818] text-white mt-24 py-10 shadow-2xl font-uchen">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-3 flex items-center justify-center">
          <span>BakeHaven</span>
        </h2>
        <p className="text-gray-200 text-sm max-w-2xl mx-auto mb-6 leading-relaxed">
          A cake is a type of (usually) sweet dessert which is baked. Originally, it was a bread-like food,
          but no longer. Cakes are often made to celebrate special occasions like birthdays or weddings.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center space-x-4 mb-6">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white text-[#573818] hover:bg-[#a16d0e] hover:text-white flex items-center justify-center text-xl transition duration-300 shadow"
          >
            <i className="bx bxl-twitter"></i>
          </a>
          <a
            href="https://github.com/incredible7777"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-white text-[#573818] hover:bg-[#a16d0e] hover:text-white flex items-center justify-center text-xl transition duration-300 shadow"
          >
            <i className="bx bxl-github"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white text-[#573818] hover:bg-[#a16d0e] hover:text-white flex items-center justify-center text-xl transition duration-300 shadow"
          >
            <i className="bx bxl-google"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/atulya-pandey-8a440328b/"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-full bg-white text-[#573818] hover:bg-[#a16d0e] hover:text-white flex items-center justify-center text-xl transition duration-300 shadow"
          >
            <i className="bx bxl-linkedin"></i>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white text-[#573818] hover:bg-[#a16d0e] hover:text-white flex items-center justify-center text-xl transition duration-300 shadow"
          >
            <i className="bx bxl-instagram"></i>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-300 border-t border-white/20 pt-4">
          &copy; Copyright <strong>BakeHaven</strong>. All Rights Reserved
          <div className="mt-1">
            Designed By <span className="text-[#a16d0e] font-bold">Atulya</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;