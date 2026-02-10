import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";

import { useSelector } from "react-redux";
import { db } from "../firebase/firebaseConfig/firebase";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

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

    if (event.sold >= event.totalTickets) {
      alert("Sorry, tickets are sold out!");
      return;
    }

    try {
      setBooking(true);

      // Check how many tickets this user already booked for this event
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
      await addDoc(ticketsRef, {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        email: user.email.trim().toLowerCase(),
        status: "Booked",
        createdAt: new Date().toISOString(),
      });

      // Update sold count
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, { sold: event.sold + 1 });

      alert("🎉 Ticket booked successfully!");
      setEvent((prev) => ({ ...prev, sold: prev.sold + 1 }));
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img src={event.imageUrl} alt={event.name} className="w-full h-72 object-cover rounded" />
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-gray-600 mt-2">Date: {event.date}</p>
        <p className="mt-4">Total Tickets: {event.totalTickets}</p>
        <p>
          Tickets Left: <span className={ticketsLeft === 0 ? "text-red-500" : ""}>{ticketsLeft}</span>
        </p>

        <button
          onClick={handleBookTicket}
          disabled={booking || ticketsLeft === 0}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded disabled:bg-gray-400"
        >
          {ticketsLeft === 0 ? "Sold Out" : booking ? "Booking..." : "Book Ticket"}
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
