// Purpose: My Account Profile Page (Matching profile.html 1:1)
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Profile = ({ onOpenAuth }) => {
  const { user } = useSelector((state) => state.auth);
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
    <div className="min-h-screen bg-[#fffbe9] font-uchen text-[#2e1700] py-16 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-[#573818]/20">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=573818&color=fff&size=128`}
            alt={user.name}
            className="w-16 h-16 rounded-full shadow"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#573818]">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#573818] mb-4">Your Options</h2>
        <div className="space-y-3 mb-8">
          <Link
            to="/orders"
            className="block p-3 rounded-lg bg-[#fffbe9] hover:bg-[#e2b58d] text-[#573818] font-bold transition flex justify-between items-center"
          >
            <span>My Orders & Cart</span>
            <i className="bx bx-chevron-right text-xl"></i>
          </Link>
          <Link
            to="/wishlist"
            className="block p-3 rounded-lg bg-[#fffbe9] hover:bg-[#e2b58d] text-[#573818] font-bold transition flex justify-between items-center"
          >
            <span>My Wishlist</span>
            <i className="bx bx-chevron-right text-xl"></i>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-[#573818] hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;