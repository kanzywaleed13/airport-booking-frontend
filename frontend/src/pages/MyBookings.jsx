import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

const s = {
  page: { minHeight: "100vh", background: "#0a0f1e", fontFamily: "sans-serif" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 2rem", borderBottom: "0.5px solid #1f2a3c", background: "#0d1220",
  },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoIcon: { width: "28px", height: "28px", background: "#c8a96e", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" },
  navLogoText: { fontSize: "13px", fontWeight: "600", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: { fontSize: "13px", color: "#7a8099", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif" },
  navLinkActive: { color: "#c8a96e" },
  logoutBtn: { fontSize: "12px", color: "#7a8099", background: "none", border: "0.5px solid #1f2a3c", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontFamily: "sans-serif" },
  body: { maxWidth: "800px", margin: "0 auto", padding: "2.5rem 2rem" },
  heroLabel: { fontSize: "11px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#c8a96e", marginBottom: "10px" },
  heroTitle: { fontSize: "28px", fontWeight: "400", color: "#f0ebe0", fontFamily: "Georgia, serif", marginBottom: "2rem" },
  alertBox: { background: "#2a0f0f", border: "0.5px solid #7f1d1d", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem" },
  bookingCard: { background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "14px", padding: "1.5rem", marginBottom: "12px" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  refRow: { display: "flex", alignItems: "center", gap: "10px" },
  refLabel: { fontSize: "11px", color: "#7a8099", letterSpacing: "1px", textTransform: "uppercase" },
  refVal: { fontSize: "14px", fontWeight: "500", color: "#c8a96e", fontFamily: "Georgia, serif", letterSpacing: "1px" },
  statusBadge: (status) => ({
    fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "4px",
    ...(status === "confirmed"
      ? { background: "#0d1a0d", border: "0.5px solid #14291a", color: "#4ade80" }
      : status === "cancelled"
      ? { background: "#2a0f0f", border: "0.5px solid #7f1d1d", color: "#f87171" }
      : { background: "#1a1507", border: "0.5px solid #2a2208", color: "#c8a96e" }),
  }),
  routeRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" },
  routeCode: { fontSize: "22px", fontWeight: "500", color: "#f0ebe0", fontFamily: "Georgia, serif" },
  routeMeta: { fontSize: "12px", color: "#7a8099", lineHeight: "1.8" },
  routeMetaVal: { color: "#f0ebe0" },
  cardBottom: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "0.5px solid #1f2a3c" },
  totalLabel: { fontSize: "12px", color: "#7a8099" },
  totalVal: { fontSize: "18px", fontWeight: "500", color: "#c8a96e", fontFamily: "Georgia, serif" },
  cancelBtn: { fontSize: "12px", color: "#f87171", background: "none", border: "0.5px solid #7f1d1d", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontFamily: "sans-serif" },
  emptyState: { textAlign: "center", padding: "4rem 2rem", color: "#7a8099", fontSize: "14px" },
  emptyIcon: { width: "48px", height: "48px", background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" },
  emptyTitle: { color: "#f0ebe0", fontSize: "16px", fontWeight: "500", marginBottom: "8px", fontFamily: "Georgia, serif" },
  searchBtn: { background: "#c8a96e", color: "#0a0f1e", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "sans-serif", marginTop: "1.25rem" },
  skeletonCard: { background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "14px", height: "140px", marginBottom: "12px", opacity: 0.5 },
  confirmOverlay: {
    position: "absolute", inset: 0, background: "rgba(10,15,30,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px",
  },
  confirmBox: { background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "12px", padding: "1.5rem", width: "300px", textAlign: "center" },
  confirmTitle: { fontSize: "15px", fontWeight: "500", color: "#f0ebe0", marginBottom: "8px", fontFamily: "Georgia, serif" },
  confirmSub: { fontSize: "13px", color: "#7a8099", marginBottom: "1.25rem", lineHeight: "1.5" },
  confirmBtns: { display: "flex", gap: "10px" },
  confirmYes: { flex: 1, background: "#7f1d1d", color: "#f87171", border: "0.5px solid #7f1d1d", borderRadius: "7px", padding: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "sans-serif" },
  confirmNo: { flex: 1, background: "none", color: "#7a8099", border: "0.5px solid #1f2a3c", borderRadius: "7px", padding: "9px", fontSize: "13px", cursor: "pointer", fontFamily: "sans-serif" },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const bookingRef = doc(db, "bookings", cancelTarget);
      await updateDoc(bookingRef, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) => b.id === cancelTarget ? { ...b, status: "cancelled" } : b)
      );
    } catch (err) {
      setError("Could not cancel booking. Please try again.");
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  // Fixed: uses Firebase signOut instead of just clearing sessionStorage
  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoIcon}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#0a0f1e" strokeWidth="1.5" fill="none"/>
              <path d="M6 10H14M10 6V14" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={s.navLogoText}>AeroSecure</span>
        </div>
        <div style={s.navRight}>
          <button style={s.navLink} onClick={() => navigate("/search")}>Search flights</button>
          <button style={{ ...s.navLink, ...s.navLinkActive }}>My bookings</button>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div style={s.body}>
        <p style={s.heroLabel}>My bookings</p>
        <h1 style={s.heroTitle}>Your travel history</h1>

        {error && <div style={s.alertBox} role="alert">{error}</div>}
        {loading && [1, 2, 3].map((i) => <div key={i} style={s.skeletonCard} />)}

        {!loading && bookings.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V12Z" stroke="#7a8099" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={s.emptyTitle}>No bookings yet</p>
            <p>You haven't made any bookings. Search for a flight to get started.</p>
            <button style={s.searchBtn} onClick={() => navigate("/search")}>Search flights</button>
          </div>
        )}

        {!loading && bookings.map((booking) => (
          <div key={booking.id} style={{ position: "relative" }}>
            <div style={s.bookingCard}>
              <div style={s.cardTop}>
                <div style={s.refRow}>
                  <span style={s.refLabel}>Ref</span>
                  <span style={s.refVal}>{booking.reference}</span>
                </div>
                <span style={s.statusBadge(booking.status)}>{booking.status}</span>
              </div>
              <div style={s.routeRow}>
                <span style={s.routeCode}>{booking.from}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={s.routeCode}>{booking.to}</span>
              </div>
              <div style={s.routeMeta}>
                <span>Date </span><span style={s.routeMetaVal}>{booking.date}</span>
                {"  ·  "}
                <span>Departs </span><span style={s.routeMetaVal}>{booking.dep}</span>
                {"  ·  "}
                <span>Passengers </span><span style={s.routeMetaVal}>{booking.passengers}</span>
                {"  ·  "}
                <span>Airline </span><span style={s.routeMetaVal}>{booking.airline}</span>
              </div>
              <div style={s.cardBottom}>
                <div>
                  <div style={s.totalLabel}>Total paid</div>
                  <div style={s.totalVal}>${booking.total}</div>
                </div>
                {booking.status === "confirmed" && (
                  <button style={s.cancelBtn} onClick={() => setCancelTarget(booking.id)}>
                    Cancel booking
                  </button>
                )}
              </div>
            </div>

            {cancelTarget === booking.id && (
              <div style={s.confirmOverlay}>
                <div style={s.confirmBox}>
                  <p style={s.confirmTitle}>Cancel this booking?</p>
                  <p style={s.confirmSub}>
                    Ref: <strong style={{ color: "#c8a96e" }}>{booking.reference}</strong>
                    <br />This action cannot be undone.
                  </p>
                  <div style={s.confirmBtns}>
                    <button style={s.confirmYes} onClick={handleCancelConfirm} disabled={cancelling}>
                      {cancelling ? "Cancelling..." : "Yes, cancel"}
                    </button>
                    <button style={s.confirmNo} onClick={() => setCancelTarget(null)}>
                      Keep booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}