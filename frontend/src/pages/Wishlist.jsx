// ========================================================
// File: frontend/src/pages/Wishlist.jsx
// Purpose: Wishlist Page with Polished Typography, Text Alignment & Reactive Summary
// ========================================================
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist, updateWishlistQty, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { createOrder } from "../redux/slices/orderSlice";

const Wishlist = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: wishlist, loading } = useSelector((state) => state.wishlist);
  const [selectedItemName, setSelectedItemName] = useState(null);

  useEffect(() => {
    if (!user) {
      onOpenAuth();
      navigate("/");
    } else {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch, navigate, onOpenAuth]);

  // Always derive active item from fresh Redux state
  const activeItem = wishlist.find((i) => i.name === selectedItemName) || wishlist[0] || null;

  const handleQtyChange = (itemName, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      // Decrementing to 0 immediately removes this item from the wishlist
      dispatch(removeFromWishlist(itemName));
      if (selectedItemName === itemName) {
        setSelectedItemName(null);
      }
      return;
    }
    dispatch(updateWishlistQty({ itemName, quantity: newQty }));
  };

  const handleRemove = (itemName) => {
    if (window.confirm(`Are you sure you want to remove "${itemName}" from your wishlist?`)) {
      dispatch(removeFromWishlist(itemName));
      if (selectedItemName === itemName) {
        setSelectedItemName(null);
      }
    }
  };

  const handleAddToCart = (item) => {
    dispatch(
      createOrder([
        {
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1,
        },
      ])
    );
    alert(`"${item.name}" (x${item.quantity || 1}) added to your cart!`);
  };

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#573818]/20 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#573818] tracking-wide flex items-center gap-2">
              <span>My</span>
              <span>Wishlist</span>
            </h1>
            <p className="text-sm md:text-base text-[#8d5524] mt-1 font-medium">
              Save your favorite cakes and desserts to order anytime.
            </p>
          </div>
          <Link
            to="/#product-cards"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition"
          >
            <span>+ Discover More Cakes</span>
            <i className="bx bx-right-arrow-alt text-lg"></i>
          </Link>
        </div>

        {loading && wishlist.length === 0 ? (
          <div className="py-20 text-center text-[#a16d0e] font-bold text-lg animate-pulse">
            Loading your saved cakes...
          </div>
        ) : wishlist.length === 0 ? (
          /* Warm Bakery-Themed Empty State - Middle Aligned */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-lg border border-[#a16d0e]/20 max-w-xl w-full mx-auto">
              <div className="w-20 h-20 bg-[#fffbe9] rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner">
                <img src="/image/heart.png" alt="Empty Wishlist" className="w-10 h-10 object-contain opacity-70" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#573818] mb-3 flex items-center justify-center gap-2">
                <span>Your</span>
                <span>Wishlist</span>
                <span>is</span>
                <span>Empty</span>
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                You haven't saved any cakes yet. Browse our BakeHaven collection and tap the heart icon to save your favorites!
              </p>
              <Link
                to="/#product-cards"
                className="inline-block bg-[#573818] hover:bg-[#a16d0e] text-white font-bold px-8 py-3 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Browse BakeHaven Menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Wishlist Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {wishlist.map((item, idx) => {
                const isSelected = activeItem?.name === item.name;
                const total = (item.price || 1000) * (item.quantity || 1);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItemName(item.name)}
                    className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 overflow-hidden cursor-pointer ${
                      isSelected ? "border-[#573818] ring-2 ring-[#573818]/15" : "border-gray-200 hover:border-[#a16d0e]/60"
                    }`}
                  >
                    {/* Wishlist Item Body */}
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-24 h-24 bg-[#fffbe9]/60 rounded-xl p-2 flex items-center justify-center shrink-0 border border-gray-100">
                        <img
                          src={item.image || "/image/c1.png"}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg text-[#573818]">{item.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.description || "Freshly baked cake delight."}</p>
                          </div>
                          <span className="font-bold text-base text-[#a16d0e]">RS {total}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 font-medium">Qty:</span>
                            <div className="flex items-center space-x-1.5 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQtyChange(item.name, item.quantity || 1, -1);
                                }}
                                className={`w-5 h-5 rounded font-bold flex items-center justify-center text-xs transition shadow-xs cursor-pointer ${
                                  (item.quantity || 1) === 1
                                    ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                    : "bg-white hover:bg-[#573818] hover:text-white"
                                }`}
                                title={(item.quantity || 1) === 1 ? "Remove item" : "Decrease quantity"}
                              >
                                {(item.quantity || 1) === 1 ? <i className="bx bx-trash text-[10px]"></i> : "-"}
                              </button>
                              <span className="font-bold text-xs text-[#2e1700] px-1">{item.quantity || 1}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQtyChange(item.name, item.quantity || 1, 1);
                                }}
                                className="w-5 h-5 rounded bg-white hover:bg-[#573818] hover:text-white font-bold flex items-center justify-center text-xs transition shadow-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs text-gray-400">(@ RS {item.price || 1000})</span>
                          </div>

                          {/* Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                              }}
                              className="bg-[#573818] hover:bg-[#8d5524] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(item.name);
                              }}
                              className="bg-transparent hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Wishlist Detail Preview Card (5 cols, Sticky) */}
            {activeItem && (
              <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl p-6 border border-[#573818]/15 sticky top-24">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-bold text-lg text-[#573818]">Item Preview</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    In Wishlist
                  </span>
                </div>

                {/* Main Cake Featured Image */}
                <div className="bg-[#fffbe9]/70 rounded-xl p-4 flex items-center justify-center mb-4 border border-gray-100">
                  <img
                    src={activeItem.image || "/image/c1.png"}
                    alt={activeItem.name}
                    className="max-h-48 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-[#573818]">{activeItem.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {activeItem.description || "A delectable artisan cake crafted with premium bakery ingredients."}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                    <div className="flex justify-between text-xs text-gray-700">
                      <span>Unit Price:</span>
                      <span className="font-bold">RS {activeItem.price || 1000}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-700">
                      <span>Quantity:</span>
                      <span className="font-bold">{activeItem.quantity || 1}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center text-sm font-bold text-[#573818]">
                      <span>Estimated Subtotal:</span>
                      <span className="text-lg text-[#a16d0e]">
                        RS {(activeItem.price || 1000) * (activeItem.quantity || 1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => handleAddToCart(activeItem)}
                      className="w-full bg-[#573818] hover:bg-[#8d5524] active:scale-98 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md cursor-pointer"
                    >
                      Move to Cart & Order
                    </button>
                    <button
                      onClick={() => handleRemove(activeItem.name)}
                      className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-300 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 text-center md:text-left">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 border-2 border-[#573818] text-[#573818] hover:bg-[#573818] hover:text-white font-bold px-6 py-2 rounded-xl transition duration-300 shadow-sm"
          >
            <i className="bx bx-left-arrow-alt text-lg"></i>
            <span>Return to BakeHaven Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
