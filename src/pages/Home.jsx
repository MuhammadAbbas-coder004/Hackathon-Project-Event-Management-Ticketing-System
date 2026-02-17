import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig/firebase";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "events"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  if (loading)
    return <p className="text-center mt-10 text-gray-600 text-lg">Loading events...</p>;
  if (events.length === 0)
    return <p className="text-center mt-10 text-gray-600 text-lg">No events available.</p>;

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

                <Link
                  to={`/events/${event.id}`}
                  className="mt-auto block text-center bg-indigo-600 text-white py-2 rounded-xl font-semibold text-sm transition-colors duration-300 hover:bg-indigo-700"
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
