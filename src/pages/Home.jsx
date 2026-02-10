import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig/firebase";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <p className="text-center mt-10">Loading events...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => {
          const ticketsLeft = event.totalTickets - event.sold;

          return (
            <div
              key={event.id}
              className="bg-white rounded shadow overflow-hidden"
            >
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-gray-600">Date: {event.date}</p>

                <p className="mt-2">
                  Tickets Left:{" "}
                  <span className={ticketsLeft === 0 ? "text-red-500" : ""}>
                    {ticketsLeft}
                  </span>
                </p>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
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
