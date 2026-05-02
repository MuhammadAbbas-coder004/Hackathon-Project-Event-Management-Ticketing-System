import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { db } from "../firebase/firebaseConfig/firebase";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect organizers to dashboard 
  useEffect(() => {
    if (user && user.role === "organizer") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("🔍 Attempting to fetch events from collection: 'events'...");
        const snapshot = await getDocs(collection(db, "events"));
        console.log("📊 Snapshot received. Number of documents found:", snapshot.size);
        
        if (snapshot.empty) {
          console.warn("⚠️ The 'events' collection is empty in Firestore.");
        }

        const data = snapshot.docs.map((doc) => {
          console.log("📄 Doc ID:", doc.id, "Data:", doc.data());
          return { id: doc.id, ...doc.data() };
        });
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Unable to load events. Please check your Firebase permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  if (loading)
    return <p className="text-center mt-10 text-gray-600 text-lg font-medium animate-pulse">Loading events...</p>;
  
  if (user && user.role === "organizer") {
    return null; // The useEffect will handle navigation
  }

  if (error)
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="text-red-700 font-semibold mb-2">{error}</p>
        <p className="text-red-600 text-sm">Make sure your Firestore rules allow public reads for the 'events' collection.</p>
      </div>
    );

  if (events.length === 0)
    return <p className="text-center mt-10 text-gray-600 text-lg font-medium">No events available at the moment.</p>;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen p-6">
      {/* Fullscreen Carousel */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1} 
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-96 sm:h-[28rem] md:h-[32rem] lg:h-[36rem] rounded-3xl overflow-hidden shadow-lg mb-6"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <div className="relative w-full h-full">
              <img
                src={event.imageUrl || "https://via.placeholder.com/1200x600"}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-105"
              />
              {/* Overlay Text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h2 className="text-3xl sm:text-4xl font-bold truncate">{event.name}</h2>
                <p className="text-sm sm:text-base truncate">{event.location || "N/A"}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Heading above cards */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
        Explore Upcoming Events
      </h1>

      {/* Event Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {events.map((event) => {
          const ticketsLeft = event.totalTickets - (event.sold || 0);
          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 transform transition duration-300 hover:scale-105 hover:shadow-2xl flex flex-col"
            >
              {/* Event Image */}
              <div className="h-60 w-full overflow-hidden">
                <img
                  src={event.imageUrl || "https://via.placeholder.com/400x250"}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 transform hover:scale-110"
                />
              </div>

              {/* Event Details */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-800 truncate">{event.name}</h2>
                <p className="text-gray-500 mt-1 text-sm">Location: {event.location || "N/A"}</p>
                <p className="text-gray-500 mt-1 text-sm">Start: {formatDate(event.startDate)}</p>
                <p className="text-gray-500 mt-1 text-sm">End: {formatDate(event.endDate)}</p>
                <p className="text-gray-500 mt-1 text-sm">Price: ${event.ticketPrice || "N/A"}</p>

                <p className="mt-2 text-gray-700 text-sm">
                  Tickets Left:{" "}
                  <span className={ticketsLeft === 0 ? "text-red-500 font-semibold" : "font-medium"}>
                    {ticketsLeft}
                  </span>
                </p>

                <div className="mt-auto flex gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-300"
                  >
                    View Details
                  </Link>

                  {user && user.role === "organizer" && (
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (window.confirm("Are you sure you want to delete this event?")) {
                          try {
                            const { deleteDoc, doc } = await import("firebase/firestore");
                            await deleteDoc(doc(db, "events", event.id));
                            setEvents(events.filter((ev) => ev.id !== event.id));
                            alert("Event deleted successfully!");
                          } catch (err) {
                            alert("Error deleting event: " + err.message);
                          }
                        }
                      }}
                      className="px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-300"
                      title="Delete Event"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
