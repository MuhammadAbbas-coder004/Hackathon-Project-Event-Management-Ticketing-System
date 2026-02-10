// src/pages/CreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function CreateEvent() {
  const navigate = useNavigate();

  // Form state variables
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !date || !totalTickets) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      // Add event to Firestore
      await addDoc(collection(db, "events"), {
        name,
        date,
        totalTickets: Number(totalTickets),
        sold: 0, // initially no tickets sold
        imageUrl: imageUrl || "",
        createdAt: new Date().toISOString(),
      });

      alert("Event created successfully!");
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      {/* Card container */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 sm:p-10">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Create New Event
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            required
          />

          <input
            type="date"
            placeholder="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            required
          />

          <input
            type="number"
            placeholder="Total Tickets"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            required
          />

          <input
            type="text"
            placeholder="Event Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors duration-300 flex justify-center items-center"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
