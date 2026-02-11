// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, getDocs, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch organizer full name
  useEffect(() => {
    if (!user?.uid) return;
    const fetchOrganizerName = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const fullName = data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim();
          setOrganizerName(fullName || data.name || user.email);
        }
      } catch (err) {
        console.error("Error fetching organizer name:", err);
      }
    };
    fetchOrganizerName();
  }, [user]);

  // Fetch events
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

  const fetchAttendees = async (event, validate = false) => {
    setSelectedEvent(event);
    setShowValidate(validate);
    setAttendeeLoading(true);

    try {
      const ref = collection(db, "tickets");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((ticket) => ticket.eventId === event.id);
      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const handleValidate = async (ticket) => {
    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, { status: "Used" });
      setAttendees((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "Used" } : t))
      );
    } catch (err) {
      console.error("Ticket validation failed:", err);
      alert("Failed to validate ticket!");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.name?.toLowerCase().includes(search.toLowerCase()) ||
      att.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center text-gray-600 text-lg mt-10">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Organizer Dashboard</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-lg">
          Welcome, <span className="font-semibold">{organizerName}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg hover:shadow-2xl text-center transition-all duration-300">
          <p className="text-gray-500 text-xs sm:text-sm">Total Events</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{events.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg hover:shadow-2xl text-center transition-all duration-300">
          <p className="text-gray-500 text-xs sm:text-sm">Tickets Sold</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
            {events.reduce((sum, e) => sum + (e.sold || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg hover:shadow-2xl text-center transition-all duration-300">
          <p className="text-gray-500 text-xs sm:text-sm">Sold Out Events</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
            {events.filter((e) => e.sold >= e.totalTickets).length}
          </p>
        </div>
      </div>

      {/* Events */}
      <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-gray-800">Your Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1 hover:scale-105"
          >
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-44 sm:h-52 object-cover"
              />
            )}
            <div className="p-4 sm:p-6 flex flex-col flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{event.name}</h3>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                Start Date: {formatDate(event.startDate)}
              </p>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                End Date: {formatDate(event.endDate)}
              </p>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                Tickets Sold: {event.sold}/{event.totalTickets}
              </p>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                Ticket Price: ${event.ticketPrice}
              </p>
              {event.sold >= event.totalTickets && (
                <span className="inline-block mt-1 text-xs sm:text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
                <button
                  onClick={() => fetchAttendees(event, false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-2 rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-all duration-300 text-sm sm:text-base"
                >
                  View Attendees
                </button>
                <button
                  onClick={() => fetchAttendees(event, true)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm sm:text-base"
                >
                  Validate Tickets
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendees / Validate Section */}
      {selectedEvent && (
        <div className="mt-6 sm:mt-12 bg-white p-4 sm:p-6 rounded-3xl shadow-lg">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
            {showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}
          </h2>

          {showValidate && attendees.length > 0 && (
            <input
              type="text"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 sm:p-3 rounded-full w-full max-w-xs mb-3 text-sm sm:text-base focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            />
          )}

          {attendeeLoading ? (
            <p className="text-gray-600 text-sm sm:text-base">Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">No attendees yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[32rem] overflow-y-auto">
              {filteredAttendees.map((att) => (
                <div
                  key={att.id}
                  className="bg-gray-50 p-4 sm:p-5 rounded-3xl shadow hover:shadow-lg transition-all flex flex-col justify-between transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">{att.name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{att.email}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">Ticket: {att.id}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        att.status === "Used"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {att.status || "Booked"}
                    </span>
                    {showValidate && att.status === "Booked" && (
                      <button
                        onClick={() => handleValidate(att)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm px-2 py-1 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                      >
                        Validate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
