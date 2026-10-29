// Purpose: Individual Cake Card with Hover Action Overlay
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist } from "../redux/slices/wishlistSlice";
import { createOrder } from "../redux/slices/orderSlice";

const ProductCard = ({ product, onQuickView, onOpenAuth }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleWishlist = (e) => {
    e.stopPropagation();
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
    alert(`"${product.name}" added to your wishlist!`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
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
    alert(`"${product.name}" added to your cart!`);
  };

  return (
    <div
      className="group relative bg-[#a16d0e] text-[#2e1700] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl font-uchen flex flex-col justify-between"
      data-aos="fade-up"
    >
      {/* Top Image & Hover Overlay Container */}
      <div className="relative overflow-hidden bg-white/10 flex items-center justify-center p-4 min-h-[220px]">
        {/* Cake Image */}
        <img
          src={product.image}
          alt={product.name}
          className="max-h-44 object-contain group-hover:scale-105 transition duration-500"
        />

        {/* Hover Action Overlay Icons */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10">
          <button
            onClick={() => onQuickView(product)}
            title="Quick View"
            className="w-8 h-8 rounded-full bg-[#2e1700] hover:bg-[#573818] p-1.5 flex items-center justify-center shadow-lg transition"
          >
            <img src="/image/views.png" alt="Quick View" className="w-4 h-4 object-contain" />
          </button>
          <button
            onClick={handleWishlist}
            title="Add to Wishlist"
            className="w-8 h-8 rounded-full bg-[#2e1700] hover:bg-[#573818] p-1.5 flex items-center justify-center shadow-lg transition"
          >
            <img src="/image/heart.png" alt="Wishlist" className="w-4 h-4 object-contain" />
          </button>
          <button
            onClick={handleAddToCart}
            title="Add to Cart"
            className="w-8 h-8 rounded-full bg-[#2e1700] hover:bg-[#573818] p-1.5 flex items-center justify-center shadow-lg transition"
          >
            <img src="/image/add.png" alt="Add to Cart" className="w-4 h-4 object-contain" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold text-white drop-shadow mb-1">{product.name}</h3>

          {/* Star Rating */}
          <div className="flex items-center space-x-0.5 text-yellow-300 text-sm mb-2">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`bx ${i < (product.stars || 4) ? "bxs-star" : "bx-star text-gray-400"}`}
              ></i>
            ))}
          </div>

          <p className="text-xs font-bold text-[#2e1700] line-clamp-2 italic mb-3">
            "{product.quote || "Cake is an emotion."}"
          </p>
        </div>

        {/* Price & Add Cart Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2e1700]/20">
          <span className="text-lg font-bold text-[#2e1700]">RS: {product.price}</span>
          <button
            onClick={handleAddToCart}
            className="text-xs tracking-wider font-bold border-2 border-[#573818] text-[#573818] hover:bg-[#2e1700] hover:text-white px-3 py-1 rounded transition duration-300"
          >
            Add Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;