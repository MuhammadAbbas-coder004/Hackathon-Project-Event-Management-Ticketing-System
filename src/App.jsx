// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase/firebaseConfig/firebase";
import { doc, getDoc } from "firebase/firestore";
import { setUser } from "./redux/reducers/authSlice";

// Components
import ProtectedRoutes from "./components/ProtectedRoutes";
import Navbar from './components/Navbar'
import Footer from './components/Footer'; 

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";
import Ticket from "./pages/Ticket";
import Organizer from "./pages/Organizer";
import TicketScanner from "./pages/TicketScanner"; 

// Auth Persistence Component
function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || data.name,
                role: firebaseUser.email === "mabbas@gmail.com" ? "organizer" : (data.role || "attendee"),
              }),
            );
          } else {
            // Fallback for cases where Auth user exists but Firestore doc doesn't (e.g. permission error during signup)
            dispatch(
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || "User",
                role: firebaseUser.email === "mabbas@gmail.com" ? "organizer" : "attendee",
              }),
            );
          }
        } catch (err) {
          console.error("Firestore fetch error in AuthProvider:", err);
          // If Firestore fails, we still check the email to keep the organizer in their dashboard
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "User",
              role: firebaseUser.email === "mabbas@gmail.com" ? "organizer" : "attendee",
            }),
          );
        }
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return children;
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Navbar always visible */}
            <Navbar />

            <main className="flex-grow">
              <Routes>
                {/* PUBLIC */}
                <Route index element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* ATTENDEE */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoutes role={["attendee"]} component={<Home />} />
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoutes
                      role={["attendee", "organizer"]}
                      component={<EventDetails />}
                    />
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoutes
                      role={["attendee"]}
                      component={<MyTickets />}
                    />
                  }
                />
                <Route
                  path="/ticket/:ticketId"
                  element={
                    <ProtectedRoutes role={["attendee"]} component={<Ticket />} />
                  }
                />

                {/* ORGANIZER */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<Organizer />}
                    />
                  }
                />
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<CreateEvent />}
                    />
                  }
                />

                {/* Organizer TicketScanner */}
                <Route
                  path="/ticket-scanner"
                  element={
                    <ProtectedRoutes
                      role={["organizer"]}
                      component={<TicketScanner />}
                    />
                  }
                />

                {/* FALLBACK */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer render */}
            <Footer organizerName="Your Organizer Name" />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
