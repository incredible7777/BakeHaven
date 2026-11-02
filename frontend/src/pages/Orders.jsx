// ========================================================
// File: frontend/src/pages/Orders.jsx
// Purpose: Dedicated My Orders & Order History Page
//          (Tracks Confirmed Orders, Delivery Details & PDF Invoices)
// ========================================================
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, removeOrder } from "../redux/slices/orderSlice";
import { generateInvoicePDF } from "../utils/generateInvoice";

const Orders = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading } = useSelector((state) => state.orders);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [previewItemIndex, setPreviewItemIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      onOpenAuth();
      navigate("/");
    } else {
      dispatch(fetchOrders());
    }
  }, [user, dispatch, navigate, onOpenAuth]);

  // Reset preview item index when active order changes
  useEffect(() => {
    setPreviewItemIndex(0);
  }, [selectedOrderId]);

  // Filter ONLY confirmed, completed, or non-pending orders for order history
  const confirmedOrders = orders.filter((o) => o.status !== "Pending");

  // Derive active order for sidebar summary
  const activeOrder =
    confirmedOrders.find((o) => o._id === selectedOrderId) || confirmedOrders[0] || null;

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this placed order? Please note refunds will be processed within 24-48 hours.")) {
      dispatch(removeOrder(orderId));
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#573818]/20 pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#573818] tracking-wide flex items-center gap-2">
              <i className="bx bx-package text-3xl text-[#a16d0e]"></i>
              <span>My Orders</span>
            </h1>
            <p className="text-sm md:text-base text-[#8d5524] mt-1 font-medium font-sans">
              Track your confirmed artisan cake orders.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition font-sans"
            >
              <i className="bx bx-shopping-bag text-base"></i>
              <span>Go to Cart</span>
            </Link>
            <Link
              to="/#product-cards"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition font-sans"
            >
              <span>+ Order More Cakes</span>
              <i className="bx bx-right-arrow-alt text-lg"></i>
            </Link>
          </div>
        </div>

        {loading && confirmedOrders.length === 0 ? (
          <div className="py-20 text-center text-[#a16d0e] font-bold text-lg animate-pulse font-sans">
            Loading your order history...
          </div>
        ) : confirmedOrders.length === 0 ? (
          /* Empty Order History State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-lg border border-[#a16d0e]/20 max-w-xl w-full mx-auto">
              <div className="w-20 h-20 bg-[#fffbe9] rounded-full mx-auto flex items-center justify-center mb-5 shadow-inner">
                <i className="bx bx-receipt text-4xl text-[#a16d0e]"></i>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#573818] mb-3">
                No Orders Placed Yet
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto leading-relaxed font-sans">
                You haven't completed any orders yet. Visit your shopping bag or browse our fresh menu to treat yourself to delicious artisan cakes!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/cart"
                  className="w-full sm:w-auto bg-[#573818] hover:bg-[#a16d0e] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition duration-300 font-sans"
                >
                  View My Cart
                </Link>
                <Link
                  to="/#product-cards"
                  className="w-full sm:w-auto border-2 border-[#573818] text-[#573818] hover:bg-[#573818] hover:text-white font-bold px-6 py-2 rounded-xl transition duration-300 font-sans"
                >
                  Explore Bakery Menu
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmed Orders List Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Orders List (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans">
                  Completed Orders ({confirmedOrders.length})
                </span>
                <span className="text-xs text-stone-500 font-sans">
                  Click any order to view details & download invoice
                </span>
              </div>

              {confirmedOrders.map((order) => {
                const isSelected = activeOrder?._id === order._id;
                const orderTotal =
                  order.totalAmount ||
                  order.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
                const totalUnits = order.items.reduce((sum, it) => sum + it.quantity, 0);
                const isPaid = order.paymentInfo?.status === "Paid";
                const isCod = order.paymentInfo?.method === "COD";
                const addr = order.deliveryAddress;
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border-2 overflow-hidden cursor-pointer ${
                      isSelected
                        ? "border-[#573818] ring-2 ring-[#573818]/15"
                        : "border-stone-200 hover:border-[#a16d0e]/60"
                    }`}
                  >
                    {/* Order Card Header */}
                    <div className="bg-[#fffbe9] px-5 py-3.5 border-b border-[#573818]/10 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-sans">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#573818]">
                          Order #{String(order._id).slice(-6).toUpperCase()}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 font-medium">Placed on {orderDate}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isPaid
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : isCod
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {isPaid ? "PAID & CONFIRMED" : isCod ? "CONFIRMED (COD)" : order.status}
                        </span>
                        <span className="font-bold text-[#573818] text-sm">
                          RS {orderTotal}
                        </span>
                      </div>
                    </div>

                    {/* Order Card Body: All Items with Photos */}
                    <div className="p-5 space-y-4 font-sans">
                      {/* Visual Item Rows (Each cake gets its own photo and subtotal!) */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs sm:text-sm py-2 px-3 rounded-2xl bg-[#fffbe9]/40 hover:bg-[#fffbe9] border border-stone-200/70 transition"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 border border-stone-200 shadow-2xs">
                                <img
                                  src={item.image || "/image/c1.png"}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-[#573818] block">{item.name}</span>
                                <span className="text-xs text-stone-500 font-sans">
                                  @ RS {item.price} each
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex items-center space-x-2">
                              <span className="font-bold text-xs bg-white text-[#573818] px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                                x{item.quantity}
                              </span>
                              <span className="font-bold text-xs text-[#a16d0e]">
                                RS {item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Destination Badge */}
                      {addr && addr.address && (
                        <div className="bg-[#fffbe9] p-3.5 rounded-2xl border border-[#573818]/15 text-xs text-[#573818] space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <i className="bx bxs-map-pin text-[#a16d0e]"></i>
                            <span>
                              Deliver to: {addr.fullName || user?.name} ({addr.phone})
                            </span>
                          </div>
                          <p className="text-gray-600 pl-4">
                            {addr.address}, {addr.city} - {addr.pincode}
                          </p>
                          {addr.deliveryDate && (
                            <div className="text-gray-500 pl-4 text-[11px]">
                              <i className="bx bx-calendar mr-1"></i>
                              Scheduled: {addr.deliveryDate}{" "}
                              {addr.deliveryTimeSlot ? `(${addr.deliveryTimeSlot})` : ""}
                            </div>
                          )}
                          {addr.customNote && (
                            <div className="text-[#a16d0e] pl-4 italic text-[11px]">
                              <i className="bx bxs-cake mr-1"></i>Plaque: "{addr.customNote}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <span className="text-xs text-stone-500">
                          {order.items.length} {order.items.length > 1 ? "varieties" : "variety"} • {totalUnits} {totalUnits > 1 ? "cakes" : "cake"} total
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoicePDF(order, user);
                            }}
                            className="bg-[#573818] hover:bg-[#a16d0e] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                            title="Download Official Tax Invoice PDF"
                          >
                            <i className="bx bx-download text-sm"></i>
                            <span>Tax Invoice</span>
                          </button>
                          {order.status === "Confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order._id);
                              }}
                              className="bg-transparent hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Order Detail Sidebar (5 cols) */}
            {activeOrder && activeOrder.items && activeOrder.items.length > 0 && (() => {
              const previewItem = activeOrder.items[previewItemIndex] || activeOrder.items[0];
              const totalPackageUnits = activeOrder.items.reduce((s, it) => s + it.quantity, 0);

              return (
                <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sticky top-24 font-sans text-stone-800">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="font-bold text-xl text-[#573818] font-uchen">Package Details</h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">
                        {activeOrder.items.length} varieties • {totalPackageUnits} cakes in order
                      </p>
                    </div>
                    <span className="text-xs bg-[#fffbe9] text-[#8d5524] font-bold px-2.5 py-1 rounded-full border border-[#573818]/20 shrink-0">
                      #{String(activeOrder._id).slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Interactive Featured Cake Preview */}
                  <div className="bg-[#fffbe9]/70 rounded-3xl p-4 flex items-center justify-center mb-3 border border-stone-100 relative group">
                    <img
                      src={previewItem.image || "/image/c1.png"}
                      alt={previewItem.name}
                      className="max-h-40 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-[#573818] shadow-xs border border-stone-200/60">
                      x{previewItem.quantity} in order
                    </div>
                  </div>

                  {/* Active Cake Title & Subtitle */}
                  <div className="text-center pb-2">
                    <h4 className="text-lg font-bold text-[#573818] font-uchen">
                      {previewItem.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      RS {previewItem.price} each • Subtotal: <strong className="text-[#a16d0e]">RS {previewItem.price * previewItem.quantity}</strong>
                    </p>
                  </div>

                  {/* Multi-Cake Thumbnails Switcher (Shows ALL cakes in the order!) */}
                  {activeOrder.items.length > 1 && (
                    <div className="pb-3 border-b border-stone-100">
                      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 text-center">
                        Tap any cake to inspect:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {activeOrder.items.map((it, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPreviewItemIndex(idx)}
                            className={`p-1.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                              previewItemIndex === idx
                                ? "border-[#573818] bg-white ring-2 ring-[#573818]/20 shadow-xs"
                                : "border-stone-200 bg-stone-50/70 hover:bg-white hover:border-stone-300"
                            }`}
                            title={`${it.name} (x${it.quantity})`}
                          >
                            <img
                              src={it.image || "/image/c1.png"}
                              alt={it.name}
                              className="w-9 h-9 object-contain"
                            />
                            <span className="text-[10px] font-bold text-stone-700 truncate w-full text-center mt-1">
                              x{it.quantity}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 text-xs pt-2">
                    {/* Itemized Snapshot */}
                    <div className="bg-stone-50 rounded-2xl p-3.5 space-y-2 border border-stone-100">
                      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        Package Breakdown
                      </p>
                      {activeOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-stone-700">
                          <span className="truncate pr-2">
                            {it.name} <strong className="text-[#573818]">x{it.quantity}</strong>
                          </span>
                          <span className="font-bold shrink-0">RS {it.price * it.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between items-center text-sm font-bold text-[#573818]">
                        <span>Grand Total:</span>
                        <span className="text-lg text-[#a16d0e]">
                          RS{" "}
                          {activeOrder.totalAmount ||
                            activeOrder.items.reduce((sum, it) => sum + it.price * it.quantity, 0)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {activeOrder.deliveryAddress && activeOrder.deliveryAddress.address && (
                      <div className="bg-[#fffbe9] p-3.5 rounded-2xl border border-[#573818]/20 space-y-1 text-[#573818]">
                        <p className="font-bold text-[#a16d0e] flex items-center gap-1">
                          <i className="bx bxs-truck text-sm"></i>
                          <span>Delivery Address</span>
                        </p>
                        <p className="font-semibold text-stone-800">
                          {activeOrder.deliveryAddress.fullName || user?.name} (
                          {activeOrder.deliveryAddress.phone})
                        </p>
                        <p className="text-stone-600">
                          {activeOrder.deliveryAddress.address}, {activeOrder.deliveryAddress.city} -{" "}
                          {activeOrder.deliveryAddress.pincode}
                        </p>
                        {activeOrder.deliveryAddress.deliveryDate && (
                          <p className="text-stone-500 text-[11px]">
                            <i className="bx bx-time mr-1"></i>
                            Delivery: {activeOrder.deliveryAddress.deliveryDate} (
                            {activeOrder.deliveryAddress.deliveryTimeSlot || "Standard"})
                          </p>
                        )}
                        {activeOrder.deliveryAddress.customNote && (
                          <p className="text-[#a16d0e] italic text-[11px]">
                            <i className="bx bxs-cake mr-1"></i>Plaque: "
                            {activeOrder.deliveryAddress.customNote}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Status & Invoice Download Button */}
                    <div className="pt-2 space-y-2">
                      <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-2.5 rounded-2xl text-center text-xs flex items-center justify-center space-x-2">
                        <i className="bx bx-check-double text-base"></i>
                        <span>
                          {activeOrder.paymentInfo?.status === "Paid"
                            ? "Payment Confirmed via Razorpay"
                            : "Order Confirmed (Cash on Delivery)"}
                        </span>
                      </div>
                      <button
                        onClick={() => generateInvoicePDF(activeOrder, user)}
                        className="w-full py-3 bg-[#573818] hover:bg-[#a16d0e] active:scale-[0.99] text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <i className="bx bx-download text-base"></i>
                        <span>Download Tax Invoice (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
