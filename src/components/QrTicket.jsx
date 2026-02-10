import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { QRCodeCanvas } from "qrcode.react"; 
import { db } from "../firebase/firebaseConfig/firebase";

function Ticket() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);
        if (ticketSnap.exists()) {
          setTicket({ id: ticketSnap.id, ...ticketSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (loading) return <p className="p-6 text-center">Loading ticket...</p>;
  if (!ticket) return <p className="p-6 text-center">Ticket not found.</p>;

  return (
    <div className="max-w-md mx-auto p-6 text-center border rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-2">{ticket.eventName}</h1>
      <p className="mb-2">Date: {ticket.eventDate}</p>
      <p className="mb-4">Ticket ID: {ticket.id}</p>
      <p className="mb-4">Status: {ticket.status}</p>

      <QRCodeCanvas
        value={JSON.stringify({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          email: ticket.email,
        })}
        size={200}
      />

      <p className="mt-4 text-gray-600 text-sm">
        Show this QR code at the event for entry.
      </p>
    </div>
  );
}

export default Ticket;
