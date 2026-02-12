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
import Footer from './components/Footer'; // ✅ Footer import

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
                role: data.role,
              }),
            );
          } else {
            dispatch(setUser(null));
          }
        } catch (err) {
          console.error(err);
          dispatch(setUser(null));
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
          {/* Navbar always visible */}
          <Navbar />

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
                  role={["attendee"]}
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

          {/* ✅ Footer render */}
          <Footer organizerName="Your Organizer Name" />

        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
