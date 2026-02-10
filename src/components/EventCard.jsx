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
import { QRCodeSVG } from "qrcode.react";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [ticketData, setTicketData] = useState(null);

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

  const handleBookTicket = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!event) return;

    const ticketsLeft = event.totalTickets - event.sold;
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastEvent = eventDate < today;

    if (ticketsLeft <= 0) {
      alert("Tickets are sold out!");
      return;
    }

    if (isPastEvent) {
      alert("Event ended!");
      return;
    }

    try {
      setBooking(true);

      const ticketsRef = collection(db, "tickets");
      const q = query(
        ticketsRef,
        where("email", "==", user.email.trim().toLowerCase()),
        where("eventId", "==", event.id)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length >= 2) {
        alert("Max 2 tickets per user!");
        setBooking(false);
        return;
      }

      const ticketRef = await addDoc(ticketsRef, {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        email: user.email.trim().toLowerCase(),
        status: "Booked",
        createdAt: new Date().toISOString(),
      });

      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { sold: event.sold + 1 });

      setEvent((prev) => ({ ...prev, sold: prev.sold + 1 }));

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

  if (loading)
    return <p className="text-center mt-10 text-gray-600 text-lg">Loading...</p>;
  if (!event)
    return <p className="text-center mt-10 text-gray-600 text-lg">Event not found</p>;

  const ticketsLeft = event.totalTickets - event.sold;
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastEvent = eventDate < today;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Bigger Event Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-80 object-cover"
        />

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-800">{event.name}</h1>
          <p className="text-gray-500 mt-2 text-lg">Date: {event.date}</p>
          <p className="text-gray-700 mt-4 text-lg">
            Tickets Left:{" "}
            <span className={ticketsLeft === 0 ? "text-red-500 font-semibold" : "font-semibold"}>
              {ticketsLeft}
            </span>
          </p>

          <button
            onClick={handleBookTicket}
            disabled={booking || ticketsLeft === 0 || isPastEvent}
            className="mt-6 bg-indigo-600 text-white py-3 px-8 rounded-xl text-lg font-semibold disabled:bg-gray-400 transition-colors duration-300 hover:bg-indigo-700"
          >
            {isPastEvent
              ? "Event Ended"
              : ticketsLeft === 0
              ? "Sold Out"
              : booking
              ? "Booking..."
              : "Book Ticket"}
          </button>

          {/* QR Code */}
          {ticketData && (
            <div className="mt-8 p-6 border rounded-2xl shadow bg-gray-50 text-center">
              <h2 className="text-2xl font-bold mb-3">Your Ticket</h2>
              <p className="text-gray-700 text-base mb-1">
                <strong>Event:</strong> {ticketData.eventName}
              </p>
              <p className="text-gray-700 text-base mb-1">
                <strong>Date:</strong> {ticketData.eventDate}
              </p>
              <p className="text-gray-700 text-base mb-1">
                <strong>Email:</strong> {ticketData.userEmail}
              </p>
              <p className="text-gray-700 text-base mb-3">
                <strong>Ticket ID:</strong> {ticketData.ticketId}
              </p>
              <QRCodeSVG value={ticketData.ticketId} size={200} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
