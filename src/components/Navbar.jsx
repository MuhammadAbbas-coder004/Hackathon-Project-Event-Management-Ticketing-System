// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { setUser } from "../redux/reducers/authSlice";
import { auth } from "../firebase/firebaseConfig/firebase";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide">
          <Link to="/" className="hover:text-indigo-200 transition-colors duration-300">
            TicketApp
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Not logged in */}
          {!user && (
            <>
              <Link to="/login" className="hover:text-indigo-200 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="hover:text-indigo-200 transition-colors">
                Sign Up
              </Link>
            </>
          )}

          {/* Attendee Links */}
          {user && user.role === "attendee" && (
            <>
              <Link to="/home" className="hover:text-indigo-200 transition-colors">
                Home
              </Link>
              <Link to="/my-tickets" className="hover:text-indigo-200 transition-colors">
                My Tickets
              </Link>
              <button
                onClick={handleLogout}
                className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl font-semibold transition duration-300 shadow-md"
              >
                Logout
              </button>
            </>
          )}

          {/* Organizer Links */}
          {user && user.role === "organizer" && (
            <>
              <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">
                Dashboard
              </Link>
              <Link to="/create-event" className="hover:text-indigo-200 transition-colors">
                Create Event
              </Link>
              <button
                onClick={handleLogout}
                className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl font-semibold transition duration-300 shadow-md"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
