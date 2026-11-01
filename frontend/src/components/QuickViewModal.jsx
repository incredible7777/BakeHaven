// ========================================================
// File: frontend/src/components/QuickViewModal.jsx
// Purpose: Quick View Cake Details Popup with Clean Spacing & Alignment
// ========================================================
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../redux/slices/orderSlice";
import { addToWishlist } from "../redux/slices/wishlistSlice";

const QuickViewModal = ({ product, onClose, onOpenAuth }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    dispatch(
      createOrder([
        {
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ])
    );
    alert(`"${product.name}" added to cart!`);
    onClose();
  };

  const handleWishlist = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    dispatch(
      addToWishlist({
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        quantity: 1,
      })
    );
    alert(`"${product.name}" added to wishlist!`);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-uchen"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl md:max-w-3xl bg-gradient-to-br from-[#f8e7d2] to-[#e2b58d] rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 animate-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-[#573818] hover:text-black hover:rotate-90 text-2xl font-bold transition-transform duration-300 focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Zoomed Cake Image Card */}
          <div className="md:col-span-5 flex justify-center items-center bg-white/40 rounded-2xl p-6 border border-white/50 shadow-inner min-h-[220px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-56 max-w-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right Column: Cake Details */}
          <div className="md:col-span-7 space-y-4">
            {/* Category Pill with Clear Vertical Clearance */}
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[2px] text-[#8d5524] bg-white/80 px-3.5 py-1 rounded-full shadow-xs border border-amber-200/50">
                {product.category || "Cakes"}
              </span>
            </div>

            {/* Cake Name with Clean Word Spacing & Line Height */}
            <h3 className="text-2xl sm:text-3xl font-bold text-[#573818] leading-tight flex flex-wrap items-center gap-2">
              {product.name.split(" ").map((word, idx) => (
                <span key={idx}>{word}</span>
              ))}
            </h3>

            {/* Stars */}
            <div className="flex items-center space-x-1 text-yellow-500 text-base">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`bx ${i < (product.stars || 4) ? "bxs-star" : "bx-star text-black/20"}`}
                ></i>
              ))}
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-[#573818] flex items-center gap-1.5">
              <span>RS:</span>
              <span className="text-[#8d5524]">{product.price}</span>
            </p>

            {/* Description & Quote */}
            <p className="text-sm text-gray-800 leading-relaxed">
              {product.description}
            </p>
            {product.quote && (
              <p className="text-xs italic text-[#573818] font-semibold border-l-2 border-[#573818]/40 pl-3 py-0.5">
                "{product.quote}"
              </p>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#573818] hover:bg-[#8d5524] active:scale-98 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition duration-300 cursor-pointer text-sm tracking-wider uppercase text-center"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className="bg-[#a16d0e] hover:bg-[#573818] active:scale-98 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition duration-300 cursor-pointer text-sm tracking-wider uppercase text-center"
              >
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
