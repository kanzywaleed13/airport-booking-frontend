import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  validateAirportCode,
  validateTravelDate,
  validatePassengerCount,
  runValidators,
} from "../utils/validators";

const s = {
  page: { minHeight: "100vh", background: "#0a0f1e", fontFamily: "sans-serif" },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    borderBottom: "0.5px solid #1f2a3c",
    background: "#0d1220",
  },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoIcon: {
    width: "28px",
    height: "28px",
    background: "#c8a96e",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navLogoText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#c8a96e",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: {
    fontSize: "13px",
    color: "#7a8099",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
  navLinkActive: { color: "#c8a96e" },
  logoutBtn: {
    fontSize: "12px",
    color: "#7a8099",
    background: "none",
    border: "0.5px solid #1f2a3c",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
  hero: { padding: "2.5rem 2rem 1.5rem", maxWidth: "860px", margin: "0 auto" },
  heroLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#c8a96e",
    marginBottom: "8px",
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "400",
    color: "#f0ebe0",
    lineHeight: "1.2",
    marginBottom: "1.75rem",
    fontFamily: "Georgia, serif",
  },
  heroTitleItalic: { fontStyle: "italic", color: "#c8a96e" },
  searchCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr 1fr 100px auto",
    gap: "10px",
    alignItems: "end",
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "5px" },
  label: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#7a8099",
  },
  input: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#f0ebe0",
    outline: "none",
    fontFamily: "sans-serif",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  inputError: { borderColor: "#7f1d1d" },
  inputFocus: { borderColor: "#c8a96e" },
  errorMsg: { fontSize: "11px", color: "#f87171", marginTop: "2px" },
  swapBtn: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    alignSelf: "end",
  },
  searchBtn: {
    background: "#c8a96e",
    color: "#0a0f1e",
    border: "none",
    borderRadius: "8px",
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    height: "36px",
    whiteSpace: "nowrap",
  },
  alertBox: {
    background: "#2a0f0f",
    border: "0.5px solid #7f1d1d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f87171",
    marginTop: "1rem",
  },
  resultsSection: { maxWidth: "860px", margin: "0 auto", padding: "0 2rem 3rem" },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  resultsTitle: { fontSize: "13px", fontWeight: "500", color: "#f0ebe0" },
  resultsMeta: { fontSize: "12px", color: "#7a8099" },
  flightCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "12px",
    padding: "1.1rem 1.3rem",
    marginBottom: "9px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto",
    alignItems: "center",
    gap: "1rem",
  },
  flightTime: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#f0ebe0",
    fontFamily: "Georgia, serif",
  },
  flightCode: { fontSize: "11px", color: "#7a8099", marginTop: "2px" },
  flightMid: { textAlign: "center", minWidth: "90px" },
  flightDuration: { fontSize: "11px", color: "#7a8099", marginBottom: "4px" },
  flightLine: { display: "flex", alignItems: "center", gap: "5px" },
  flightDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#c8a96e",
    flexShrink: 0,
  },
  flightLineDash: { flex: 1, height: "0.5px", background: "#2a3550" },
  flightStop: { fontSize: "11px", color: "#7a8099", marginTop: "3px" },
  flightRight: { textAlign: "right" },
  flightPrice: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#c8a96e",
    fontFamily: "Georgia, serif",
  },
  flightAirline: { fontSize: "11px", color: "#7a8099", marginBottom: "4px" },
  bookBtn: {
    background: "none",
    border: "0.5px solid #c8a96e",
    borderRadius: "7px",
    color: "#c8a96e",
    fontSize: "11px",
    fontWeight: "600",
    padding: "6px 14px",
    cursor: "pointer",
    fontFamily: "sans-serif",
    display: "block",
    marginTop: "7px",
  },
  badge: {
    display: "inline-block",
    background: "#0d1a0d",
    border: "0.5px solid #14291a",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: "10px",
    color: "#4ade80",
    marginTop: "3px",
  },
  emptyState: {
    textAlign: "center",
    padding: "2.5rem",
    color: "#7a8099",
    fontSize: "13px",
  },
  skeletonCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "12px",
    height: "80px",
    marginBottom: "9px",
    opacity: 0.5,
  },
};

export default function SearchFlights() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === "from" || name === "to") {
      sanitized = value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
    }

    if (name === "passengers") {
      sanitized = value.replace(/\D/g, "").slice(0, 1);
    }

    setForm((prev) => ({ ...prev, [name]: sanitized }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setServerError("");
  };

  const handleSwap = () => {
    setForm((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
    setErrors((prev) => ({ ...prev, from: "", to: "" }));
  };

  const validateForm = () =>
    runValidators({
      from: [form.from, (v) => validateAirportCode(v, "Departure airport")],
      to: [form.to, (v) => validateAirportCode(v, "Destination airport")],
      date: [form.date, validateTravelDate],
      passengers: [form.passengers, validatePassengerCount],
    });

  const handleSearch = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (form.from === form.to) {
      setErrors({ to: "Destination must differ from departure." });
      return;
    }

    setLoading(true);
    setServerError("");
    setSearched(true);

    try {
      const flightsRef = collection(db, "flights");
      const q = query(
        flightsRef,
        where("from", "==", form.from),
        where("to", "==", form.to)
      );

      const querySnapshot = await getDocs(q);
      const flightData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setResults(flightData);
    } catch (err) {
      console.error("Firebase Error:", err);
      setServerError("Could not fetch flights. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight) => {
    sessionStorage.setItem(
      "selected_flight",
      JSON.stringify({
        id: flight.id,
        from: flight.from,
        to: flight.to,
        dep: flight.dep,
        arr: flight.arr,
        date: form.date,
        passengers: form.passengers,
        price: flight.price,
        airline: flight.airline,
      })
    );
    navigate("/booking");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const getInputStyle = (field) => ({
    ...s.input,
    ...(errors[field] ? s.inputError : {}),
    ...(focused === field && !errors[field] ? s.inputFocus : {}),
  });

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoIcon}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L18 7V13L10 18L2 13V7L10 2Z"
                stroke="#0a0f1e"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M6 10H14M10 6V14"
                stroke="#0a0f1e"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span style={s.navLogoText}>AeroSecure</span>
        </div>

        <div style={s.navRight}>
          <button type="button" style={{ ...s.navLink, ...s.navLinkActive }}>
            Search flights
          </button>
          <button
            type="button"
            style={s.navLink}
            onClick={() => navigate("/my-bookings")}
          >
            My bookings
          </button>
          <button type="button" style={s.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={s.hero}>
        <p style={s.heroLabel}>Flight search</p>
        <h1 style={s.heroTitle}>
          Where are you <span style={s.heroTitleItalic}>flying</span> today?
        </h1>

        <div style={s.searchCard}>
          <form onSubmit={handleSearch} noValidate>
            <div style={s.searchGrid}>
              <div style={s.fieldWrap}>
                <label style={s.label}>From</label>
                <input
                  name="from"
                  value={form.from}
                  onChange={handleChange}
                  onFocus={() => setFocused("from")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("from")}
                  placeholder="CAI"
                  maxLength={3}
                  autoComplete="off"
                />
                {errors.from && <p style={s.errorMsg}>{errors.from}</p>}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <button type="button" style={s.swapBtn} onClick={handleSwap}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3"
                      stroke="#7a8099"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>To</label>
                <input
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  onFocus={() => setFocused("to")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("to")}
                  placeholder="LHR"
                  maxLength={3}
                  autoComplete="off"
                />
                {errors.to && <p style={s.errorMsg}>{errors.to}</p>}
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  onFocus={() => setFocused("date")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("date")}
                  min={today}
                  max={maxDateStr}
                />
                {errors.date && <p style={s.errorMsg}>{errors.date}</p>}
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Passengers</label>
                <input
                  type="number"
                  name="passengers"
                  value={form.passengers}
                  onChange={handleChange}
                  onFocus={() => setFocused("passengers")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("passengers")}
                  min={1}
                  max={9}
                  step={1}
                />
                {errors.passengers && (
                  <p style={s.errorMsg}>{errors.passengers}</p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <button type="submit" style={s.searchBtn} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {serverError && (
              <div style={s.alertBox} role="alert">
                {serverError}
              </div>
            )}
          </form>
        </div>
      </div>

      <div style={s.resultsSection}>
        {loading && [1, 2, 3].map((i) => <div key={i} style={s.skeletonCard} />)}

        {!loading && searched && results !== null && (
          <>
            <div style={s.resultsHeader}>
              <span style={s.resultsTitle}>
                {results.length} flight{results.length !== 1 ? "s" : ""} found
              </span>
              <span style={s.resultsMeta}>
                {form.from} → {form.to} · {form.date} · {form.passengers} pax
              </span>
            </div>

            {results.length === 0 ? (
              <div style={s.emptyState}>
                No flights found for this route and date.
              </div>
            ) : (
              results.map((flight) => (
                <div key={flight.id} style={s.flightCard}>
                  <div>
                    <div style={s.flightTime}>{flight.dep}</div>
                    <div style={s.flightCode}>{flight.from}</div>
                  </div>

                  <div style={s.flightMid}>
                    <div style={s.flightDuration}>{flight.duration}</div>
                    <div style={s.flightLine}>
                      <div style={s.flightDot} />
                      <div style={s.flightLineDash} />
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2 8H14M14 8L9 3M14 8L9 13"
                          stroke="#c8a96e"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div style={s.flightStop}>{flight.stops}</div>
                  </div>

                  <div>
                    <div style={s.flightTime}>{flight.arr}</div>
                    <div style={s.flightCode}>{flight.to}</div>
                  </div>

                  <div style={s.flightRight}>
                    <div style={s.flightAirline}>{flight.airline}</div>
                    <div style={s.flightPrice}>${flight.price}</div>
                    {flight.seats <= 5 && (
                      <div style={s.badge}>Only {flight.seats} seats left</div>
                    )}
                    <button
                      type="button"
                      style={s.bookBtn}
                      onClick={() => handleBook(flight)}
                    >
                      Select flight
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {!loading && !searched && (
          <div style={s.emptyState}>
            Enter your route above to search for available flights.
          </div>
        )}
      </div>
    </div>
  );
}
