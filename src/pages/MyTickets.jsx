import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig/firebase";

function MyTickets() {
  const user = useSelector((state) => state.auth.user); 
  const [tickets, setTickets] = useState([]); 
  const [loading, setLoading] = useState(true); 

  // Fetch tickets for logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const ticketsRef = collection(db, "tickets");
        const userEmail = user.email.trim().toLowerCase();
        const q = query(ticketsRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  // Loading state
  if (loading)
    return (
      <p className="p-6 text-center text-gray-600 text-lg">Loading your tickets...</p>
    );

  // No tickets message
  if (!tickets.length)
    return (
      <p className="p-6 text-center text-gray-600 text-lg">
        You have no tickets yet.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Page Heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        My Tickets
      </h1>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ticket Info */}
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {ticket.eventName}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Date:</strong> {ticket.eventDate}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    ticket.status === "Booked"
                      ? "text-green-600 font-semibold"
                      : "text-red-500 font-semibold"
                  }
                >
                  {ticket.status}
                </span>
              </p>
            </div>

            {/* View Ticket Button */}
            <Link
              to={`/ticket/${ticket.id}`}
              className="mt-4 inline-block bg-indigo-600 text-white text-center py-2 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors duration-300"
            >
              View Ticket
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTickets;
