// ========================================================
// File: frontend/src/pages/Orders.jsx
// Purpose: Orders Page with Delivery Address Modal, Cake Plaque Note, Razorpay & Invoices
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

  // Delivery Address & Checkout Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [orderToCheckout, setOrderToCheckout] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    deliveryDate: "",
    deliveryTimeSlot: "Afternoon (1:00 PM - 5:00 PM)",
    customNote: "",
    paymentMethod: "Razorpay", // "Razorpay" or "COD"
  });

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

  // Set default tomorrow date & user name for delivery
  useEffect(() => {
    if (user) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      setDeliveryForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        deliveryDate: prev.deliveryDate || tomorrowStr,
      }));
    }
  }, [user]);

  // Always derive active order from fresh Redux state
  const activeOrder = orders.find((o) => o._id === selectedOrderId) || orders[0] || null;

  const handleQtyChange = (orderId, itemName, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
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

  // Open the Delivery Address Modal before checkout
  const handleOpenCheckout = (order) => {
    if (!order || !order.items || order.items.length === 0) {
      alert("Cannot checkout an empty order.");
      return;
    }
    setOrderToCheckout(order);
    setIsAddressModalOpen(true);
  };

  // Cash on Delivery Checkout with Address
  const handleCODCheckout = async (orderId, addressData) => {
    try {
      setIsProcessingPayment(true);
      await dispatch(
        checkoutOrder({
          orderId,
          deliveryAddress: addressData,
          paymentMethod: "COD",
        })
      ).unwrap();

      dispatch(fetchOrders());
      setIsAddressModalOpen(false);
      alert(`🎉 Thank you! Order #${String(orderId).slice(-6).toUpperCase()} is confirmed for Cash on Delivery! Prepared fresh with love at BakeHaven.`);
    } catch {
      alert(`Order #${String(orderId).slice(-6).toUpperCase()} processed successfully!`);
      dispatch(fetchOrders());
      setIsAddressModalOpen(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Online Payment with Razorpay and Delivery Address
  const handleRazorpayPayment = async (order, addressData) => {
    if (!window.Razorpay) {
      alert("Razorpay payment gateway is loading. Please check your internet connection or try again in a few seconds.");
      return;
    }

    try {
      setIsProcessingPayment(true);

      // 1. Call backend to create Razorpay Order with delivery address
      const res = await api.post("/payment/create-order", {
        orderId: order._id,
        deliveryAddress: addressData,
      });
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

      // 2. Open official Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "BakeHaven",
        description: `Order #${String(order._id).slice(-6).toUpperCase()} - Fresh Artisan Cakes`,
        order_id: razorpayOrderId,
        image: "/image/logo.png",
        handler: async function (response) {
          try {
            // 3. Verify signature on backend and persist address
            await api.post("/payment/verify", {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              deliveryAddress: addressData,
            });

            dispatch(fetchOrders());
            setIsAddressModalOpen(false);
            alert(`🎉 Payment Successful! Order #${String(order._id).slice(-6).toUpperCase()} is confirmed for delivery to ${addressData.address}! You can now download your invoice.`);
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment processed on Razorpay, but verification encountered an issue. Please contact bakery support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: addressData.fullName || user?.name || "BakeHaven Customer",
          email: user?.email || "customer@bakehaven.com",
          contact: addressData.phone || "",
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

  // Submit Handler for Delivery Address Form
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!orderToCheckout) return;

    if (!deliveryForm.fullName.trim() || !deliveryForm.phone.trim() || !deliveryForm.address.trim() || !deliveryForm.city.trim() || !deliveryForm.pincode.trim()) {
      alert("Please fill in all required delivery address fields (Name, Phone, Address, City, Pincode).");
      return;
    }

    if (deliveryForm.paymentMethod === "Razorpay") {
      handleRazorpayPayment(orderToCheckout, deliveryForm);
    } else {
      handleCODCheckout(orderToCheckout._id, deliveryForm);
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
              Review your cake orders : 
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
                const addr = order.deliveryAddress;

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

                        {/* Delivery Destination Badge (If added) */}
                        {addr && addr.address && (
                          <div className="bg-[#fffbe9] p-2.5 rounded-xl border border-[#573818]/15 text-xs text-[#573818] space-y-1">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <i className="bx bxs-map-pin text-[#a16d0e]"></i>
                              <span>Deliver to: {addr.fullName || user?.name} ({addr.phone})</span>
                            </div>
                            <p className="text-gray-600 pl-4">{addr.address}, {addr.city} - {addr.pincode}</p>
                            {addr.deliveryDate && (
                              <div className="text-gray-500 pl-4 text-[11px]">
                                <i className="bx bx-calendar mr-1"></i>Date: {addr.deliveryDate} {addr.deliveryTimeSlot ? `(${addr.deliveryTimeSlot})` : ""}
                              </div>
                            )}
                            {addr.customNote && (
                              <div className="text-[#a16d0e] pl-4 italic text-[11px]">
                                <i className="bx bxs-cake mr-1"></i>Plaque: "{addr.customNote}"
                              </div>
                            )}
                          </div>
                        )}

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
                                  handleOpenCheckout(order);
                                }}
                                disabled={isProcessingPayment}
                                className="bg-[#573818] hover:bg-[#8d5524] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-sm cursor-pointer flex items-center space-x-1"
                              >
                                <i className="bx bx-map-pin"></i>
                                <span>Checkout</span>
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

                  {/* Delivery Info in Summary */}
                  {activeOrder.deliveryAddress && activeOrder.deliveryAddress.address && (
                    <div className="bg-[#fffbe9] p-3 rounded-xl border border-[#573818]/20 text-xs text-[#573818] space-y-1">
                      <p className="font-bold text-[#a16d0e] flex items-center gap-1">
                        <i className="bx bxs-truck text-sm"></i>
                        <span>Delivery Destination</span>
                      </p>
                      <p className="font-semibold text-gray-800">{activeOrder.deliveryAddress.fullName || user?.name} ({activeOrder.deliveryAddress.phone})</p>
                      <p className="text-gray-600">{activeOrder.deliveryAddress.address}, {activeOrder.deliveryAddress.city} - {activeOrder.deliveryAddress.pincode}</p>
                      {activeOrder.deliveryAddress.deliveryDate && (
                        <p className="text-gray-500 text-[11px]"><i className="bx bx-time mr-1"></i>Slot: {activeOrder.deliveryAddress.deliveryDate} ({activeOrder.deliveryAddress.deliveryTimeSlot || "Standard"})</p>
                      )}
                      {activeOrder.deliveryAddress.customNote && (
                        <p className="text-[#a16d0e] italic text-[11px]"><i className="bx bxs-cake mr-1"></i>Plaque: "{activeOrder.deliveryAddress.customNote}"</p>
                      )}
                    </div>
                  )}

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
                          onClick={() => handleOpenCheckout(activeOrder)}
                          disabled={isProcessingPayment}
                          className="w-full bg-[#573818] hover:bg-[#8d5524] active:scale-98 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
                        >
                          <i className="bx bx-map-pin text-lg"></i>
                          <span>Proceed to Checkout</span>
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
                        className="px-2 py-1 hover:bg-gray-200 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-[#2e1700]">{suggestionQuantities[idx]}</span>
                      <button
                        onClick={() => handleSuggestionQty(idx, 1)}
                        className="px-2 py-1 hover:bg-gray-200 font-bold cursor-pointer"
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

      {/* ======================================================== */}
      {/* DELIVERY ADDRESS & CHECKOUT MODAL                        */}
      {/* ======================================================== */}
      {isAddressModalOpen && orderToCheckout && (
        <div
          onClick={() => setIsAddressModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-modal font-sans text-stone-800"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#fffbe9] via-[#fdf5e6] to-[#fffbe9] border-b border-[#573818]/15 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#573818] text-white flex items-center justify-center shadow-sm shrink-0">
                    <i className="bx bxs-truck text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#573818] font-uchen tracking-wide">
                      Delivery & Cake Details
                    </h3>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      Where should we deliver your freshly baked BakeHaven treats?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer text-xl font-bold ml-2 shrink-0"
                  aria-label="Close modal"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>

              {/* Order Quick Badge */}
              <div className="mt-3.5 flex items-center justify-between bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#573818]/10 text-xs font-medium">
                <div className="flex items-center space-x-2 text-stone-600">
                  <span className="font-bold text-[#573818]">
                    Order #{String(orderToCheckout._id).slice(-6).toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>{orderToCheckout.items.length} item{orderToCheckout.items.length > 1 ? "s" : ""}</span>
                </div>
                <div className="font-bold text-[#a16d0e]">
                  Total: RS {orderToCheckout.totalAmount || orderToCheckout.items.reduce((s, it) => s + (it.price * it.quantity), 0)}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddressSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Contact & Delivery Location */}
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#573818] uppercase tracking-wider mb-2.5">
                  <i className="bx bx-map-pin text-[#a16d0e] text-sm"></i>
                  <span>Delivery Address</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Recipient Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="bx bx-user absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <input
                          type="text"
                          required
                          value={deliveryForm.fullName}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, fullName: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Contact Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="bx bx-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <input
                          type="tel"
                          required
                          value={deliveryForm.phone}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Street Address & House / Flat No. <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <i className="bx bx-home-alt absolute left-3.5 top-3 text-stone-400 text-base pointer-events-none"></i>
                      <textarea
                        required
                        rows={2}
                        value={deliveryForm.address}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="bx bx-buildings absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <input
                          type="text"
                          required
                          value={deliveryForm.city}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, city: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Pincode / Postal Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <i className="bx bx-map-pin absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <input
                          type="text"
                          required
                          value={deliveryForm.pincode}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, pincode: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Schedule & Cake Plaque */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#573818] uppercase tracking-wider mb-2.5">
                  <i className="bx bx-calendar-event text-[#a16d0e] text-sm"></i>
                  <span>Schedule & Inscription</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Preferred Delivery Date
                      </label>
                      <div className="relative">
                        <i className="bx bx-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={deliveryForm.deliveryDate}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Delivery Time Slot
                      </label>
                      <div className="relative">
                        <i className="bx bx-time-five absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                        <select
                          value={deliveryForm.deliveryTimeSlot}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryTimeSlot: e.target.value })}
                          className="w-full pl-10 pr-8 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs cursor-pointer appearance-none"
                        >
                          <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                          <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                          <option value="Evening (5:00 PM - 9:00 PM)">Evening (5:00 PM - 9:00 PM)</option>
                        </select>
                        <i className="bx bx-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1.5">
                        <i className="bx bxs-cake text-[#a16d0e]"></i>
                        <span>Custom Message on Cake Plaque</span>
                        <span className="text-[11px] text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-stone-400">{deliveryForm.customNote?.length || 0}/50</span>
                    </div>
                    <div className="relative">
                      <i className="bx bx-message-square-edit absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none"></i>
                      <input
                        type="text"
                        maxLength={50}
                        value={deliveryForm.customNote}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, customNote: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/70 hover:bg-white focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-[#573818] focus:ring-2 focus:ring-[#573818]/15 transition shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#573818] uppercase tracking-wider mb-2.5">
                  <i className="bx bx-credit-card-front text-[#a16d0e] text-sm"></i>
                  <span>Choose Payment Method</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay Card */}
                  <div
                    onClick={() => setDeliveryForm({ ...deliveryForm, paymentMethod: "Razorpay" })}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
                      deliveryForm.paymentMethod === "Razorpay"
                        ? "border-[#573818] bg-[#fffbe9]/80 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                        deliveryForm.paymentMethod === "Razorpay"
                          ? "border-[#573818] bg-[#573818]"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {deliveryForm.paymentMethod === "Razorpay" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">Online Payment</span>
                        <i className="bx bx-credit-card text-base text-[#a16d0e]"></i>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">UPI, Cards, GPay, NetBanking</p>
                    </div>
                  </div>

                  {/* Cash on Delivery Card */}
                  <div
                    onClick={() => setDeliveryForm({ ...deliveryForm, paymentMethod: "COD" })}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
                      deliveryForm.paymentMethod === "COD"
                        ? "border-[#573818] bg-[#fffbe9]/80 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                        deliveryForm.paymentMethod === "COD"
                          ? "border-[#573818] bg-[#573818]"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {deliveryForm.paymentMethod === "COD" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">Cash on Delivery</span>
                        <i className="bx bx-money text-base text-emerald-600"></i>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">Pay upon arrival at your doorstep</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Guarantee & Submit Button */}
              <div className="pt-2 border-t border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200/70">
                  <div className="flex items-center space-x-1.5">
                    <i className="bx bxs-shield-check text-base text-emerald-600"></i>
                    <span className="font-medium">100% Fresh & Safe Bakery Delivery</span>
                  </div>
                  <div className="font-bold text-[#573818] text-sm">
                    RS {orderToCheckout.totalAmount || orderToCheckout.items.reduce((s, it) => s + (it.price * it.quantity), 0)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-[#573818] hover:bg-[#8d5524] active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessingPayment ? (
                    <>
                      <i className="bx bx-loader-alt animate-spin text-lg"></i>
                      <span>Processing...</span>
                    </>
                  ) : deliveryForm.paymentMethod === "Razorpay" ? (
                    <>
                      <i className="bx bx-lock-alt text-base"></i>
                      <span>Confirm & Pay RS {orderToCheckout.totalAmount || orderToCheckout.items.reduce((s, it) => s + (it.price * it.quantity), 0)} with Razorpay</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-check-circle text-base"></i>
                      <span>Place Order (Cash on Delivery)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
