import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../firebase/firebaseConfig/firebase";
import { QRCodeSVG } from "qrcode.react";

function EventCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Handle ticket booking
  const handleBookTicket = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!event) return;

    const ticketsLeft = event.totalTickets - (event.sold || 0);
    if (ticketsLeft <= 0) {
      alert("Tickets are sold out!");
      return;
    }

    setBooking(true);

    try {
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
        eventDate: event.startDate || new Date().toISOString(),
        email: user.email.trim().toLowerCase(),
        status: "Booked",
        createdAt: new Date().toISOString(),
        ticketPrice: event.ticketPrice || 0,
      });

      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { sold: (event.sold || 0) + 1 });

      setEvent((prev) => ({ ...prev, sold: (prev.sold || 0) + 1 }));

      
      setTicketData({
        ticketId: ticketRef.id,
        eventName: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        price: event.ticketPrice,
        userEmail: user.email,
      });
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed! Try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return <p className="text-center mt-4 text-gray-600 text-base">Loading...</p>;
  if (!event)
    return <p className="text-center mt-4 text-gray-600 text-base">Event not found</p>;

  const ticketsLeft = event.totalTickets - (event.sold || 0);

  return (
    <div className="max-w-3xl sm:max-w-4xl mx-auto p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden sm:mx-2">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-52 sm:h-64 object-cover"
          />
        )}

        <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {event.name}
          </h1>

          <p className="text-gray-500 text-sm sm:text-base">
            Location: {event.location || "N/A"}
          </p>

          <p className="text-gray-500 text-sm sm:text-base">
            Start: {new Date(event.startDate).toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm sm:text-base">
            End: {new Date(event.endDate).toLocaleString()}
          </p>

          <p className="text-gray-700 text-sm sm:text-base">
            Tickets Left:{" "}
            <span
              className={
                ticketsLeft === 0
                  ? "text-red-500 font-semibold"
                  : "font-semibold"
              }
            >
              {ticketsLeft}
            </span>
          </p>

          <p className="text-gray-700 text-sm sm:text-base">
            Price: ${event.ticketPrice || 0}
          </p>

          {/* Book Ticket button with spinner */}
          <button
            onClick={handleBookTicket}
            disabled={booking || ticketsLeft === 0}
            className="mt-3 sm:mt-4 bg-indigo-600 text-white py-2 sm:py-3 px-5 sm:px-7 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold flex items-center justify-center disabled:bg-gray-400 transition transform hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 duration-300"
          >
            {booking ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
                ></path>
              </svg>
            ) : ticketsLeft === 0 ? (
              "Sold Out"
            ) : (
              "Book Ticket"
            )}
          </button>

          {ticketData && (
            <div className="mt-3 sm:mt-5 p-3 sm:p-5 border rounded-xl sm:rounded-2xl shadow bg-gray-50 text-center">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Your Ticket</h2>
              <p className="text-sm text-gray-700 mb-1">
                User: {ticketData.userEmail}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Event Date: {new Date(ticketData.startDate).toLocaleString()} -{" "}
                {new Date(ticketData.endDate).toLocaleString()}
              </p>
              <QRCodeSVG value={ticketData.ticketId} size={130} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
