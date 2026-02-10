// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../firebase/firebaseConfig/firebase";

// ✅ Vite-friendly import
import { QRCodeSVG } from "qrcode.react"; // qrcode.react v2+ me named export hai

function EventDetails() {
  const { id } = useParams(); // URL se event ID
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Redux se logged-in user

  const [event, setEvent] = useState(null); // Event details
  const [loading, setLoading] = useState(true); // Loading state
  const [booking, setBooking] = useState(false); // Booking in progress
  const [ticketData, setTicketData] = useState(null); // Booked ticket info (QR code)

  // ✅ Event fetch karna
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ✅ Ticket booking function
  const handleBookTicket = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!event) return;

    const ticketsLeft = event.totalTickets - event.sold;

    // Event date compare (sirf date, time ignore)
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastEvent = eventDate < today;

    if (ticketsLeft <= 0) {
      alert("Sorry, tickets are sold out!");
      return;
    }

    if (isPastEvent) {
      alert("This event has ended, booking closed!");
      return;
    }

    try {
      setBooking(true);

      // Check: user already booked 2 tickets nahi
      const ticketsRef = collection(db, "tickets");
      const q = query(
        ticketsRef,
        where("email", "==", user.email.trim().toLowerCase()),
        where("eventId", "==", event.id)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length >= 2) {
        alert("You can book a maximum of 2 tickets for this event!");
        setBooking(false);
        return;
      }

      // Add ticket to Firestore
      const ticketRef = await addDoc(ticketsRef, {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        email: user.email.trim().toLowerCase(),
        status: "Booked",
        createdAt: new Date().toISOString(),
      });

      // Update event sold count
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { sold: event.sold + 1 });

      alert("🎉 Ticket booked successfully!");

      setEvent((prev) => ({ ...prev, sold: prev.sold + 1 }));

      // Ticket data set karna taake QR code show ho
      setTicketData({
        ticketId: ticketRef.id,
        eventName: event.name,
        eventDate: event.date,
        userEmail: user.email,
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading event...</p>;
  if (!event) return <p className="text-center mt-10">Event not found</p>;

  const ticketsLeft = event.totalTickets - event.sold;

  // Event date check for button disable
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastEvent = eventDate < today;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img
        src={event.imageUrl}
        alt={event.name}
        className="w-full h-72 object-cover rounded"
      />
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-gray-600 mt-2">Date: {event.date}</p>
        <p className="mt-4">Total Tickets: {event.totalTickets}</p>
        <p>
          Tickets Left:{" "}
          <span className={ticketsLeft === 0 ? "text-red-500" : ""}>
            {ticketsLeft}
          </span>
        </p>

        <button
          onClick={handleBookTicket}
          disabled={booking || ticketsLeft === 0 || isPastEvent}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded disabled:bg-gray-400"
        >
          {isPastEvent
            ? "Event Ended"
            : ticketsLeft === 0
            ? "Sold Out"
            : booking
            ? "Booking..."
            : "Book Ticket"}
        </button>

        {/* ✅ QR Code Display */}
        {ticketData && (
          <div className="mt-8 p-4 border rounded shadow bg-gray-50">
            <h2 className="text-xl font-bold mb-2">Your Ticket 🎟</h2>
            <p><strong>Event:</strong> {ticketData.eventName}</p>
            <p><strong>Date:</strong> {ticketData.eventDate}</p>
            <p><strong>Email:</strong> {ticketData.userEmail}</p>
            <p><strong>Ticket ID:</strong> {ticketData.ticketId}</p>
            <div className="mt-4">
              <QRCodeSVG value={ticketData.ticketId} size={180} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
