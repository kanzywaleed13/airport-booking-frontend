import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user ? "authenticated" : "unauthenticated");
    });

    return () => unsubscribe();
  }, []);

  if (authState === "loading") return null;
  if (authState === "unauthenticated") return <Navigate to="/login" replace />;

  return children;
}