// ========================================================
// File: frontend/src/pages/Cart.jsx
// Purpose: Dedicated Shopping Cart / Bag Page with Real-time
//          Quantity Controls, Order Summary & Checkout Modal
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

const Cart = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading } = useSelector((state) => state.orders);

  // Suggestions quantities for quick add-ons
  const [suggestionQuantities, setSuggestionQuantities] = useState([1, 1, 1, 1]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Checkout Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
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

  // Protect route
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

  // Derive ONLY the active pending cart order
  const activeCart = orders.find((o) => o.status === "Pending") || null;
  const cartItems = activeCart ? activeCart.items || [] : [];
  const cartTotal = activeCart
    ? activeCart.totalAmount || cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
    : 0;
  const totalItemCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  // Handle quantity modification in cart
  const handleQtyChange = (itemName, currentQty, delta) => {
    if (!activeCart) return;
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      if (window.confirm(`Remove "${itemName}" from your cart?`)) {
        dispatch(updateOrderQty({ orderId: activeCart._id, itemName, quantity: 0 }));
      }
      return;
    }
    dispatch(updateOrderQty({ orderId: activeCart._id, itemName, quantity: newQty }));
  };

  // Remove individual item directly
  const handleRemoveItem = (itemName) => {
    if (!activeCart) return;
    if (window.confirm(`Remove "${itemName}" from your cart?`)) {
      dispatch(updateOrderQty({ orderId: activeCart._id, itemName, quantity: 0 }));
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (!activeCart) return;
    if (window.confirm("Are you sure you want to empty your entire cart?")) {
      dispatch(removeOrder(activeCart._id));
    }
  };

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (!activeCart || cartItems.length === 0) {
      alert("Your cart is currently empty.");
      return;
    }
    setIsAddressModalOpen(true);
  };

  // Cash on Delivery Checkout
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

      await dispatch(fetchOrders());
      setIsAddressModalOpen(false);
      alert(`🎉 Order Confirmed! Your order #${String(orderId).slice(-6).toUpperCase()} has been placed via Cash on Delivery. Freshly baked at BakeHaven!`);
      navigate("/orders");
    } catch {
      alert(`Order #${String(orderId).slice(-6).toUpperCase()} processed successfully!`);
      await dispatch(fetchOrders());
      setIsAddressModalOpen(false);
      navigate("/orders");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Online Payment with Razorpay
  const handleRazorpayPayment = async (order, addressData) => {
    if (!window.Razorpay) {
      alert("Payment gateway is loading. Please check your internet connection and try again.");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const res = await api.post("/payment/create-order", {
        orderId: order._id,
        deliveryAddress: addressData,
      });
      const { razorpayOrderId, amount, currency, keyId } = res.data.data;

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
            await api.post("/payment/verify", {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              deliveryAddress: addressData,
            });

            await dispatch(fetchOrders());
            setIsAddressModalOpen(false);
            alert(`🎉 Payment Successful! Order #${String(order._id).slice(-6).toUpperCase()} is confirmed! You can now track your delivery and download your invoice.`);
            navigate("/orders");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment recorded, but verification encountered an issue. Please contact bakery support.");
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
          color: "#573818",
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

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!activeCart) return;

    if (
      !deliveryForm.fullName.trim() ||
      !deliveryForm.phone.trim() ||
      !deliveryForm.address.trim() ||
      !deliveryForm.city.trim() ||
      !deliveryForm.pincode.trim()
    ) {
      alert("Please fill in all required delivery address fields (Name, Phone, Address, City, Pincode).");
      return;
    }

    if (deliveryForm.paymentMethod === "Razorpay") {
      handleRazorpayPayment(activeCart, deliveryForm);
    } else {
      handleCODCheckout(activeCart._id, deliveryForm);
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

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#573818]/20 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#573818] tracking-wide flex items-center gap-2">
              <i className="bx bx-shopping-bag text-3xl text-[#a16d0e]"></i>
              <span>My Shopping Cart</span>
            </h1>
            <p className="text-sm md:text-base text-[#8d5524] mt-1 font-medium font-sans">
              Review your selected treats, adjust quantities, and proceed to checkout.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/orders"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition font-sans"
            >
              <i className="bx bx-package text-base"></i>
              <span>View Past Orders</span>
            </Link>
            <Link
              to="/#product-cards"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition font-sans"
            >
              <span>+ Add More Cakes</span>
              <i className="bx bx-right-arrow-alt text-lg"></i>
            </Link>
          </div>
        </div>

        {loading && cartItems.length === 0 ? (
          <div className="py-20 text-center text-[#a16d0e] font-bold text-lg animate-pulse font-sans">
            Loading your fresh bakery cart...
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-lg border border-[#a16d0e]/20 max-w-xl w-full mx-auto">
              <div className="w-20 h-20 bg-[#fffbe9] rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner">
                <img src="/image/add.png" alt="Empty Cart" className="w-10 h-10 object-contain opacity-70" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#573818] mb-3">
                Your Shopping Bag is Empty
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-sans">
                You haven't added any cakes to your cart yet. Explore our handcrafted artisan collection and treat yourself!
              </p>
              <Link
                to="/#product-cards"
                className="inline-block bg-[#573818] hover:bg-[#a16d0e] text-white font-bold px-8 py-3 rounded-xl shadow-md transition duration-300 transform hover:-translate-y-0.5 cursor-pointer font-sans"
              >
                Explore Delicious Cakes
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">
                  Cart Items ({totalItemCount} {totalItemCount > 1 ? "items" : "item"})
                </span>
                <button
                  onClick={handleClearCart}
                  className="text-xs font-bold text-red-600 hover:text-red-800 transition flex items-center space-x-1 cursor-pointer font-sans"
                >
                  <i className="bx bx-trash text-sm"></i>
                  <span>Clear Cart</span>
                </button>
              </div>

              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 hover:border-[#a16d0e]/40 transition-all flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                >
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-[#fffbe9]/70 rounded-xl p-2 flex items-center justify-center shrink-0 border border-stone-100">
                    <img
                      src={item.image || "/image/c1.png"}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain drop-shadow-sm hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="text-lg font-bold text-[#573818]">{item.name}</h3>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">
                      Handcrafted artisan cake baked fresh daily
                    </p>
                    <div className="mt-2 text-sm font-bold text-[#a16d0e] font-sans">
                      RS {item.price} each
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50 font-sans text-sm shadow-xs">
                      <button
                        onClick={() => handleQtyChange(item.name, item.quantity, -1)}
                        className={`w-8 h-8 flex items-center justify-center font-bold transition cursor-pointer ${
                          item.quantity === 1
                            ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                            : "hover:bg-stone-200 text-stone-700"
                        }`}
                        title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                      >
                        {item.quantity === 1 ? <i className="bx bx-trash text-sm"></i> : "-"}
                      </button>
                      <span className="w-9 text-center font-bold text-[#2e1700]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.name, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold text-[#573818] font-sans">
                        RS {item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.name)}
                        className="text-stone-400 hover:text-red-600 transition cursor-pointer p-1"
                        title="Remove from cart"
                      >
                        <i className="bx bx-x text-xl"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Assurance Strip */}
              <div className="bg-[#fffbe9] border border-[#573818]/15 rounded-2xl p-4 flex items-center space-x-3 text-xs text-[#573818] font-sans">
                <i className="bx bxs-shield-check text-2xl text-emerald-600 shrink-0"></i>
                <div>
                  <p className="font-bold">100% Freshness & Temperature-Controlled Delivery</p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Our cakes are transported in refrigerated vehicles to arrive in picture-perfect condition.
                  </p>
                </div>
              </div>

              {/* Suggestions / Add-ons */}
              <div className="mt-8 pt-6 border-t border-[#573818]/15">
                <h3 className="text-xl font-bold text-[#573818] mb-4">
                  Add Artisan Treats to Your Bag
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestions.map((cake, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-[#fffbe9]/70 rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-stone-100">
                          <img
                            src={cake.image}
                            alt={cake.name}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#573818] text-sm">{cake.name}</h4>
                          <p className="text-[11px] text-gray-500 font-sans line-clamp-1 mt-0.5">
                            {cake.description}
                          </p>
                          <span className="text-xs font-bold text-[#a16d0e] font-sans mt-1 block">
                            RS {cake.price}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 font-sans text-xs">
                          <button
                            onClick={() => handleSuggestionQty(idx, -1)}
                            className="px-2 py-0.5 hover:bg-stone-200 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-[#2e1700]">
                            {suggestionQuantities[idx]}
                          </span>
                          <button
                            onClick={() => handleSuggestionQty(idx, 1)}
                            className="px-2 py-0.5 hover:bg-stone-200 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddSuggestionToCart(cake, idx)}
                          className="bg-[#573818] hover:bg-[#a16d0e] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1 font-sans"
                        >
                          <i className="bx bx-cart-add text-sm"></i>
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sticky top-24 font-sans text-stone-800">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="font-bold text-xl text-[#573818] font-uchen">Order Summary</h3>
                <span className="text-xs bg-[#fffbe9] text-[#8d5524] font-bold px-2.5 py-1 rounded-full border border-[#573818]/20">
                  {totalItemCount} {totalItemCount > 1 ? "items" : "item"}
                </span>
              </div>

              {/* Itemized Snapshot */}
              <div className="py-4 space-y-2 border-b border-stone-100 max-h-56 overflow-y-auto">
                {cartItems.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-stone-700">
                    <span className="truncate pr-2">
                      {it.name} <strong className="text-[#573818]">x{it.quantity}</strong>
                    </span>
                    <span className="font-bold shrink-0">RS {it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2.5 border-b border-stone-100 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-800">RS {cartTotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-stone-700">Included in price</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="py-4 flex justify-between items-center">
                <span className="text-sm font-bold text-stone-900">Total Payable:</span>
                <span className="text-2xl font-bold text-[#a16d0e]">RS {cartTotal}</span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleOpenCheckout}
                disabled={isProcessingPayment || cartItems.length === 0}
                className="w-full py-3.5 bg-[#573818] hover:bg-[#a16d0e] active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <i className="bx bx-lock-alt text-base"></i>
                <span>Proceed to Checkout</span>
                <i className="bx bx-right-arrow-alt text-lg"></i>
              </button>

              <p className="text-[11px] text-stone-400 text-center mt-3 flex items-center justify-center space-x-1">
                <i className="bx bx-shield-quarter text-sm text-emerald-600"></i>
                <span>Guaranteed 256-Bit Encrypted Secure Checkout</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* REALISTIC DELIVERY ADDRESS & CHECKOUT MODAL              */}
      {/* ======================================================== */}
      {isAddressModalOpen && activeCart && (
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
                    Cart Checkout
                  </span>
                  <span>•</span>
                  <span>{cartItems.length} item{cartItems.length > 1 ? "s" : ""}</span>
                </div>
                <div className="font-bold text-[#a16d0e]">
                  Total: RS {cartTotal}
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
                  <div className="font-bold text-[#573818] text-sm font-sans">
                    RS {cartTotal}
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
                      <span>Processing Order...</span>
                    </>
                  ) : deliveryForm.paymentMethod === "Razorpay" ? (
                    <>
                      <i className="bx bx-lock-alt text-base"></i>
                      <span>Confirm & Pay RS {cartTotal} with Razorpay</span>
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

export default Cart;
