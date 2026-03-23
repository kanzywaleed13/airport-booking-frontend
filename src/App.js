import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/api";

import Login from "./pages/Login";
import MFAVerify from "./pages/MFAVerify";
import SearchFlights from "./pages/SearchFlights";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";

/**
 * PublicRoute
 * Redirects already-authenticated users away from login/mfa pages.
 * Prevents a logged-in user from seeing the login page again.
 */
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/search" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes (no auth needed) ─────────────────────────── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/mfa-verify"
          element={
            <PublicRoute>
              <MFAVerify />
            </PublicRoute>
          }
        />

        {/* ── Protected routes (auth required) ───────────────────────── */}
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

        {/* ── Default redirect ────────────────────────────────────────── */}
        {/* 
          If user is authenticated → go to /search
          If not → go to /login
          This handles visiting bare "/" or any unknown URL
        */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/search" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route
          path="*"
          element={
            isAuthenticated()
              ? <Navigate to="/search" replace />
              : <Navigate to="/login" replace />
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

      </Routes>
    </BrowserRouter>
  );
}