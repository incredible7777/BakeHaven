// ========================================================
// File: frontend/src/pages/Wishlist.jsx
// Purpose: Wishlist Page with Reactive Preview Card (Matching wishlist.html 1:1)
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
    if (newQty < 1) return;
    dispatch(updateWishlistQty({ itemName, quantity: newQty }));
  };

  const handleRemove = (itemName) => {
    if (window.confirm("Are you sure you want to remove this item from your wishlist?")) {
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
    alert(`"${item.name}" added to cart!`);
  };

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#573818] mb-8">My Wishlist</h1>

        {loading && wishlist.length === 0 ? (
          <div className="text-center py-12 text-[#a16d0e] font-bold">Loading your wishlist...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Wishlist Items List */}
            <div className="space-y-6">
              {wishlist.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                  Your wishlist is empty. Browse cakes to add your favorites!
                </div>
              ) : (
                wishlist.map((item, idx) => {
                  const isSelected = activeItem?.name === item.name;
                  const total = (item.price || 1000) * (item.quantity || 1);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedItemName(item.name)}
                      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition duration-300 border-2 ${
                        isSelected ? "border-[#573818] shadow-xl" : "border-transparent hover:border-[#573818]"
                      }`}
                    >
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-bold text-lg text-[#573818]">
                        {item.name}
                      </div>

                      <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <img
                          src={item.image || "/image/c1.png"}
                          alt={item.name}
                          className="w-24 h-24 object-contain rounded-lg border border-gray-100"
                        />
                        <div className="flex-1 w-full space-y-1">
                          <p className="text-sm">
                            <strong>Price:</strong> RS: {item.price || 1000}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>

                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQtyChange(item.name, item.quantity || 1, -1);
                              }}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm">{item.quantity || 1}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQtyChange(item.name, item.quantity || 1, 1);
                              }}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                            <span className="text-sm font-bold text-[#a16d0e] pl-2">Total: RS: {total}</span>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                              }}
                              className="bg-[#573818] hover:bg-[#8d5524] text-white font-bold px-4 py-1.5 rounded text-sm transition shadow"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(item.name);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded text-sm transition shadow"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Selected Detail Card (Reactive) */}
            {activeItem && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#573818]/20 sticky top-24">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={activeItem.image || "/image/c1.png"}
                    alt={activeItem.name}
                    className="w-48 h-48 object-contain rounded-xl drop-shadow"
                  />
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-[#573818]">{activeItem.name}</h3>
                    <p className="text-xl font-bold text-[#a16d0e]">RS: {activeItem.price || 1000}</p>
                    <p className="text-sm text-gray-700">A delicious freshly baked cake crafted with care.</p>
                    <p className="text-lg font-bold text-[#573818]">
                      Total: RS: {(activeItem.price || 1000) * (activeItem.quantity || 1)}
                    </p>
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => handleAddToCart(activeItem)}
                        className="bg-[#573818] hover:bg-[#8d5524] text-white font-bold px-5 py-2 rounded text-sm transition shadow"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(activeItem.name)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded text-sm transition shadow"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10">
          <Link
            to="/"
            className="inline-block border border-[#573818] text-[#573818] hover:bg-[#573818] hover:text-white font-bold px-6 py-2 rounded transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
