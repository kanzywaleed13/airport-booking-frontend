import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchFlights from "./pages/SearchFlights";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import MFAVerify from "./pages/MFAVerify";
import ProtectedRoute from "./components/ProtectedRoute";

function PublicRoute({ children }) {
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user ? "authenticated" : "unauthenticated");
    });

    return () => unsubscribe();
  }, []);

  if (authState === "loading") return null;
  if (authState === "authenticated") return <Navigate to="/search" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/mfa-verify" element={<MFAVerify />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchFlights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}