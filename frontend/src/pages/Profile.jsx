// ========================================================
// File: frontend/src/pages/Profile.jsx
// Purpose: User Account Profile with Member Stats, Clean Alignment & Shortcuts
// ========================================================
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Profile = ({ onOpenAuth }) => {
  const { user } = useSelector((state) => state.auth);
  const { items: orderItems } = useSelector((state) => state.orders);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      onOpenAuth();
      navigate("/");
    }
  }, [user, navigate, onOpenAuth]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-14 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#573818]/15">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#573818] via-[#8d5524] to-[#a16d0e] p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=fffbe9&color=573818&size=160&bold=true`}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white/40 shadow-lg object-cover"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    VIP Guest
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#f8e7d2]">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/orders"
                className="bg-[#fffbe9] hover:bg-[#faebd7] p-4 rounded-2xl border border-[#a16d0e]/20 transition flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#573818] text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                  <i className="bx bx-shopping-bag"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Orders</p>
                  <p className="text-xl font-bold text-[#573818]">{orderItems?.length || 0} active</p>
                </div>
              </Link>

              <Link
                to="/wishlist"
                className="bg-[#fffbe9] hover:bg-[#faebd7] p-4 rounded-2xl border border-[#a16d0e]/20 transition flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                  <i className="bx bx-heart"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Wishlist</p>
                  <p className="text-xl font-bold text-[#573818]">{wishlistItems?.length || 0} saved</p>
                </div>
              </Link>
            </div>

            {/* Menu Options */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Account Shortcuts</h2>
              <div className="space-y-2.5">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-[#573818]/30 hover:bg-[#fffbe9]/40 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <i className="bx bx-package text-xl text-[#573818]"></i>
                    <span className="font-bold text-sm text-[#573818]">View All Orders & Cart</span>
                  </div>
                  <i className="bx bx-chevron-right text-gray-400 group-hover:text-[#573818] transition-transform group-hover:translate-x-1"></i>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-[#573818]/30 hover:bg-[#fffbe9]/40 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <i className="bx bx-heart-circle text-xl text-red-600"></i>
                    <span className="font-bold text-sm text-[#573818]">Manage Saved Wishlist</span>
                  </div>
                  <i className="bx bx-chevron-right text-gray-400 group-hover:text-[#573818] transition-transform group-hover:translate-x-1"></i>
                </Link>

                <Link
                  to="/#product-cards"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-[#573818]/30 hover:bg-[#fffbe9]/40 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <i className="bx bx-cake text-xl text-[#a16d0e]"></i>
                    <span className="font-bold text-sm text-[#573818]">Explore BakeHaven Menu</span>
                  </div>
                  <i className="bx bx-chevron-right text-gray-400 group-hover:text-[#573818] transition-transform group-hover:translate-x-1"></i>
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white font-bold py-2.5 rounded-xl transition duration-300 shadow-xs flex items-center justify-center space-x-2"
              >
                <i className="bx bx-log-out text-lg"></i>
                <span>Sign Out of BakeHaven Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#573818] hover:text-[#a16d0e] transition"
          >
            <i className="bx bx-left-arrow-alt text-lg"></i>
            <span>Return to BakeHaven Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
