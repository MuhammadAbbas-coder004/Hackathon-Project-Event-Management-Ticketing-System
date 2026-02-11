import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { setUser } from "../redux/reducers/authSlice";
import { auth } from "../firebase/firebaseConfig/firebase"; 

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
    setIsOpen(false);
    navigate("/"); 
  };

  const linkClasses =
    "relative px-3 py-2 text-white font-medium hover:text-indigo-200 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide">
          <Link to="/" className="hover:text-indigo-200 transition-colors duration-300">
            TicketApp
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {!user && (
            <>
              <Link to="/login" className={linkClasses}>
                Login
              </Link>
              <Link to="/signup" className={linkClasses}>
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              {user.role === "attendee" && (
                <>
                  <Link to="/home" className={linkClasses}>
                    Home
                  </Link>
                  <Link to="/my-tickets" className={linkClasses}>
                    My Tickets
                  </Link>
                </>
              )}

              {user.role === "organizer" && (
                <>
                  <Link to="/dashboard" className={linkClasses}>
                    Dashboard
                  </Link>
                  <Link to="/create-event" className={linkClasses}>
                    Create Event
                  </Link>
    
                  <Link to="/ticket-scanner" className={linkClasses}>
                    Ticket Scanner
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="ml-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-red-500 hover:scale-105 transition transform duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Burger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-indigo-600 overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 space-y-2">
          {!user && (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <>
              {user.role === "attendee" && (
                <>
                  <Link
                    to="/home"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/my-tickets"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
                  >
                    My Tickets
                  </Link>
                </>
              )}

              {user.role === "organizer" && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create-event"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
                  >
                    Create Event
                  </Link>
                  <Link
                    to="/ticket-scanner"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-indigo-500 transition-colors duration-300 text-white font-medium"
                  >
                    Ticket Scanner
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-red-500 hover:scale-105 transition transform duration-300"
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
