import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { saveSession } from "../services/api";
import { validateMFACode } from "../utils/validators";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    padding: "2rem",
  },
  card: {
    width: "420px",
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "2.5rem",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    color: "#7a8099",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0",
    marginBottom: "2rem",
    fontFamily: "sans-serif",
  },
  iconWrap: {
    width: "52px",
    height: "52px",
    background: "#0d1a2e",
    border: "0.5px solid #1f2a3c",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#f0ebe0",
    marginBottom: "6px",
    fontFamily: "Georgia, serif",
  },
  subtitle: {
    fontSize: "13px",
    color: "#7a8099",
    lineHeight: "1.6",
    marginBottom: "2rem",
  },
  emailHighlight: {
    color: "#c8a96e",
    fontWeight: "500",
  },
  otpRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  otpInput: {
    width: "52px",
    height: "60px",
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "500",
    color: "#f0ebe0",
    outline: "none",
    caretColor: "#c8a96e",
    fontFamily: "Georgia, serif",
    transition: "border-color 0.15s",
  },
  otpInputFilled: {
    borderColor: "#c8a96e",
  },
  otpInputError: {
    borderColor: "#7f1d1d",
    background: "#1a0d0d",
  },
  timerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  timerText: {
    fontSize: "12px",
    color: "#7a8099",
  },
  timerCount: {
    color: "#c8a96e",
    fontWeight: "500",
  },
  resendBtn: {
    fontSize: "12px",
    color: "#c8a96e",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    fontFamily: "sans-serif",
  },
  resendDisabled: {
    color: "#3a4055",
    cursor: "not-allowed",
  },
  alertBox: {
    background: "#2a0f0f",
    border: "0.5px solid #7f1d1d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "1.25rem",
  },
  successBox: {
    background: "#0d1a0d",
    border: "0.5px solid #14291a",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#4ade80",
    marginBottom: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  submitBtn: {
    width: "100%",
    background: "#c8a96e",
    color: "#0a0f1e",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.5px",
    fontFamily: "sans-serif",
    marginBottom: "1.25rem",
    transition: "opacity 0.2s",
  },
  submitDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  attemptsWarn: {
    textAlign: "center",
    fontSize: "12px",
    color: "#7a8099",
    marginBottom: "1.25rem",
  },
  attemptsRed: {
    color: "#f87171",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.25rem",
  },
  dividerLine: {
    flex: 1,
    height: "0.5px",
    background: "#1f2a3c",
  },
  dividerLabel: {
    fontSize: "11px",
    color: "#7a8099",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  securityNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#0d1a0d",
    border: "0.5px solid #14291a",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#4ade80",
  },
  securityDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    flexShrink: 0,
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "2rem",
  },
  stepDone: {
    width: "24px",
    height: "6px",
    borderRadius: "3px",
    background: "#c8a96e",
  },
  stepActive: {
    width: "32px",
    height: "6px",
    borderRadius: "3px",
    background: "#c8a96e",
    opacity: 1,
  },
  stepPending: {
    width: "24px",
    height: "6px",
    borderRadius: "3px",
    background: "#1f2a3c",
  },
};

const RESEND_COOLDOWN = 30; // seconds
const MAX_ATTEMPTS = 5;

export default function MFAVerify() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Get email set during login — only used for display, never for auth
  const userEmail = sessionStorage.getItem("user_email") || "";
  const maskedEmail = maskEmail(userEmail);

  // Redirect if MFA session not properly initiated
  useEffect(() => {
    if (!sessionStorage.getItem("mfa_pending")) {
      navigate("/login");
    }
  }, [navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index, value) => {
    // Only allow single digit 0-9
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError("");

    // Auto-advance to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (cleaned && index === 5) {
      const fullCode = [...newDigits.slice(0, 5), cleaned].join("");
      if (fullCode.length === 6) handleSubmit(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace clears current and moves back
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newDigits = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(newDigits);
    // Focus last filled input
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
    // Auto-submit if full paste
    if (pasted.length === 6) handleSubmit(pasted);
  };

  const handleSubmit = async (codeOverride) => {
    const code = codeOverride || digits.join("");
    const validation = validateMFACode(code);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many failed attempts. Please log in again.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/mfa/verify", { code });

      if (response.data.success) {
        const { token, role } = response.data.data;
        saveSession(token, role);
        setSuccessMsg("Identity verified. Redirecting...");
        setTimeout(() => navigate("/search"), 1200);
      }
    } catch (err) {
      const status = err.response?.status;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Reset digit inputs on failure
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      if (status === 401) {
        const remaining = MAX_ATTEMPTS - newAttempts;
        if (remaining <= 0) {
          setError("Too many failed attempts. Returning to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(`Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
        }
      } else if (status === 429) {
        setError("Too many requests. Please wait before trying again.");
      } else if (status === 410) {
        setError("Code has expired. Please request a new one.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(RESEND_COOLDOWN);
    setError("");
    setDigits(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      await api.post("/auth/mfa/resend");
      setSuccessMsg("A new code has been sent.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Could not resend code. Please try again.");
    }
  };

  const isComplete = digits.every((d) => d !== "");
  const attemptsLeft = MAX_ATTEMPTS - attempts;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate("/login")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#7a8099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to login
        </button>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          <div style={styles.stepDone} />
          <div style={styles.stepActive} />
          <div style={styles.stepPending} />
        </div>

        {/* Icon */}
        <div style={styles.iconWrap}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#c8a96e" strokeWidth="1.5"/>
            <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="#c8a96e"/>
          </svg>
        </div>

        <h1 style={styles.title}>Two-factor verification</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to{" "}
          <span style={styles.emailHighlight}>{maskedEmail}</span>.
          {" "}This code expires in 10 minutes.
        </p>

        {/* Error / success messages */}
        {error && (
          <div style={styles.alertBox} role="alert">{error}</div>
        )}
        {successMsg && (
          <div style={styles.successBox} role="status">
            <div style={styles.securityDot} />
            {successMsg}
          </div>
        )}

        {/* OTP digit inputs */}
        <div style={styles.otpRow} onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                ...styles.otpInput,
                ...(digit ? styles.otpInputFilled : {}),
                ...(error ? styles.otpInputError : {}),
              }}
              aria-label={`Digit ${i + 1}`}
              autoComplete="one-time-code"
              disabled={loading}
            />
          ))}
        </div>

        {/* Attempts warning */}
        {attempts > 0 && (
          <p style={{ ...styles.attemptsWarn, ...(attemptsLeft <= 2 ? styles.attemptsRed : {}) }}>
            {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining
          </p>
        )}

        {/* Timer + resend */}
        <div style={styles.timerRow}>
          <span style={styles.timerText}>
            {canResend
              ? "Didn't receive the code?"
              : <>Resend in <span style={styles.timerCount}>{timer}s</span></>}
          </span>
          <button
            style={{
              ...styles.resendBtn,
              ...(canResend ? {} : styles.resendDisabled),
            }}
            onClick={handleResend}
            disabled={!canResend}
          >
            Resend code
          </button>
        </div>

        {/* Submit button */}
        <button
          style={{
            ...styles.submitBtn,
            ...(!isComplete || loading ? styles.submitDisabled : {}),
          }}
          onClick={() => handleSubmit()}
          disabled={!isComplete || loading}
        >
          {loading ? "Verifying..." : "Verify identity"}
        </button>

        {/* Divider */}
        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerLabel}>secured by</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Security badge */}
        <div style={styles.securityNote}>
          <div style={styles.securityDot} />
          <span>Code expires in 10 min · Max 5 attempts · CSRF protected</span>
        </div>

      </div>
    </div>
  );
}

/**
 * Masks email for display — never expose full email on screen
 * e.g. kanzy@gmail.com → k***@gmail.com
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return "your email";
  const [local, domain] = email.split("@");
  const masked = local[0] + "***";
  return `${masked}@${domain}`;
}