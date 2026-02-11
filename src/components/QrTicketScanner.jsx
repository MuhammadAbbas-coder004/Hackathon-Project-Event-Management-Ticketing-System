// src/pages/ScanTicket.jsx

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function ScanTicket() {

  // State Management

  const [cameraPermission, setCameraPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState("");

  // QR Scanner reference
  const html5QrRef = useRef(null);


  // Check Camera Permission on Load

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({
          name: "camera",
        });
        setCameraPermission(permission.state);
        permission.onchange = () => setCameraPermission(permission.state);
      }
    } catch {
      console.log("Permission API not supported");
    }
  };


  // Request Camera Access

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Stop stream immediately (only permission check)
      stream.getTracks().forEach((track) => track.stop());

      setCameraPermission("granted");
      return true;
    } catch {
      setCameraPermission("denied");
      setError("Camera access denied. Please enable camera.");
      return false;
    }
  };


  // Start Scanner

  const startScanner = async () => {
    if (cameraPermission !== "granted") {
      const hasAccess = await requestCameraAccess();
      if (!hasAccess) return;
    }

    setScanning(true);
    setError("");
    setTicketData(null);

    setTimeout(() => {
      if (!html5QrRef.current) {
        html5QrRef.current = new Html5Qrcode("qr-reader");
      }

      html5QrRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },

          // On successful scan
          async (decodedText) => {
            try {
              await html5QrRef.current.stop();
            } catch {}

            setScanning(false);

            try {
              const parsed = JSON.parse(decodedText);
              const ticketId = parsed.ticketId;

              if (!ticketId) {
                throw new Error("Invalid QR Code");
              }

              const ticketRef = doc(db, "tickets", ticketId);
              const ticketSnap = await getDoc(ticketRef);

              if (!ticketSnap.exists()) {
                throw new Error("Ticket not found");
              }

              const ticket = {
                id: ticketSnap.id,
                ...ticketSnap.data(),
              };

              // If already checked
              if (ticket.status === "checked") {
                setTicketData(ticket);
                setError("Ticket already used");
                return;
              }

              const checkTime = new Date().toISOString();

              await updateDoc(ticketRef, {
                status: "checked",
                checkedAt: checkTime,
              });

              setTicketData({
                ...ticket,
                status: "checked",
                checkedAt: checkTime,
              });

            } catch (err) {
              setError(err?.message || "Invalid QR Code");
            }
          },

          // Ignore continuous scan errors
          () => {}
        )
        .catch((err) => {
          setError(err?.message || "Unable to start camera");
          setScanning(false);
        });
    }, 200);
  };


  // Stop Scanner

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch {}
    }
    setScanning(false);
  };

  // Reset Scanner

  const resetScanner = () => {
    setTicketData(null);
    setError("");
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Ticket Scanner
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Scan QR code to check attendees
          </p>
        </div>

        {/* Start Button */}
        {!scanning && !ticketData && cameraPermission !== "denied" && (
          <button
            onClick={startScanner}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-200"
          >
            Start Scanning
          </button>
        )}

        {/* Scanner View */}
        {scanning && (
          <div className="space-y-4">
            <div
              id="qr-reader"
              className="w-full rounded-xl overflow-hidden border"
            ></div>

            <button
              onClick={stopScanner}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition duration-200"
            >
              Stop Scanning
            </button>
          </div>
        )}

        {/* Ticket Details */}
        {ticketData && (
          <div className="bg-gray-50 border rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Ticket Details
            </h2>

            <p><strong>Event:</strong> {ticketData.eventName}</p>
            <p><strong>Email:</strong> {ticketData.email}</p>
            <p><strong>Ticket ID:</strong> {ticketData.id}</p>
            <p><strong>Date:</strong> {ticketData.eventDate}</p>

            {ticketData.checkedAt && (
              <p>
                <strong>Checked At:</strong>{" "}
                {new Date(ticketData.checkedAt).toLocaleString()}
              </p>
            )}

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
