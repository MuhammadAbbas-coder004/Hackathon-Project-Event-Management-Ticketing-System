// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  // States
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch organizer name
  useEffect(() => {
    const fetchOrganizerName = async () => {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setOrganizerName(snap.data().name);
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

  // Fetch attendees for selected event
  const fetchAttendees = async (event) => {
    setSelectedEvent(event);
    setAttendeeLoading(true);
    setShowValidate(false);
    try {
      const ref = collection(db, "events", event.id, "attendees");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        eventId: event.id,
        eventName: event.name,
        ...doc.data(),
      }));
      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  // Validate ticket
  const handleValidate = async (att) => {
    try {
      const attendeeRef = doc(db, "events", att.eventId, "attendees", att.id);
      await updateDoc(attendeeRef, { status: "Used" });
      setAttendees((prev) =>
        prev.map((a) => (a.id === att.id ? { ...a, status: "Used" } : a))
      );
    } catch (err) {
      console.error("Failed to validate ticket:", err);
      alert("Ticket validation failed!");
    }
  };

  // Filter attendees for search
  const filteredAttendees = attendees.filter(
    (att) =>
      att.name.toLowerCase().includes(search.toLowerCase()) ||
      att.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6 text-gray-600">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Organizer Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome, <span className="font-semibold">{organizerName || user?.email}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Events</p>
          <p className="text-3xl font-bold">{events.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Tickets Sold</p>
          <p className="text-3xl font-bold">{events.reduce((sum, e) => sum + (e.sold || 0), 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Sold Out Events</p>
          <p className="text-3xl font-bold">{events.filter((e) => e.sold >= e.totalTickets).length}</p>
        </div>
      </div>

      {/* Events Section */}
      <h2 className="text-2xl font-semibold mb-4">Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow hover:shadow-xl transition">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.name} className="h-44 w-full object-cover rounded-t-xl" />
            )}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
              <p className="text-gray-500 text-sm mt-2">
                Start Date: <span className="font-medium">7 Feb</span>
              </p>
              <p className="text-gray-500 text-sm">
                End Date: <span className="font-medium">15 Feb</span>
              </p>
              <p className="text-gray-600 mt-2">Tickets: {event.sold}/{event.totalTickets}</p>
              {event.sold >= event.totalTickets && (
                <span className="inline-block mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded">Sold Out</span>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fetchAttendees(event)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  View Attendees
                </button>
                <button
                  onClick={() => {
                    fetchAttendees(event);
                    setShowValidate(true);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
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
        <div className="mt-12 bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">
            {showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}
          </h2>

          {attendeeLoading ? (
            <p className="text-gray-600">Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p className="text-gray-500">No attendees yet.</p>
          ) : (
            <div>
              {showValidate && (
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border p-2 rounded w-full max-w-sm mb-4"
                />
              )}
              <div className="overflow-x-auto">
                <table className="w-full border rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Ticket ID</th>
                      <th className="p-3 text-left">Status</th>
                      {showValidate && <th className="p-3 text-left">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="border-t">
                        <td className="p-3">{att.name}</td>
                        <td className="p-3">{att.email}</td>
                        <td className="p-3">{att.id}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              att.status === "Used"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {att.status || "Booked"}
                          </span>
                        </td>
                        {showValidate && (
                          <td className="p-3">
                            {att.status === "Booked" ? (
                              <button
                                onClick={() => handleValidate(att)}
                                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                              >
                                Validate
                              </button>
                            ) : (
                              <span className="text-green-600 font-semibold">Validated</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
