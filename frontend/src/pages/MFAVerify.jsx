import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { auth } from "../firebase";

// ─── EmailJS config ────────────────────────────────────────────────────────
// These must match EXACTLY what's in your .env file
const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_WAIT_S = 60;
const MAX_ATTEMPTS  = 5;

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateOTP() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

async function hashOTP(otp) {
  const encoded = new TextEncoder().encode(otp);
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Styles ────────────────────────────────────────────────────────────────

const st = {
  page: {
    minHeight: "100vh", background: "#0a0f1e",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2rem", fontFamily: "'Georgia', serif",
  },
  card: {
    width: "100%", maxWidth: "400px",
    background: "#111827", border: "0.5px solid #1f2a3c",
    borderRadius: "16px", padding: "2rem",
    boxSizing: "border-box",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" },
  logoIcon: { width: "26px", height: "26px", background: "#c8a96e", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontSize: "12px", fontWeight: "600", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" },
  title: { fontSize: "22px", color: "#f0ebe0", marginBottom: "0.4rem" },
  subtext: { fontSize: "13px", color: "#7a8099", lineHeight: "1.6", marginBottom: "1.5rem", fontFamily: "sans-serif" },
  emailHighlight: {
    color: "#c8a96e", fontFamily: "sans-serif", fontStyle: "normal",
    background: "#0d1525", border: "0.5px solid #1f2a3c",
    borderRadius: "5px", padding: "1px 7px", fontSize: "13px",
    display: "inline-block", marginTop: "3px", wordBreak: "break-all",
  },
  alertBox: { background: "#2a0f0f", border: "0.5px solid #7f1d1d", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem", fontFamily: "sans-serif" },
  successBox: { background: "#0d1a0d", border: "0.5px solid #14532d", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#4ade80", marginBottom: "1rem", fontFamily: "sans-serif" },
  warnBox: { background: "#1a1507", border: "0.5px solid #2a2208", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#c8a96e", marginBottom: "1rem", fontFamily: "sans-serif" },
  label: { display: "block", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a8099", marginBottom: "10px", fontFamily: "sans-serif" },
  // Fixed OTP row — 6 equal boxes that stay inside the card
  otpRow: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px",
    marginBottom: "8px",
    width: "100%",
    boxSizing: "border-box",
  },
  otpBox: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "10px 0",
    fontSize: "20px",
    color: "#f0ebe0",
    outline: "none",
    textAlign: "center",
    fontFamily: "sans-serif",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
  },
  otpBoxFocus:  { borderColor: "#c8a96e" },
  otpBoxError:  { borderColor: "#7f1d1d" },
  otpBoxFilled: { borderColor: "#2a3550" },
  helper: { fontSize: "11px", color: "#7a8099", fontFamily: "sans-serif", marginBottom: "1rem" },
  timerRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" },
  timerBar: { flex: 1, height: "3px", background: "#1f2a3c", borderRadius: "2px", overflow: "hidden" },
  timerFill: (pct, expired) => ({
    height: "100%", borderRadius: "2px",
    background: expired ? "#7f1d1d" : pct > 30 ? "#c8a96e" : "#f87171",
    width: `${pct}%`, transition: "width 1s linear",
  }),
  timerLabel: (expired) => ({
    fontSize: "11px", fontFamily: "sans-serif", minWidth: "40px",
    textAlign: "right", color: expired ? "#f87171" : "#7a8099",
  }),
  btn: (variant) => ({
    width: "100%", border: "none", borderRadius: "8px", padding: "12px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
    fontFamily: "sans-serif", marginBottom: "8px", transition: "opacity 0.2s",
    ...(variant === "primary"   ? { background: "#c8a96e", color: "#0a0f1e" } : {}),
    ...(variant === "outline"   ? { background: "transparent", color: "#c8a96e", border: "0.5px solid #c8a96e" } : {}),
    ...(variant === "secondary" ? { background: "transparent", color: "#7a8099", border: "0.5px solid #1f2a3c" } : {}),
  }),
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  attemptsWarn: { fontSize: "12px", color: "#f87171", fontFamily: "sans-serif", marginTop: "4px" },
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function MFAVerify() {
  const navigate = useNavigate();
  const [digits, setDigits]             = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft]         = useState(OTP_EXPIRY_MS);
  const [attempts, setAttempts]         = useState(0);
  const inputRefs = useRef([]);

  const email   = sessionStorage.getItem("otp_email") || "";
  const code    = digits.join("");
  const expired = timeLeft <= 0;
  const locked  = attempts >= MAX_ATTEMPTS;

  // Detect missing EmailJS config and warn early
  const configMissing = !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY;

  // ─── Countdown ──────────────────────────────────────────────────────────

  useEffect(() => {
    const expiry = parseInt(sessionStorage.getItem("otp_expiry") || "0", 10);
    if (!expiry) { navigate("/login"); return; }

    const tick = () => {
      const remaining = expiry - Date.now();
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(interval);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  // ─── Resend cooldown ────────────────────────────────────────────────────

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ─── Input handling ─────────────────────────────────────────────────────

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      const newDigits = Array(6).fill("").map((_, i) => pasted[i] || "");
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const clean = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
    if (error) setError("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Submit on Enter when code is complete
    if (e.key === "Enter" && code.length === 6) handleVerify();
  };

  // ─── Verify ─────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (code.length !== 6) { setError("Please enter the full 6-digit code."); return; }
    if (expired) { setError("This code has expired. Please request a new one."); return; }
    if (locked)  { setError("Too many incorrect attempts. Please request a new code."); return; }

    setLoading(true);
    setError("");

    try {
      const storedHash = sessionStorage.getItem("otp_hash");
      const inputHash  = await hashOTP(code);

      if (inputHash !== storedHash) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        if (newAttempts >= MAX_ATTEMPTS) {
          setError("Too many incorrect attempts. Please request a new code.");
          await signOut(auth);
        } else {
          setError(`Incorrect code — ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`);
        }
        return;
      }

      // ✅ Correct — clear everything and proceed
      sessionStorage.removeItem("otp_hash");
      sessionStorage.removeItem("otp_expiry");
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_pending");

      setSuccess("Verified! Redirecting...");
      setTimeout(() => navigate("/my-bookings"), 700);
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend ─────────────────────────────────────────────────────────────

  const sendOTPEmail = async (targetEmail) => {
    const otp    = generateOTP();
    const hash   = await hashOTP(otp);
    const expiry = Date.now() + OTP_EXPIRY_MS;

    sessionStorage.setItem("otp_hash",   hash);
    sessionStorage.setItem("otp_expiry", String(expiry));

    // Send via EmailJS
    // Template variables: {{to_email}}, {{otp_code}}, {{expires_in}}
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { to_email: targetEmail, otp_code: otp, expires_in: "10 minutes" },
      EMAILJS_PUBLIC_KEY
    );

    if (result.status !== 200) {
      throw new Error(`EmailJS returned status ${result.status}`);
    }

    return expiry;
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    if (!email) { setError("No email address found. Please log in again."); return; }

    setResendLoading(true);
    setError("");

    try {
      const newExpiry = await sendOTPEmail(email);
      setTimeLeft(OTP_EXPIRY_MS);
      setAttempts(0);
      setDigits(["", "", "", "", "", ""]);
      setResendCooldown(RESEND_WAIT_S);
      setSuccess("New code sent! Check your inbox (and spam folder).");
      setTimeout(() => setSuccess(""), 5000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("EmailJS resend error:", err);
      setError(
        configMissing
          ? "EmailJS is not configured. Check your .env file (REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, REACT_APP_EMAILJS_PUBLIC_KEY)."
          : `Could not send email: ${err.text || err.message || "Unknown error"}. Check the browser console for details.`
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    sessionStorage.removeItem("otp_hash");
    sessionStorage.removeItem("otp_expiry");
    sessionStorage.removeItem("otp_email");
    sessionStorage.removeItem("otp_pending");
    await signOut(auth);
    navigate("/login");
  };

  const timerPct     = (timeLeft / OTP_EXPIRY_MS) * 100;
  const mins         = Math.floor(timeLeft / 60000);
  const secs         = Math.floor((timeLeft % 60000) / 1000);
  const timerDisplay = expired ? "Expired" : `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div style={st.page}>
      <div style={st.card}>

        {/* Logo */}
        <div style={st.logoRow}>
          <div style={st.logoIcon}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#0a0f1e" strokeWidth="1.5" fill="none"/>
              <path d="M6 10H14M10 6V14" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={st.logoText}>AeroSecure</span>
        </div>

        <h1 style={st.title}>Check your email</h1>
        <p style={st.subtext}>
          We sent a 6-digit code to:<br/>
          <span style={st.emailHighlight}>{email || "—"}</span>
        </p>

        {/* Config warning shown in dev if .env keys are missing */}
        {configMissing && (
          <div style={st.warnBox}>
            ⚠️ EmailJS keys missing in .env — codes cannot be sent until configured.
            <br/>Check: REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, REACT_APP_EMAILJS_PUBLIC_KEY
          </div>
        )}

        {error   && <div style={st.alertBox}  role="alert">{error}</div>}
        {success && <div style={st.successBox} role="status">{success}</div>}
        {expired && !error && (
          <div style={st.alertBox} role="alert">Code expired — request a new one below.</div>
        )}

        {/* 6-digit input */}
        <label style={st.label}>Verification code</label>
        <div style={st.otpRow}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              style={{
                ...st.otpBox,
                ...(error ? st.otpBoxError : {}),
                ...(focusedIndex === i && !error ? st.otpBoxFocus : {}),
                ...(d && !error ? st.otpBoxFilled : {}),
              }}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              disabled={locked || loading}
            />
          ))}
        </div>
        <p style={st.helper}>Paste your code or type digit by digit. Check your spam folder too.</p>
        {locked && <p style={st.attemptsWarn}>Account locked — request a new code to continue.</p>}

        {/* Timer bar */}
        <div style={st.timerRow}>
          <div style={st.timerBar}>
            <div style={st.timerFill(timerPct, expired)} />
          </div>
          <span style={st.timerLabel(expired)}>{timerDisplay}</span>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || code.length !== 6 || expired || locked}
          style={{
            ...st.btn("primary"),
            ...((loading || code.length !== 6 || expired || locked) ? st.btnDisabled : {}),
          }}
        >
          {loading ? "Verifying..." : "Verify and continue"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendLoading}
          style={{
            ...st.btn("outline"),
            ...((resendCooldown > 0 || resendLoading) ? st.btnDisabled : {}),
          }}
        >
          {resendLoading
            ? "Sending..."
            : resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : "Resend code"}
        </button>

        <button type="button" onClick={handleBackToLogin} style={st.btn("secondary")}>
          Back to login
        </button>
      </div>
    </div>
  );
}
