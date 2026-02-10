// src/pages/CreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";


function CreateEvent() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !date || !totalTickets) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      // Firebase Firestore me add event
      await addDoc(collection(db, "events"), {
        name,
        date,
        totalTickets: Number(totalTickets),
        sold: 0, // initially 0 tickets sold
        imageUrl: imageUrl || "", // optional
        createdAt: new Date().toISOString(),
      });

      alert("Event created successfully!");
      navigate("/dashboard"); // dashboard me redirect
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="date"
            placeholder="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Total Tickets"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Event Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
