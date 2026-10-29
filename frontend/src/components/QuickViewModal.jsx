// Purpose: Quick View Cake Details Popup
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
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-uchen">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-gradient-to-br from-[#f8e7d2] to-[#e2b58d] rounded-2xl shadow-2xl p-6 border-none animate-modal">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#573818] hover:text-black text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Zoomed Cake Image */}
          <div className="flex justify-center bg-white/30 rounded-xl p-4">
            <img src={product.image} alt={product.name} className="max-h-64 object-contain drop-shadow-xl" />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a16d0e] bg-white/50 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <h3 className="text-3xl font-bold text-[#573818]">{product.name}</h3>

            {/* Stars */}
            <div className="flex items-center space-x-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`bx ${i < (product.stars || 4) ? "bxs-star" : "bx-star text-gray-400"}`}
                ></i>
              ))}
            </div>

            <p className="text-2xl font-bold text-[#573818]">RS: {product.price}</p>
            <p className="text-sm text-gray-800 leading-relaxed">{product.description}</p>
            <p className="text-xs italic text-[#573818] font-bold">"{product.quote}"</p>

            {/* Actions */}
            <div className="pt-3 flex space-x-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#573818] hover:bg-[#8d5524] text-white font-bold py-2 px-4 rounded shadow transition"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className="bg-[#a16d0e] hover:bg-[#573818] text-white font-bold py-2 px-4 rounded shadow transition"
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