import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function ScanTicket() {
  // State management
  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  // QR scanner reference
  const html5QrRef = useRef(null);

  // Check camera permission on load
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: "camera" });
        setCameraPermission(permission.state);
        permission.onchange = () => setCameraPermission(permission.state);
      }
    } catch {
      console.log("Permission API not supported");
    }
  };

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
      return true;
    } catch {
      setCameraPermission("denied");
      setError("Camera access denied. Please enable camera.");
      return false;
    }
  };

  // Start scanner
  const startScanner = async () => {
    if (cameraPermission !== "granted") {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;
    }

    setScanning(true);
    setTicketData(null);
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (!html5QrRef.current) html5QrRef.current = new Html5Qrcode("qr-reader");

      html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },

        async (decodedText) => {
          try {
            await html5QrRef.current.stop();
          } catch (err) {
            console.error("Stop scanner error:", err);
          }

          setScanning(false);
          setLoading(false);

          try {
            const parsed = JSON.parse(decodedText);
            const ticketId = parsed.ticketId;

            if (!ticketId) throw new Error("Invalid QR Code");

            const ticketRef = doc(db, "tickets", ticketId);
            const ticketSnap = await getDoc(ticketRef);

            if (!ticketSnap.exists()) throw new Error("Ticket not found");

            const ticket = { id: ticketSnap.id, ...ticketSnap.data() };

            if (ticket.status === "checked") {
              setTicketData(ticket);
              setError("Ticket already used");
              return;
            }

            const checkTime = new Date().toISOString();
            await updateDoc(ticketRef, { status: "checked", checkedAt: checkTime });

            setTicketData({ ...ticket, status: "checked", checkedAt: checkTime });
          } catch (err) {
            setError(err?.message || "Invalid QR Code");
          }
        },
        () => {}
      ).catch((err) => {
        setError(err?.message || "Unable to start camera");
        setScanning(false);
        setLoading(false);
      });

      setLoading(false); 
    }, 200);
  };

  // Cancel scanner
  const cancelScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (err) {
        console.error("Failed to cancel scanner:", err);
      }
    }
    setScanning(false);
    setLoading(false);
  };

  // Reset scanner
  const resetScanner = () => {
    setTicketData(null);
    setError("");
    setScanning(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50 px-4 pt-12 sm:pt-20 pb-10">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Ticket Scanner</h1>
          <p className="text-gray-500 text-sm sm:text-base">Scan QR code to check attendees</p>
        </div>

        {/* Start Button */}
        {!scanning && !ticketData && cameraPermission !== "denied" && (
          <button
            onClick={startScanner}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center space-x-2 transition duration-200 disabled:bg-gray-400"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
              </svg>
            )}
            <span>{loading ? "Starting..." : "Start Scanning"}</span>
          </button>
        )}

        {/* Scanner */}
        {scanning && (
          <div className="space-y-4">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden border shadow-lg"></div>

     
            <button
              onClick={cancelScanner}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center space-x-2 transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Ticket Details */}
        {ticketData && (
          <div className="bg-gray-50 border rounded-xl p-5 space-y-2 shadow-md">
            <h2 className="text-lg font-semibold text-gray-800">Ticket Details</h2>
            <p><strong>Event:</strong> {ticketData.eventName}</p>
            <p><strong>Email:</strong> {ticketData.email}</p>
            <p><strong>Ticket ID:</strong> {ticketData.id}</p>
            <p><strong>Date:</strong> {ticketData.eventDate}</p>
            {ticketData.checkedAt && <p><strong>Checked At:</strong> {new Date(ticketData.checkedAt).toLocaleString()}</p>}
            <button
              onClick={resetScanner}
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-200"
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        {/* Error Section */}
        {error && !scanning && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}

export default ScanTicket;
