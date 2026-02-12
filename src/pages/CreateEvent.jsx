import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function CreateEvent() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState(""); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !location || !startDate || !endDate || !totalTickets || !ticketPrice) {
      alert("Please fill all required fields!");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        name,
        location, 
        startDate,
        endDate,
        totalTickets: Number(totalTickets),
        sold: 0,
        ticketPrice: Number(ticketPrice),
        imageUrl: imageUrl || "",
        createdAt: new Date().toISOString(),
      });

      alert("Event created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-4 sm:pt-6 p-4 sm:p-6">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-2xl overflow-hidden bg-white">
        
        {/* Left panel */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center p-10 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Create Your Event</h2>
          <p className="text-gray-200 leading-relaxed text-base sm:text-lg">
            Fill in the details for your event, including dates, ticket info, and an optional image.
          </p>
        </div>

        {/* Right panel (form) */}
        <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col justify-start">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center md:text-left">
            Event Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            <input
              type="text"
              placeholder="Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
              required
            />

            <input
              type="text"
              placeholder="Event Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
              required
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="number"
                placeholder="Total Tickets"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
                required
              />
              <input
                type="number"
                placeholder="Ticket Price"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Event Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 sm:px-5 sm:py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center
                         disabled:bg-gray-400 transition transform hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 duration-300"
            >
              {loading ? (
                <svg
                  className="w-5 h-5 mr-2 text-white animate-spin"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Creating..." : "Create Event"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
