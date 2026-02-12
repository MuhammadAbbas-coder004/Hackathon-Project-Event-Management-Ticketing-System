// src/components/Footer.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

const Footer = () => {
  const user = useSelector((state) => state.auth.user);
  const [organizerName, setOrganizerName] = useState("");

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

  return (
    <footer className="bg-indigo-600 text-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        {/* Website Name */}
        <div className="text-xl sm:text-2xl font-bold tracking-wide">
          EventNexus
        </div>

        {/* Organizer Name */}
        {organizerName && (
          <div className="text-sm sm:text-base text-white/90">
            Organized by: <span className="font-semibold">{organizerName}</span>
          </div>
        )}

        {/* Copyright / Year */}
        <div className="text-xs sm:text-sm text-white/70">
          © {new Date().getFullYear()} EventNexus. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
