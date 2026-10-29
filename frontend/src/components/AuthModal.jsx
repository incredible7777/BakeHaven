// ========================================================
// File: frontend/src/components/AuthModal.jsx
// Purpose: Chocolaty-Themed Login & Signup Modal
// ========================================================
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, clearError } from "../redux/slices/authSlice";

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "login") {
      const res = await dispatch(login({ email: formData.email, password: formData.password }));
      if (!res.error) onClose();
    } else {
      const res = await dispatch(register(formData));
      if (!res.error) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-uchen">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#f8e7d2] to-[#e2b58d] rounded-2xl shadow-2xl p-6 border-none animate-modal">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#573818] hover:text-black text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold text-[#573818] text-center mb-4 tracking-wider">
          {activeTab === "login" ? "Welcome Back!" : "Join Cake Bakery"}
        </h2>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#b88953]/30 mb-5">
          <button
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 py-2 font-bold text-center transition duration-200 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-[#b88953] to-[#dfcb46] text-[#2e1700] rounded-t-lg shadow"
                : "text-[#573818] hover:bg-[#e2b58d]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => handleTabSwitch("signup")}
            className={`flex-1 py-2 font-bold text-center transition duration-200 ${
              activeTab === "signup"
                ? "bg-gradient-to-r from-[#b88953] to-[#dfcb46] text-[#2e1700] rounded-t-lg shadow"
                : "text-[#573818] hover:bg-[#e2b58d]"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded text-center">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label className="block text-sm font-semibold text-[#573818] mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full px-3 py-2 bg-[#f8e7d2] border border-[#e2b58d] rounded-lg text-[#573818] focus:outline-none focus:border-[#b88953] font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#573818] mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 bg-[#f8e7d2] border border-[#e2b58d] rounded-lg text-[#573818] focus:outline-none focus:border-[#b88953] font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#573818] mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 bg-[#f8e7d2] border border-[#e2b58d] rounded-lg text-[#573818] focus:outline-none focus:border-[#b88953] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-[#573818] to-[#b88953] hover:from-[#b88953] hover:to-[#573818] text-white font-bold rounded-lg shadow-md transition duration-300 disabled:opacity-50"
          >
            {loading ? "Processing..." : activeTab === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="mt-4 text-center text-sm text-[#573818]">
          {activeTab === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabSwitch("signup")}
                className="text-[#b88953] hover:text-[#573818] font-bold underline ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleTabSwitch("login")}
                className="text-[#b88953] hover:text-[#573818] font-bold underline ml-1"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;