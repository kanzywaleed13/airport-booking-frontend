import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  validateCityOrAirportCode,
  validateTravelDate,
  validatePassengerCount,
  runValidators,
} from "../utils/validators";

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    borderBottom: "0.5px solid #1f2a3c",
    background: "#0d1220",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
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
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  navLink: {
    fontSize: "13px",
    color: "#7a8099",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
  navLinkActive: {
    color: "#c8a96e",
  },
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
  hero: {
    padding: "3rem 2rem 2rem",
    maxWidth: "860px",
    margin: "0 auto",
  },
  heroLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#c8a96e",
    marginBottom: "10px",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "400",
    color: "#f0ebe0",
    lineHeight: "1.2",
    marginBottom: "2rem",
    fontFamily: "Georgia, serif",
  },
  heroTitleItalic: {
    fontStyle: "italic",
    color: "#c8a96e",
  },
  searchCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "1.75rem",
    marginBottom: "2rem",
  },
  searchGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
    gap: "12px",
    alignItems: "end",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
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
  inputError: {
    borderColor: "#7f1d1d",
  },
  inputFocus: {
    borderColor: "#c8a96e",
  },
  errorMsg: {
    fontSize: "11px",
    color: "#f87171",
    marginTop: "2px",
  },
  swapBtn: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    alignSelf: "end",
    flexShrink: 0,
  },
  searchBtn: {
    background: "#c8a96e",
    color: "#0a0f1e",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
    height: "38px",
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
  resultsSection: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "0 2rem 3rem",
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  resultsTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#f0ebe0",
  },
  resultsMeta: {
    fontSize: "12px",
    color: "#7a8099",
  },
  flightCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    marginBottom: "10px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto",
    alignItems: "center",
    gap: "1rem",
  },
  flightTime: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#f0ebe0",
    fontFamily: "Georgia, serif",
  },
  flightCode: {
    fontSize: "12px",
    color: "#7a8099",
    marginTop: "2px",
  },
  flightMid: {
    textAlign: "center",
  },
  flightDuration: {
    fontSize: "11px",
    color: "#7a8099",
    marginBottom: "4px",
  },
  flightLine: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  flightLineDash: {
    flex: 1,
    height: "0.5px",
    background: "#2a3550",
  },
  flightDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#c8a96e",
    flexShrink: 0,
  },
  flightStop: {
    fontSize: "11px",
    color: "#7a8099",
    marginTop: "4px",
  },
  flightRight: {
    textAlign: "right",
  },
  flightPrice: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#c8a96e",
    fontFamily: "Georgia, serif",
  },
  flightAirline: {
    fontSize: "12px",
    color: "#7a8099",
    marginBottom: "8px",
  },
  bookBtn: {
    background: "none",
    border: "0.5px solid #c8a96e",
    borderRadius: "7px",
    color: "#c8a96e",
    fontSize: "12px",
    fontWeight: "600",
    padding: "7px 16px",
    cursor: "pointer",
    fontFamily: "sans-serif",
    letterSpacing: "0.5px",
    display: "block",
    marginTop: "8px",
  },
  badge: {
    display: "inline-block",
    background: "#0d1a0d",
    border: "0.5px solid #14291a",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "10px",
    color: "#4ade80",
    marginTop: "4px",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#7a8099",
    fontSize: "14px",
  },
  skeletonCard: {
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    marginBottom: "10px",
    height: "80px",
    animation: "pulse 1.5s infinite",
  },
};

// ─── Mock flight data (replace with real API call) ─────────────────────────
const MOCK_FLIGHTS = [
  { id: "FL001", airline: "EgyptAir", from: "CAI", to: "LHR", dep: "08:00", arr: "13:30", duration: "5h 30m", stops: "Nonstop", price: 420, seats: 12 },
  { id: "FL002", airline: "British Airways", from: "CAI", to: "LHR", dep: "11:45", arr: "18:20", duration: "6h 35m", stops: "1 stop", price: 310, seats: 4 },
  { id: "FL003", airline: "Lufthansa", from: "CAI", to: "LHR", dep: "15:10", arr: "22:00", duration: "6h 50m", stops: "1 stop", price: 285, seats: 9 },
];

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
    // Allow letters, spaces, hyphens for city names or airport codes; cap at 30 chars
    if (name === "from" || name === "to") {
      sanitized = value.replace(/[^a-zA-Z\s-]/g, "").replace(/\s+/g, " ").slice(0, 30);
    }
    // Cap passenger input
    if (name === "passengers") {
      sanitized = value.replace(/\D/g, "").slice(0, 1);
    }
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSwap = () => {
    setForm((prev) => ({ ...prev, from: prev.to, to: prev.from }));
    setErrors((prev) => ({ ...prev, from: "", to: "" }));
  };

  const validate = () =>
    runValidators({
      from: [form.from, (v) => validateCityOrAirportCode(v, "Departure")],
      to: [form.to, (v) => validateCityOrAirportCode(v, "Destination")],
      date: [form.date, validateTravelDate],
      passengers: [form.passengers, validatePassengerCount],
    });

  const handleSearch = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
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
      const response = await api.get("/flights/search", {
        params: {
          from: form.from,
          to: form.to,
          date: form.date,
          passengers: parseInt(form.passengers, 10),
        },
      });
      setResults(response.data.data || []);
    } catch (err) {
      // Use mock data if API not ready yet
      setResults(MOCK_FLIGHTS);
      // Uncomment below when backend is ready:
      // setServerError("Could not fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight) => {
    // Pass flight data via sessionStorage — never via URL params
    sessionStorage.setItem("selected_flight", JSON.stringify({
      id: flight.id,
      from: flight.from,
      to: flight.to,
      dep: flight.dep,
      arr: flight.arr,
      date: form.date,
      passengers: form.passengers,
      price: flight.price,
      airline: flight.airline,
    }));
    navigate("/booking");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getInputStyle = (field) => ({
    ...s.input,
    ...(errors[field] ? s.inputError : {}),
    ...(focused === field && !errors[field] ? s.inputFocus : {}),
  });

  // Get today's date in YYYY-MM-DD for min date attribute
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div style={s.page}>
      {/* Navbar */}
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
          <button style={{ ...s.navLink, ...s.navLinkActive }}>Search flights</button>
          <button style={s.navLink} onClick={() => navigate("/my-bookings")}>My bookings</button>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* Hero + Search form */}
      <div style={s.hero}>
        <p style={s.heroLabel}>Flight search</p>
        <h1 style={s.heroTitle}>
          Where are you<br />
          <span style={s.heroTitleItalic}>flying</span> today?
        </h1>

        <div style={s.searchCard}>
          <form onSubmit={handleSearch} noValidate>
            <div style={s.searchGrid}>

              {/* From */}
              <div style={s.fieldWrap}>
                <label style={s.label}>From</label>
                <input
                  name="from"
                  value={form.from}
                  onChange={handleChange}
                  onFocus={() => setFocused("from")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("from")}
                  placeholder="CAI or Cairo"
                  maxLength={30}
                  autoComplete="off"
                />
                {errors.from && <p style={s.errorMsg}>{errors.from}</p>}
              </div>

              {/* Swap button */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <button type="button" style={s.swapBtn} onClick={handleSwap} aria-label="Swap airports">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3" stroke="#7a8099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* To */}
              <div style={s.fieldWrap}>
                <label style={s.label}>To</label>
                <input
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  onFocus={() => setFocused("to")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("to")}
                  placeholder="LHR or London"
                  maxLength={30}
                  autoComplete="off"
                />
                {errors.to && <p style={s.errorMsg}>{errors.to}</p>}
              </div>

              {/* Date */}
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

              {/* Passengers */}
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
                {errors.passengers && <p style={s.errorMsg}>{errors.passengers}</p>}
              </div>

              {/* Search button */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <button type="submit" style={s.searchBtn} disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

            </div>

            {serverError && (
              <div style={s.alertBox} role="alert">{serverError}</div>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div style={s.resultsSection}>
        {loading && (
          <>
            {[1, 2, 3].map((i) => <div key={i} style={s.skeletonCard} />)}
          </>
        )}

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
              <div style={s.emptyState}>No flights found for this route and date.</div>
            ) : (
              results.map((flight) => (
                <div key={flight.id} style={s.flightCard}>
                  {/* Departure */}
                  <div>
                    <div style={s.flightTime}>{flight.dep}</div>
                    <div style={s.flightCode}>{flight.from}</div>
                  </div>

                  {/* Route line */}
                  <div style={s.flightMid}>
                    <div style={s.flightDuration}>{flight.duration}</div>
                    <div style={s.flightLine}>
                      <div style={s.flightDot} />
                      <div style={s.flightLineDash} />
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={s.flightStop}>{flight.stops}</div>
                  </div>

                  {/* Arrival */}
                  <div>
                    <div style={s.flightTime}>{flight.arr}</div>
                    <div style={s.flightCode}>{flight.to}</div>
                  </div>

                  {/* Price + Book */}
                  <div style={s.flightRight}>
                    <div style={s.flightAirline}>{flight.airline}</div>
                    <div style={s.flightPrice}>${flight.price}</div>
                    {flight.seats <= 5 && (
                      <div style={s.badge}>Only {flight.seats} seats left</div>
                    )}
                    <button style={s.bookBtn} onClick={() => handleBook(flight)}>
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