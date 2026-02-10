import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig/firebase";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600 text-lg font-medium">
        Loading events...
      </p>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Page Heading */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
        Explore Upcoming Events
      </h1>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {events.map((event) => {
          const ticketsLeft = event.totalTickets - event.sold;

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {/* Event Image */}
              <div className="h-52 w-full overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110"
                />
              </div>

              {/* Event Details */}
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                  {event.name}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Date: {event.date}</p>

                <p className="mt-2 text-gray-700 text-sm">
                  Tickets Left:{" "}
                  <span
                    className={
                      ticketsLeft === 0
                        ? "text-red-500 font-semibold"
                        : "font-medium"
                    }
                  >
                    {ticketsLeft}
                  </span>
                </p>

                {/* View Details button */}
                <Link
                  to={`/events/${event.id}`}
                  className="block mt-4 text-center bg-indigo-600 text-white py-2 rounded-xl font-semibold text-sm transition-colors duration-300 hover:bg-indigo-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
