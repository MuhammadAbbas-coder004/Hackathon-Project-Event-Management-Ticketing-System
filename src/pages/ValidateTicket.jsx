// src/pages/ValidateTickets.jsx
import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";


function ValidateTickets() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1️⃣ Fetch attendees from all events using map
  useEffect(() => {
    const fetchAttendees = async () => {
      setLoading(true);
      try {
        const eventsSnapshot = await getDocs(collection(db, "events"));

        const allAttendees = await Promise.all(
          eventsSnapshot.docs.map(async (eventDoc) => {
            const eventId = eventDoc.id;
            const attendeesSnapshot = await getDocs(
              collection(db, "events", eventId, "attendees")
            );
            return attendeesSnapshot.docs.map((doc) => ({
              id: doc.id,
              eventId,
              ...doc.data(),
            }));
          })
        );

        // allAttendees is array of arrays, flatten it
        setAttendees(allAttendees.flat());
      } catch (err) {
        console.error("Error fetching attendees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  // 2️⃣ Filter attendees by search
  const filteredAttendees = attendees.filter(
    (att) =>
      att.name.toLowerCase().includes(search.toLowerCase()) ||
      att.email.toLowerCase().includes(search.toLowerCase())
  );

  // 3️⃣ Validate ticket
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

  if (loading) return <p className="p-6">Loading attendees...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Validate Tickets</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full max-w-sm mb-4"
      />

      {filteredAttendees.length === 0 ? (
        <p>No attendees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Event ID</th>
                <th className="p-3 text-left">Ticket ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((att) => (
                <tr key={att.id} className="border-b">
                  <td className="p-3">{att.name}</td>
                  <td className="p-3">{att.email}</td>
                  <td className="p-3">{att.eventId}</td>
                  <td className="p-3">{att.id}</td>
                  <td className="p-3">{att.status || "Booked"}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ValidateTickets;
