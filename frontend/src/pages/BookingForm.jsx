import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassportNumber,
  runValidators,
} from "../utils/validators";

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#0a0f1e", fontFamily: "sans-serif" },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 2rem", borderBottom: "0.5px solid #1f2a3c", background: "#0d1220",
  },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoIcon: {
    width: "28px", height: "28px", background: "#c8a96e",
    borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  navLogoText: { fontSize: "13px", fontWeight: "600", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navLink: { fontSize: "13px", color: "#7a8099", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif" },
  logoutBtn: {
    fontSize: "12px", color: "#7a8099", background: "none",
    border: "0.5px solid #1f2a3c", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontFamily: "sans-serif",
  },
  body: { maxWidth: "900px", margin: "0 auto", padding: "2.5rem 2rem" },
  backBtn: {
    display: "flex", alignItems: "center", gap: "6px", background: "none",
    border: "none", color: "#7a8099", fontSize: "13px", cursor: "pointer",
    padding: "0", marginBottom: "1.75rem", fontFamily: "sans-serif",
  },
  pageTitle: { fontSize: "28px", fontWeight: "400", color: "#f0ebe0", fontFamily: "Georgia, serif", marginBottom: "4px" },
  pageSub: { fontSize: "13px", color: "#7a8099", marginBottom: "2rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" },
  formCard: { background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "16px", padding: "1.75rem" },
  sectionTitle: {
    fontSize: "11px", fontWeight: "600", letterSpacing: "2px",
    textTransform: "uppercase", color: "#c8a96e", marginBottom: "1.25rem",
  },
  divider: { height: "0.5px", background: "#1f2a3c", margin: "1.5rem 0" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
  grid1: { marginBottom: "12px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a8099" },
  input: {
    background: "#0d1525", border: "0.5px solid #1f2a3c", borderRadius: "8px",
    padding: "10px 12px", fontSize: "14px", color: "#f0ebe0", outline: "none",
    fontFamily: "sans-serif", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
  },
  inputError: { borderColor: "#7f1d1d" },
  inputFocus: { borderColor: "#c8a96e" },
  errorMsg: { fontSize: "11px", color: "#f87171", marginTop: "2px" },
  select: {
    background: "#0d1525", border: "0.5px solid #1f2a3c", borderRadius: "8px",
    padding: "10px 12px", fontSize: "14px", color: "#f0ebe0", outline: "none",
    fontFamily: "sans-serif", width: "100%", boxSizing: "border-box",
  },
  alertBox: {
    background: "#2a0f0f", border: "0.5px solid #7f1d1d", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%", background: "#c8a96e", color: "#0a0f1e", border: "none",
    borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", letterSpacing: "0.5px", fontFamily: "sans-serif", marginTop: "1.5rem",
  },
  submitDisabled: { opacity: 0.45, cursor: "not-allowed" },
  sideCard: { background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "16px", padding: "1.5rem" },
  sideTitle: { fontSize: "11px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#c8a96e", marginBottom: "1.25rem" },
  flightRoute: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" },
  flightCode: { fontSize: "20px", fontWeight: "500", color: "#f0ebe0", fontFamily: "Georgia, serif" },
  flightArrow: { color: "#c8a96e", fontSize: "16px" },
  flightMeta: { fontSize: "12px", color: "#7a8099", lineHeight: "1.8" },
  flightMetaVal: { color: "#f0ebe0" },
  priceLine: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "0.5px solid #1f2a3c" },
  priceLabel: { fontSize: "12px", color: "#7a8099" },
  priceVal: { fontSize: "12px", color: "#f0ebe0" },
  priceTotalLine: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "0.5px solid #2a3550" },
  priceTotalLabel: { fontSize: "13px", fontWeight: "500", color: "#f0ebe0" },
  priceTotalVal: { fontSize: "20px", fontWeight: "500", color: "#c8a96e", fontFamily: "Georgia, serif" },
  securityNote: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px",
    background: "#0d1a0d", border: "0.5px solid #14291a", borderRadius: "8px",
    fontSize: "11px", color: "#4ade80", marginTop: "1.25rem",
  },
  secDot: { width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 },
  passengerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "1.25rem",
  },
  passengerBadge: {
    fontSize: "11px", color: "#c8a96e", background: "#1a1507",
    border: "0.5px solid #2a2208", borderRadius: "4px", padding: "3px 8px",
  },
  successOverlay: {
    minHeight: "100vh", background: "#0a0f1e", display: "flex",
    alignItems: "center", justifyContent: "center", flexDirection: "column",
    gap: "1rem", padding: "2rem",
  },
  successIcon: {
    width: "64px", height: "64px", background: "#0d1a0d",
    border: "0.5px solid #14291a", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem",
  },
  successTitle: { fontSize: "28px", fontWeight: "400", color: "#f0ebe0", fontFamily: "Georgia, serif", textAlign: "center" },
  successSub: { fontSize: "14px", color: "#7a8099", textAlign: "center", maxWidth: "360px", lineHeight: "1.6" },
  successRef: { fontSize: "20px", fontWeight: "500", color: "#c8a96e", fontFamily: "Georgia, serif", letterSpacing: "2px" },
  successBtn: {
    background: "#c8a96e", color: "#0a0f1e", border: "none", borderRadius: "8px",
    padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
    fontFamily: "sans-serif", marginTop: "1rem",
  },
};

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

export default function BookingForm() {
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState(null);

  // Load flight from sessionStorage — never from URL
  useEffect(() => {
    const raw = sessionStorage.getItem("selected_flight");
    if (!raw) { navigate("/search"); return; }
    try {
      const f = JSON.parse(raw);
      setFlight(f);
      // Build one passenger form per seat count
      const count = parseInt(f.passengers, 10) || 1;
      setPassengers(
        Array.from({ length: count }, () => ({
          title: "Mr", firstName: "", lastName: "", email: "", phone: "", passport: "",
        }))
      );
    } catch {
      navigate("/search");
    }
  }, [navigate]);

  const updatePassenger = (index, field, value) => {
    // Sanitize per field type
    let sanitized = value;
    if (field === "firstName" || field === "lastName") {
      sanitized = value.replace(/[^a-zA-Z\s'\-]/g, "").slice(0, 50);
    }
    if (field === "passport") {
      sanitized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 20);
    }
    if (field === "phone") {
      sanitized = value.replace(/[^0-9+]/g, "").slice(0, 15);
    }
    if (field === "email") {
      sanitized = value.slice(0, 254);
    }
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: sanitized };
    setPassengers(updated);
    // Clear field-specific error
    const key = `${index}_${field}`;
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    passengers.forEach((p, i) => {
      const nameResult = validateFullName(`${p.firstName} ${p.lastName}`.trim());
      if (!p.firstName.trim()) errs[`${i}_firstName`] = "First name is required.";
      else if (!/^[a-zA-Z\s'\-]{2,}$/.test(p.firstName.trim())) errs[`${i}_firstName`] = "Letters only.";
      if (!p.lastName.trim()) errs[`${i}_lastName`] = "Last name is required.";
      else if (!/^[a-zA-Z\s'\-]{2,}$/.test(p.lastName.trim())) errs[`${i}_lastName`] = "Letters only.";
      const emailR = validateEmail(p.email);
      if (!emailR.valid) errs[`${i}_email`] = emailR.message;
      const phoneR = validatePhone(p.phone);
      if (!phoneR.valid) errs[`${i}_phone`] = phoneR.message;
      const passR = validatePassportNumber(p.passport);
      if (!passR.valid) errs[`${i}_passport`] = passR.message;
    });
    return errs;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      const response = await api.post("/bookings", {
        flightId: flight.id,
        date: flight.date,
        passengers: passengers.map((p) => ({
          title: p.title,
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          email: p.email.trim(),
          phone: p.phone.trim(),
          passport: p.passport.trim(),
          // Note: passport is encrypted server-side with AES-256 (backend responsibility)
        })),
      });
      if (response.data.success) {
        setBookingRef(response.data.data.bookingReference);
        sessionStorage.removeItem("selected_flight");
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) setServerError("Please check your details and try again.");
      else if (status === 409) setServerError("This flight is now fully booked. Please choose another.");
      else setServerError("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (key) => ({
    ...s.input,
    ...(errors[key] ? s.inputError : {}),
    ...(focused === key && !errors[key] ? s.inputFocus : {}),
  });

  const handleLogout = () => { sessionStorage.clear(); navigate("/login"); };

  // ── Success screen ──────────────────────────────────────────────────────
  if (bookingRef) {
    return (
      <div style={s.successOverlay}>
        <div style={s.successIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={s.successTitle}>Booking confirmed</h1>
        <p style={s.successSub}>Your booking reference is:</p>
        <p style={s.successRef}>{bookingRef}</p>
        <p style={s.successSub}>Save this reference. You'll need it to manage your booking or check in.</p>
        <button style={s.successBtn} onClick={() => navigate("/my-bookings")}>View my bookings</button>
      </div>
    );
  }

  if (!flight) return null;

  const totalPrice = flight.price * parseInt(flight.passengers, 10);
  const taxes = Math.round(totalPrice * 0.12);
  const grandTotal = totalPrice + taxes;

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
          <button style={s.navLink} onClick={() => navigate("/search")}>Search flights</button>
          <button style={s.navLink} onClick={() => navigate("/my-bookings")}>My bookings</button>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div style={s.body}>
        {/* Back */}
        <button style={s.backBtn} onClick={() => navigate("/search")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#7a8099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to search
        </button>

        <h1 style={s.pageTitle}>Passenger details</h1>
        <p style={s.pageSub}>Fill in details exactly as they appear on your passport.</p>

        <div style={s.layout}>
          {/* Left — passenger forms */}
          <div>
            {serverError && <div style={s.alertBox} role="alert">{serverError}</div>}

            {passengers.map((p, i) => (
              <div key={i} style={{ ...s.formCard, marginBottom: "12px" }}>
                <div style={s.passengerHeader}>
                  <p style={s.sectionTitle}>Passenger {i + 1}</p>
                  {passengers.length > 1 && (
                    <span style={s.passengerBadge}>{i + 1} of {passengers.length}</span>
                  )}
                </div>

                {/* Title + First name + Last name */}
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Title</label>
                    <select
                      value={p.title}
                      onChange={(e) => updatePassenger(i, "title", e.target.value)}
                      style={s.select}
                    >
                      {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>First name</label>
                    <input
                      value={p.firstName}
                      onChange={(e) => updatePassenger(i, "firstName", e.target.value)}
                      onFocus={() => setFocused(`${i}_firstName`)}
                      onBlur={() => setFocused(null)}
                      style={getInputStyle(`${i}_firstName`)}
                      placeholder="As on passport"
                      maxLength={50}
                      autoComplete="given-name"
                    />
                    {errors[`${i}_firstName`] && <p style={s.errorMsg}>{errors[`${i}_firstName`]}</p>}
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Last name</label>
                    <input
                      value={p.lastName}
                      onChange={(e) => updatePassenger(i, "lastName", e.target.value)}
                      onFocus={() => setFocused(`${i}_lastName`)}
                      onBlur={() => setFocused(null)}
                      style={getInputStyle(`${i}_lastName`)}
                      placeholder="As on passport"
                      maxLength={50}
                      autoComplete="family-name"
                    />
                    {errors[`${i}_lastName`] && <p style={s.errorMsg}>{errors[`${i}_lastName`]}</p>}
                  </div>
                </div>

                {/* Email + Phone */}
                <div style={s.grid2}>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Email</label>
                    <input
                      type="email"
                      value={p.email}
                      onChange={(e) => updatePassenger(i, "email", e.target.value)}
                      onFocus={() => setFocused(`${i}_email`)}
                      onBlur={() => setFocused(null)}
                      style={getInputStyle(`${i}_email`)}
                      placeholder="email@example.com"
                      maxLength={254}
                      autoComplete="email"
                    />
                    {errors[`${i}_email`] && <p style={s.errorMsg}>{errors[`${i}_email`]}</p>}
                  </div>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Phone</label>
                    <input
                      type="tel"
                      value={p.phone}
                      onChange={(e) => updatePassenger(i, "phone", e.target.value)}
                      onFocus={() => setFocused(`${i}_phone`)}
                      onBlur={() => setFocused(null)}
                      style={getInputStyle(`${i}_phone`)}
                      placeholder="+201234567890"
                      maxLength={15}
                      autoComplete="tel"
                    />
                    {errors[`${i}_phone`] && <p style={s.errorMsg}>{errors[`${i}_phone`]}</p>}
                  </div>
                </div>

                {/* Passport */}
                <div style={s.grid1}>
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Passport number</label>
                    <input
                      value={p.passport}
                      onChange={(e) => updatePassenger(i, "passport", e.target.value)}
                      onFocus={() => setFocused(`${i}_passport`)}
                      onBlur={() => setFocused(null)}
                      style={getInputStyle(`${i}_passport`)}
                      placeholder="e.g. A12345678"
                      maxLength={20}
                      autoComplete="off"
                    />
                    {errors[`${i}_passport`] && <p style={s.errorMsg}>{errors[`${i}_passport`]}</p>}
                    <p style={{ fontSize: "11px", color: "#3a4055", marginTop: "4px" }}>
                      Encrypted end-to-end. Never stored in plain text.
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Confirming booking..." : `Confirm booking · $${grandTotal}`}
            </button>
          </div>

          {/* Right — flight summary */}
          <div>
            <div style={s.sideCard}>
              <p style={s.sideTitle}>Flight summary</p>

              <div style={s.flightRoute}>
                <span style={s.flightCode}>{flight.from}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={s.flightCode}>{flight.to}</span>
              </div>

              <div style={s.flightMeta}>
                <div>Date <span style={s.flightMetaVal}>{flight.date}</span></div>
                <div>Departs <span style={s.flightMetaVal}>{flight.dep}</span></div>
                <div>Arrives <span style={s.flightMetaVal}>{flight.arr}</span></div>
                <div>Airline <span style={s.flightMetaVal}>{flight.airline}</span></div>
                <div>Passengers <span style={s.flightMetaVal}>{flight.passengers}</span></div>
              </div>

              <div style={s.divider} />

              <div style={s.priceLine}>
                <span style={s.priceLabel}>Base fare × {flight.passengers}</span>
                <span style={s.priceVal}>${totalPrice}</span>
              </div>
              <div style={s.priceLine}>
                <span style={s.priceLabel}>Taxes & fees</span>
                <span style={s.priceVal}>${taxes}</span>
              </div>
              <div style={s.priceTotalLine}>
                <span style={s.priceTotalLabel}>Total</span>
                <span style={s.priceTotalVal}>${grandTotal}</span>
              </div>
            </div>

            <div style={s.securityNote}>
              <div style={s.secDot} />
              <span>Passport data encrypted · TLS 1.3 · CSRF protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}