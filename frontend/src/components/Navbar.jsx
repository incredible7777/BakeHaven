// Purpose: Main Responsive Navigation Bar with Badges & Avatar
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Navbar = ({ onOpenAuth, onSelectCategory }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: orderItems } = useSelector((state) => state.orders);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setUserMenuOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleUserClick = (e) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
    } else {
      setUserMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#573818] px-4 md:px-12 py-3 shadow-lg font-uchen">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white text-2xl font-bold">
          <img src="/image/logo.png" alt="Cake Bakery Logo" className="w-10 h-10 object-contain" />
          <span>Cake Bakery</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          <img src="/image/menu.png" alt="Menu" className="w-7 h-7" />
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 text-white font-bold">
          <Link to="/" className="hover:bg-[#a16d0e] px-3 py-1 rounded transition duration-300">
            Home
          </Link>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:bg-[#a16d0e] px-3 py-1 rounded transition duration-300 flex items-center space-x-1"
            >
              <span>Category</span>
              <i className="bx bx-chevron-down"></i>
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-xl py-2 z-50 border border-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                {["All Cakes", "Birthday Cake", "Chocolate Cake", "Party Cake", "Slice Cake", "Cup Cake"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => onSelectCategory && onSelectCategory(cat === "All Cakes" ? "" : cat)}
                      className="block w-full text-left px-4 py-2 hover:bg-[#fffbe9] hover:text-[#573818] transition font-medium"
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <a href="/#gallary" className="hover:bg-[#a16d0e] px-3 py-1 rounded transition duration-300">
            Gallery
          </a>
          <a href="/#about" className="hover:bg-[#a16d0e] px-3 py-1 rounded transition duration-300">
            About
          </a>
          <a href="/#contact" className="hover:bg-[#a16d0e] px-3 py-1 rounded transition duration-300">
            Contact
          </a>
        </div>

        {/* Right Action Icons (User, Wishlist, Cart) */}
        <div className="flex items-center space-x-5 relative">
          {/* User Icon / Avatar */}
          <div className="relative">
            <button onClick={handleUserClick} className="focus:outline-none flex items-center">
              {user ? (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=a16d0e&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-white cursor-pointer hover:-translate-y-1 transition duration-300"
                />
              ) : (
                <img
                  src="/image/user.png"
                  alt="User Login"
                  className="w-5 h-5 cursor-pointer hover:-translate-y-1 transition duration-300"
                  title="Login / Signup"
                />
              )}
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && user && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-md shadow-2xl py-2 z-50 border border-gray-200"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-bold text-[#573818] truncate">{user.name}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-[#fffbe9] text-sm text-[#573818]"
                >
                  My Account
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-[#fffbe9] text-sm text-[#573818]"
                >
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-[#fffbe9] text-sm text-[#573818]"
                >
                  My Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-semibold border-t border-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Heart Icon with Count Badge */}
          <Link to={user ? "/wishlist" : "#"} onClick={!user ? onOpenAuth : undefined} className="relative">
            <img
              src="/image/heart.png"
              alt="Wishlist"
              className="w-5 h-5 cursor-pointer hover:-translate-y-1 transition duration-300"
              title="My Wishlist"
            />
            {wishlistItems && wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart / Orders Icon with Count Badge */}
          <Link to={user ? "/orders" : "#"} onClick={!user ? onOpenAuth : undefined} className="relative">
            <img
              src="/image/add.png"
              alt="Cart"
              className="w-6 h-6 cursor-pointer hover:-translate-y-1 transition duration-300"
              title="My Orders / Cart"
            />
            {orderItems && orderItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#a16d0e] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                {orderItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/20 flex flex-col space-y-2 text-white font-bold">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1 hover:bg-[#a16d0e] rounded">
            Home
          </Link>
          <a href="/#gallary" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1 hover:bg-[#a16d0e] rounded">
            Gallery
          </a>
          <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1 hover:bg-[#a16d0e] rounded">
            About
          </a>
          <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1 hover:bg-[#a16d0e] rounded">
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;