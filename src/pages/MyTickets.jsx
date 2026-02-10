import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";

import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig/firebase";

function MyTickets() {
  const user = useSelector((state) => state.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (loading) return <p className="p-6 text-center">Loading your tickets...</p>;
  if (!tickets.length) return <p className="p-6 text-center">You have no tickets yet.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Tickets</h1>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <p><strong>Event:</strong> {ticket.eventName}</p>
              <p><strong>Date:</strong> {ticket.eventDate}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
            </div>
            <Link
              to={`/ticket/${ticket.id}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
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
