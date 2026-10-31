// Purpose: Root App Layout, Router & Global Modals
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";

import { checkAuth } from "./redux/slices/authSlice";
import { fetchWishlist } from "./redux/slices/wishlistSlice";
import { fetchOrders } from "./redux/slices/orderSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import QuickViewModal from "./components/QuickViewModal";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Initialize AOS animations
    AOS.init({
      duration: 1000,
      once: true,
    });

    // Check user authentication session on page load
    dispatch(checkAuth());
  }, [dispatch]);

  // Sync wishlist & orders when user logs in
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
      dispatch(fetchOrders());
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[#2e1700]">
      {/* Navbar with category filtering & live badges */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Page Routes */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onQuickView={setQuickViewProduct}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route path="/orders" element={<Orders onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/wishlist" element={<Wishlist onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/profile" element={<Profile onOpenAuth={() => setAuthModalOpen(true)} />} />
        </Routes>
      </main>

      {/* Footer & Floating Scroll Button */}
      <Footer />
      <ScrollToTop />

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    </div>
  );
}

export default App;