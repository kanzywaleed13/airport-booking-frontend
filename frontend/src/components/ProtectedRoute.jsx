import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../services/api";

/**
 * ProtectedRoute
 * Wraps any page that requires authentication.
 * Optionally restricts to a specific role (e.g. "admin").
 *
 * Usage:
 *   <Route path="/search" element={<ProtectedRoute><SearchFlights /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  // Check 1: Must be authenticated
  if (!isAuthenticated()) {
    // Clear any stale session data before redirecting
    sessionStorage.removeItem("mfa_pending");
    return <Navigate to="/login" replace />;
  }

  // Check 2: If a specific role is required, verify it
  if (requiredRole) {
    const role = getUserRole();
    if (role !== requiredRole) {
      // Authenticated but wrong role — send to their appropriate page
      return <Navigate to="/search" replace />;
    }
  }

  return children;
}