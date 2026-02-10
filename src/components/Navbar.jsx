import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { signOut } from "firebase/auth";
import { setUser } from "../redux/reducers/authSlice";
import { auth } from "../firebase/firebaseConfig/firebase";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(setUser(null));
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">TicketApp</Link>
      </div>

      <div className="space-x-4">
        {!user && (
          <>
            <Link to="/login" className="hover:text-gray-200">
              Login
            </Link>
            <Link to="/signup" className="hover:text-gray-200">
              Sign Up
            </Link>
          </>
        )}

        {user && user.role === "attendee" && (
          <>
            <Link to="/home" className="hover:text-gray-200">
              Home
            </Link>
            
            <Link to="/my-tickets" className="hover:text-gray-200">
              My Tickets
            </Link>
       
             
       
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
             
              Logout
            </button>
          </>
        )}

        {user && user.role === "organizer" && (
          <>
            <Link to="/dashboard" className="hover:text-gray-200">
              Dashboard
            </Link>
            <Link to="/create-event" className="hover:text-gray-200">
              Create Event
            </Link>
        
            <Link to="/validate-ticket" className="hover:text-gray-200">
              Validate Ticket
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
