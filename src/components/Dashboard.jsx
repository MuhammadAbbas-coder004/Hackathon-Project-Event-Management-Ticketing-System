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
    if (!user?.uid) return;
    const fetchOrganizerName = async () => {
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

  // Fetch all events
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
  const fetchAttendees = async (event, validate = false) => {
    setSelectedEvent(event);
    setShowValidate(validate); // Set validate mode
    setAttendeeLoading(true);

    try {
      const ref = collection(db, "tickets"); // Tickets collection
      const snapshot = await getDocs(ref);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((ticket) => ticket.eventId === event.id); // Filter by event

      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  // Validate ticket
  const handleValidate = async (ticket) => {
    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, { status: "Used" });

      // Update UI
      setAttendees((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "Used" } : t))
      );
    } catch (err) {
      console.error("Ticket validation failed:", err);
      alert("Failed to validate ticket!");
    }
  };

  // Filter attendees
  const filteredAttendees = attendees.filter(
    (att) =>
      att.name?.toLowerCase().includes(search.toLowerCase()) ||
      att.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center text-gray-600 text-lg mt-10">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Organizer Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Welcome, <span className="font-semibold">{organizerName || user?.email}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl text-center transition">
          <p className="text-gray-500 text-sm">Total Events</p>
          <p className="text-3xl font-bold mt-2">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl text-center transition">
          <p className="text-gray-500 text-sm">Tickets Sold</p>
          <p className="text-3xl font-bold mt-2">
            {events.reduce((sum, e) => sum + (e.sold || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl text-center transition">
          <p className="text-gray-500 text-sm">Sold Out Events</p>
          <p className="text-3xl font-bold mt-2">
            {events.filter((e) => e.sold >= e.totalTickets).length}
          </p>
        </div>
      </div>

      {/* Events */}
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-48 object-cover rounded-t-3xl"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Tickets Sold: {event.sold}/{event.totalTickets}
              </p>
              {event.sold >= event.totalTickets && (
                <span className="inline-block mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
              <div className="mt-4 flex flex-col md:flex-row gap-2">
                <button
                  onClick={() => fetchAttendees(event, false)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  View Attendees
                </button>
                <button
                  onClick={() => fetchAttendees(event, true)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition-colors"
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
        <div className="mt-12 bg-white p-6 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}
          </h2>

          {showValidate && attendees.length > 0 && (
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-3 rounded-xl w-full max-w-sm mb-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          )}

          {attendeeLoading ? (
            <p className="text-gray-600">Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p className="text-gray-500">No attendees yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl">
                <thead className="bg-gray-100 rounded-t-xl">
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
                    <tr key={att.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3">{att.name}</td>
                      <td className="p-3">{att.email}</td>
                      <td className="p-3">{att.id}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
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
                              className="bg-blue-500 text-white py-1 px-3 rounded-xl hover:bg-blue-600 transition-colors"
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
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
