// src/components/EventCarousel.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";


// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const EventCarousel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const ref = collection(db, "events");
        const snapshot = await getDocs(ref);
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

  if (loading) return <p className="text-center text-gray-600 mt-6">Loading events...</p>;
  if (!events.length) return <p className="text-center text-gray-600 mt-6">No events found.</p>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="rounded-3xl overflow-hidden shadow-lg"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-56 sm:h-64 md:h-72 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-5">
                <h3 className="text-white font-bold text-lg sm:text-xl truncate">{event.name}</h3>
                <p className="text-white text-sm sm:text-base truncate">{event.location || "Location N/A"}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default EventCarousel;
