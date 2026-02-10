import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react"; 
import { db } from "../firebase/firebaseConfig/firebase";

function Ticket() {
  const { ticketId } = useParams(); // URL se ticketId lena
  const [ticket, setTicket] = useState(null); // Ticket data state
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch ticket details from Firestore
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);

        if (ticketSnap.exists()) {
          // Ticket data set karna
          setTicket({ id: ticketSnap.id, ...ticketSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false); // Loading complete
      }
    };
    fetchTicket();
  }, [ticketId]);

  // Loading state display
  if (loading) 
    return <p className="p-6 text-center text-gray-600 text-lg">Loading ticket...</p>;

  // Ticket not found
  if (!ticket) 
    return <p className="p-6 text-center text-gray-600 text-lg">Ticket not found.</p>;

  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    email: ticket.email,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Ticket card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        {/* Event Name */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{ticket.eventName}</h1>

        {/* Event Date */}
        <p className="text-gray-600 text-lg mb-1">Date: {ticket.eventDate}</p>

        {/* Ticket ID */}
        <p className="text-gray-700 font-medium mb-1">Ticket ID: {ticket.id}</p>

        {/* Status */}
        <p className="text-gray-700 font-medium mb-4">Status: {ticket.status}</p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <QRCodeCanvas value={qrValue} size={220} className="rounded-xl border p-2 shadow" />
        </div>

        {/* Instruction */}
        <p className="text-gray-500 text-sm">
          Show this QR code at the event entrance for entry.
        </p>
      </div>
    </div>
  );
}

export default Ticket;
