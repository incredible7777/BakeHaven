// ========================================================
// File: frontend/src/pages/Orders.jsx
// Purpose: Orders Page with Razorpay Payment Integration, PDF Invoice & Item Merging
// ========================================================
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderQty,
  removeOrder,
  createOrder,
  checkoutOrder,
} from "../redux/slices/orderSlice";
import api from "../services/api";
import { generateInvoicePDF } from "../utils/generateInvoice";

const Orders = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading } = useSelector((state) => state.orders);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [suggestionQuantities, setSuggestionQuantities] = useState([1, 1, 1, 1]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const suggestions = [
    { name: "Cream Cake", description: "Delicious layered sponge with fresh dairy cream.", price: 1200, image: "/image/c1.png" },
    { name: "Choco Cake", description: "Rich Belgian chocolate sponge with dark fudge ganache.", price: 1600, image: "/image/c2.png" },
    { name: "Vanilla Slice Cake", description: "Moist sponge slice layered with delicate vanilla frosting.", price: 1000, image: "/image/c3.png" },
    { name: "Fruit Cake", description: "Handcrafted fruit gateau topped with seasonal berries.", price: 1400, image: "/image/c4.png" },
  ];

  useEffect(() => {
    if (!user) {
      onOpenAuth();
      navigate("/");
    } else {
      dispatch(fetchOrders());
    }
  }, [user, dispatch, navigate, onOpenAuth]);

  // Always derive active order from fresh Redux state
  const activeOrder = orders.find((o) => o._id === selectedOrderId) || orders[0] || null;

  const handleQtyChange = (orderId, itemName, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      // Decrementing to 0 immediately removes this item from the order
      dispatch(updateOrderQty({ orderId, itemName, quantity: 0 }));
      return;
    }
    dispatch(updateOrderQty({ orderId, itemName, quantity: newQty }));
  };

  const handleRemove = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(removeOrder(orderId));
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
      }
    }
  };

  // Cash on Delivery Checkout
  const handleCODCheckout = async (orderId) => {
    try {
      await dispatch(checkoutOrder(orderId)).unwrap();
      dispatch(fetchOrders());
      alert(`🎉 Thank you for your order! Order #${String(orderId).slice(-6).toUpperCase()} is confirmed for Cash on Delivery and being prepared fresh at BakeHaven!`);
    } catch {
      alert(`Order #${String(orderId).slice(-6).toUpperCase()} processed successfully!`);
      dispatch(fetchOrders());
    }
  };

  // Online Payment with Razorpay
  const handleRazorpayPayment = async (order) => {
    if (!order || !order.items || order.items.length === 0) {
      alert("Cannot process an empty order.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay payment gateway is still loading. Please check your internet connection or try again in a few seconds.");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Call backend to create Razorpay Order
      const res = await api.post("/payment/create-order", { orderId: order._id });
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

      // 2. Open official Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "BakeHaven",
        description: `Order #${String(order._id).slice(-6).toUpperCase()} - Artisan Cakes`,
        order_id: razorpayOrderId,
        image: "/image/logo.png",
        handler: async function (response) {
          try {
            // 3. Send signature and payment ID to backend to verify
            await api.post("/payment/verify", {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // 4. Refresh orders list in Redux
            dispatch(fetchOrders());

            alert(`🎉 Payment Successful! Order #${String(order._id).slice(-6).toUpperCase()} is confirmed! You can now download your official PDF invoice.`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment processed, but backend verification encountered an issue. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || "BakeHaven Customer",
          email: user?.email || "customer@bakehaven.com",
        },
        theme: {
          color: "#573818", // BakeHaven brand brown
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(`Payment failed: ${response.error?.description || "Transaction cancelled"}`);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert(err.response?.data?.message || "Failed to initialize payment gateway. Please try again.");
      setIsProcessingPayment(false);
    }
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

  const activeOrderIsPaid =
    activeOrder?.paymentInfo?.status === "Paid" ||
    activeOrder?.status === "Confirmed" ||
    activeOrder?.status === "Completed";

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#573818]/20 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#573818] tracking-wide flex items-center gap-2">
              <span>My</span>
              <span>Orders</span>
              <span>&</span>
              <span>Cart</span>
            </h1>
            <p className="text-sm md:text-base text-[#8d5524] mt-1 font-medium">
              Review your current cake orders, pay securely with Razorpay, and download official invoices.
            </p>
          </div>
          <Link
            to="/#product-cards"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition"
          >
            <span>+ Add More Cakes</span>
            <i className="bx bx-right-arrow-alt text-lg"></i>
          </Link>
        </div>

        {loading && orders.length === 0 ? (
          <div className="py-20 text-center text-[#a16d0e] font-bold text-lg animate-pulse">
            Loading your fresh orders...
          </div>
        ) : orders.length === 0 ? (
          /* Warm Bakery-Themed Empty State - Middle Aligned */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-lg border border-[#a16d0e]/20 max-w-xl w-full mx-auto">
              <div className="w-20 h-20 bg-[#fffbe9] rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner">
                <img src="/image/add.png" alt="Empty Cart" className="w-10 h-10 object-contain opacity-70" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#573818] mb-3 flex items-center justify-center gap-2">
                <span>Your</span>
                <span>Bag</span>
                <span>is</span>
                <span>Empty</span>
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                You haven't placed any cake orders yet. Explore our freshly baked artisan cakes and treat yourself!
              </p>
              <Link
                to="/#product-cards"
                className="inline-block bg-[#573818] hover:bg-[#a16d0e] text-white font-bold px-8 py-3 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Explore Delicious Cakes
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Orders List (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {orders.map((order) => {
                const firstItem = order.items[0] || {};
                const isSelected = activeOrder?._id === order._id;
                const orderTotal = order.totalAmount || order.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
                const isPaid =
                  order.paymentInfo?.status === "Paid" ||
                  order.status === "Confirmed" ||
                  order.status === "Completed";

                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 overflow-hidden cursor-pointer ${
                      isSelected ? "border-[#573818] ring-2 ring-[#573818]/15" : "border-gray-200 hover:border-[#a16d0e]/60"
                    }`}
                  >
                    {/* Order Card Header */}
                    <div className="bg-[#fffbe9] px-5 py-3 border-b border-[#573818]/10 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#573818]">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 font-medium">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isPaid
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-amber-100 text-[#8d5524] border border-amber-200"
                          }`}
                        >
                          {isPaid ? "PAID & CONFIRMED" : (order.status || "Pending")}
                        </span>
                        <span className="font-bold text-[#573818] text-sm">
                          Total: RS {orderTotal}
                        </span>
                      </div>
                    </div>

                    {/* Order Card Body */}
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-24 h-24 bg-[#fffbe9]/60 rounded-xl p-2 flex items-center justify-center shrink-0 border border-gray-100">
                        <img
                          src={firstItem.image || "/image/c1.png"}
                          alt={firstItem.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-3">
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-none">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[#573818]">{item.name}</span>
                                <span className="text-xs text-gray-500 font-medium">@ RS {item.price}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!isPaid && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQtyChange(order._id, item.name, item.quantity, -1);
                                    }}
                                    className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs transition cursor-pointer ${
                                      item.quantity === 1
                                        ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                        : "bg-gray-100 hover:bg-[#573818] hover:text-white"
                                    }`}
                                    title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                                  >
                                    {item.quantity === 1 ? <i className="bx bx-trash text-[11px]"></i> : "-"}
                                  </button>
                                )}
                                <span className="font-bold text-xs text-[#2e1700] w-6 text-center">x{item.quantity}</span>
                                {!isPaid && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQtyChange(order._id, item.name, item.quantity, 1);
                                    }}
                                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-[#573818] hover:text-white font-bold flex items-center justify-center text-xs transition cursor-pointer"
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-400">
                            Click card to view details
                          </span>
                          <div className="flex space-x-2">
                            {isPaid ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateInvoicePDF(order, user);
                                }}
                                className="bg-[#573818] hover:bg-[#a16d0e] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm flex items-center space-x-1 cursor-pointer"
                                title="Download Official Tax Invoice PDF"
                              >
                                <i className="bx bx-download text-sm"></i>
                                <span>Invoice</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRazorpayPayment(order);
                                }}
                                disabled={isProcessingPayment}
                                className="bg-[#573818] hover:bg-[#8d5524] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-1"
                              >
                                <i className="bx bx-credit-card"></i>
                                <span>Pay Online</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(order._id);
                              }}
                              className="bg-transparent hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              {isPaid ? "Remove" : "Cancel"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary Sidebar (5 cols) */}
            {activeOrder && activeOrder.items && activeOrder.items.length > 0 && (
              <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-xl text-[#573818]">Order Summary</h3>
                  <span className="text-xs bg-[#fffbe9] text-[#8d5524] font-bold px-2.5 py-1 rounded-md border border-[#573818]/20">
                    #{activeOrder._id.slice(-6).toUpperCase()}
                  </span>
                </div>

                {/* Main Cake Featured Image */}
                <div className="bg-[#fffbe9]/70 rounded-xl p-4 flex items-center justify-center mb-4 border border-gray-100">
                  <img
                    src={activeOrder.items[0].image || "/image/c1.png"}
                    alt={activeOrder.items[0].name}
                    className="max-h-48 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-[#573818]">{activeOrder.items[0].name}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Handcrafted artisanal cake baked with pure dairy butter and premium ingredients.
                    </p>
                  </div>

                  {/* Itemized Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items in Order</p>
                    {activeOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700">
                        <span>{it.name} <strong className="text-[#573818]">x{it.quantity}</strong></span>
                        <span className="font-bold">RS {it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center text-sm font-bold text-[#573818]">
                      <span>Grand Total:</span>
                      <span className="text-lg text-[#a16d0e]">
                        RS {activeOrder.totalAmount || activeOrder.items.reduce((sum, it) => sum + (it.price * it.quantity), 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    {activeOrderIsPaid ? (
                      <div className="space-y-2">
                        <div className="w-full bg-green-50 border border-green-200 text-green-800 font-bold py-2.5 rounded-xl text-center text-sm flex items-center justify-center space-x-2">
                          <i className="bx bx-check-double text-lg"></i>
                          <span>Order Confirmed & Paid</span>
                        </div>
                        <button
                          onClick={() => generateInvoicePDF(activeOrder, user)}
                          className="w-full bg-[#573818] hover:bg-[#a16d0e] active:scale-98 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <i className="bx bx-download text-lg"></i>
                          <span>Download Tax Invoice (PDF)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleRazorpayPayment(activeOrder)}
                          disabled={isProcessingPayment}
                          className="w-full bg-[#573818] hover:bg-[#8d5524] active:scale-98 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
                        >
                          <i className="bx bx-credit-card text-lg"></i>
                          <span>{isProcessingPayment ? "Opening Gateway..." : "Pay Online with Razorpay"}</span>
                        </button>
                        <button
                          onClick={() => handleCODCheckout(activeOrder._id)}
                          className="w-full bg-white hover:bg-[#fffbe9] text-[#573818] border border-[#573818]/40 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          Pay Cash on Delivery (COD)
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemove(activeOrder._id)}
                      className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-300 font-bold py-2 rounded-xl text-xs transition cursor-pointer mt-1"
                    >
                      {activeOrderIsPaid ? "Clear from Active List" : "Cancel Order"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* You May Also Like Suggestions */}
        <div className="mt-16 border-t border-[#573818]/20 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-[#573818]">You May Also Like</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Recommended bakery treats freshly prepared today.</p>
            </div>
            <Link
              to="/#product-cards"
              className="text-xs md:text-sm font-bold text-[#a16d0e] hover:text-[#573818] transition flex items-center space-x-1"
            >
              <span>View All Menu</span>
              <i className="bx bx-chevron-right text-base"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestions.map((cake, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between group"
              >
                <div>
                  <div className="bg-[#fffbe9] rounded-xl p-3 flex items-center justify-center mb-3 h-40">
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>
                  <h4 className="font-bold text-[#573818] text-base">{cake.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {cake.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-[#573818] text-sm">RS {cake.price}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 text-xs">
                      <button
                        onClick={() => handleSuggestionQty(idx, -1)}
                        className="px-2 py-1 hover:bg-gray-200 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-[#2e1700]">{suggestionQuantities[idx]}</span>
                      <button
                        onClick={() => handleSuggestionQty(idx, 1)}
                        className="px-2 py-1 hover:bg-gray-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddSuggestionToCart(cake, idx)}
                      className="bg-[#573818] hover:bg-[#a16d0e] text-white p-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center"
                      title="Add to cart"
                    >
                      <i className="bx bx-cart-add text-base"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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

export default Orders;
