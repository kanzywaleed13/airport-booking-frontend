import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true, // sends HttpOnly cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Attaches auth token + CSRF header to every outgoing request
api.interceptors.request.use(
  (config) => {
    // Attach JWT token if present (fallback if backend uses Bearer token)
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach CSRF token for all state-changing requests
    // Token is usually set by backend as a readable cookie or meta tag
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────
// Handles global errors — 401, 403, 429, 500 — without leaking details
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Auth endpoints handle their own errors — do not intercept them
    const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/mfa/verify", "/auth/mfa/resend"];
    const isAuthEndpoint = AUTH_ENDPOINTS.some(
      (endpoint) => requestUrl === endpoint || requestUrl.endsWith(endpoint)
    );

    if (status === 401 && !isAuthEndpoint) {
      // Session expired or invalid token — clear session and redirect to login
      clearSession();
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    if (status === 403) {
      // Authenticated but not authorized — do NOT redirect, let the page handle it
      return Promise.reject(new Error("You do not have permission to perform this action."));
    }

    if (status === 429) {
      return Promise.reject(new Error("Too many requests. Please slow down and try again."));
    }

    if (status >= 500) {
      // Never expose server internals — generic message only
      return Promise.reject(new Error("A server error occurred. Please try again later."));
    }

    // For 400-level errors, pass through so individual pages can handle them
    return Promise.reject(error);
  }
);

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Reads CSRF token from a cookie named "csrf_token"
 * Backend should set this as a readable (non-HttpOnly) cookie
 */
function getCsrfToken() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? match.split("=")[1] : null;
}

/**
 * Clears all session data on logout or session expiry
 * Never clears localStorage since we never store tokens there
 */
export function clearSession() {
  sessionStorage.removeItem("auth_token");
  sessionStorage.removeItem("mfa_pending");
  sessionStorage.removeItem("user_email");
  sessionStorage.removeItem("user_role");
}

/**
 * Saves auth data after successful MFA verification
 * Only called once — after MFA is confirmed
 */
export function saveSession(token, role) {
  sessionStorage.setItem("auth_token", token);
  sessionStorage.setItem("user_role", role);
  sessionStorage.removeItem("mfa_pending");
}

/**
 * Returns true if user is currently authenticated
 */
export function isAuthenticated() {
  return !!sessionStorage.getItem("auth_token");
}

/**
 * Returns current user's role
 */
export function getUserRole() {
  return sessionStorage.getItem("user_role") || null;
}

export default api;