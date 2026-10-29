// Purpose: Orders Page (Matching orders.html 1:1)
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderQty, removeOrder, createOrder } from "../redux/slices/orderSlice";

const Orders = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading } = useSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [suggestionQuantities, setSuggestionQuantities] = useState([1, 1, 1, 1]);

  const suggestions = [
    { name: "Cream Cake", description: "A delicious cream cake with soft layers and rich cream.", price: 1200, image: "/image/c1.png" },
    { name: "Choco Cake", description: "Rich chocolate cake for chocolate lovers.", price: 1600, image: "/image/c2.png" },
    { name: "Slice Cake", description: "Perfectly sliced cake for every occasion.", price: 900, image: "/image/c3.png" },
    { name: "Fruit Cake", description: "Fresh fruit cake with seasonal fruits.", price: 1400, image: "/image/c4.png" },
  ];

  useEffect(() => {
    if (!user) {
      onOpenAuth();
      navigate("/");
    } else {
      dispatch(fetchOrders());
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    if (orders && orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  const handleQtyChange = (orderId, itemName, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    dispatch(updateOrderQty({ orderId, itemName, quantity: newQty }));
  };

  const handleRemove = (orderId) => {
    if (window.confirm("Are you sure you want to remove this order?")) {
      dispatch(removeOrder(orderId));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const handleBuyNow = (orderId) => {
    alert(`Thank you for your purchase! (Order ID: ${orderId})`);
  };

  const handleSuggestionQty = (idx, delta) => {
    setSuggestionQuantities((prev) => {
      const updated = [...prev];
      updated[idx] = Math.max(1, updated[idx] + delta);
      return updated;
    });
  };

  const handleAddSuggestionToCart = (cake, idx) => {
    dispatch(
      createOrder([
        {
          name: cake.name,
          price: cake.price,
          image: cake.image,
          quantity: suggestionQuantities[idx],
        },
      ])
    );
    alert(`Added ${suggestionQuantities[idx]}x "${cake.name}" to your cart!`);
  };

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#573818] mb-8">My Orders</h1>

        {loading && orders.length === 0 ? (
          <div className="text-center py-12 text-[#a16d0e] font-bold">Loading your orders...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Orders List */}
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                  You have no orders yet. Explore our cakes to place your first order!
                </div>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items[0] || {};
                  const isSelected = selectedOrder?._id === order._id;

                  return (
                    <div
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition duration-300 border-2 ${
                        isSelected ? "border-[#573818] shadow-xl" : "border-transparent hover:border-[#573818]"
                      }`}
                    >
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex justify-between items-center text-sm">
                        <span>
                          Order ID: <strong>{order._id}</strong>
                        </span>
                        <span className="font-bold text-[#573818]">Status: {order.status}</span>
                      </div>

                      <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                        <img
                          src={firstItem.image || "/image/c1.png"}
                          alt={firstItem.name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 w-full">
                          <h4 className="font-bold text-lg text-[#573818] mb-2">Items:</h4>
                          <ul className="space-y-1 mb-3">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex items-center space-x-2 text-sm">
                                <strong>{item.name}</strong>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQtyChange(order._id, item.name, item.quantity, -1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className="text-gray-600 font-semibold">x{item.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQtyChange(order._id, item.name, item.quantity, 1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </li>
                            ))}
                          </ul>

                          <div className="flex space-x-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyNow(order._id);
                              }}
                              className="bg-[#573818] hover:bg-[#8d5524] text-white font-bold px-4 py-1.5 rounded text-sm transition"
                            >
                              Buy Now
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(order._id);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded text-sm transition"
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

            {/* Right: Selected Cake Preview Detail Card */}
            {selectedOrder && selectedOrder.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#573818]/20 sticky top-24">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={selectedOrder.items[0].image || "/image/c1.png"}
                    alt={selectedOrder.items[0].name}
                    className="w-48 h-48 object-contain rounded-xl drop-shadow"
                  />
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-[#573818]">{selectedOrder.items[0].name}</h3>
                    <p className="text-xl font-bold text-[#a16d0e]">RS: {selectedOrder.items[0].price || 1200}</p>
                    <p className="text-sm text-gray-700">A delicious artisanal cake with soft sponge and rich cream.</p>
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => handleBuyNow(selectedOrder._id)}
                        className="bg-[#573818] hover:bg-[#8d5524] text-white font-bold px-5 py-2 rounded text-sm transition shadow"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => handleRemove(selectedOrder._id)}
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

        {/* You May Also Like Suggestions */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-[#573818] mb-6">You May Also Like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((cake, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-4 flex items-center gap-4 border border-gray-100">
                <img src={cake.image} alt={cake.name} className="w-24 h-24 object-contain rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-[#573818]">{cake.name}</h4>
                  <p className="text-sm font-bold text-[#a16d0e] mb-1">RS: {cake.price}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{cake.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleSuggestionQty(idx, -1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{suggestionQuantities[idx]}</span>
                    <button
                      onClick={() => handleSuggestionQty(idx, 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddSuggestionToCart(cake, idx)}
                    className="mt-2 bg-[#573818] hover:bg-[#8d5524] text-white text-xs font-bold px-4 py-1.5 rounded transition shadow"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

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

export default Orders;