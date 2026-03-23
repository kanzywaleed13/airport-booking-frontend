import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneAuthProvider, PhoneMultiFactorGenerator } from "firebase/auth";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'Georgia', serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "2.25rem",
  },
  title: {
    fontSize: "28px",
    color: "#f0ebe0",
    marginBottom: "0.5rem",
  },
  subtext: {
    fontSize: "14px",
    color: "#7a8099",
    lineHeight: "1.7",
    marginBottom: "1.5rem",
    fontFamily: "sans-serif",
  },
  alertBox: {
    background: "#2a0f0f",
    border: "0.5px solid #7f1d1d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "1rem",
    fontFamily: "sans-serif",
  },
  successBox: {
    background: "#0d1a0d",
    border: "0.5px solid #14532d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#4ade80",
    marginBottom: "1rem",
    fontFamily: "sans-serif",
  },
  fieldGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#7a8099",
    marginBottom: "8px",
    fontFamily: "sans-serif",
  },
  input: {
    width: "100%",
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "11px 14px",
    fontSize: "18px",
    color: "#f0ebe0",
    outline: "none",
    boxSizing: "border-box",
    letterSpacing: "4px",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  helper: {
    fontSize: "12px",
    color: "#7a8099",
    marginTop: "8px",
    fontFamily: "sans-serif",
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
    transition: "opacity 0.2s",
    marginBottom: "0.75rem",
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  secondaryBtn: {
    width: "100%",
    background: "transparent",
    color: "#c8a96e",
    border: "0.5px solid #c8a96e",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.5px",
    fontFamily: "sans-serif",
  },
};

export default function MFAVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const verificationId = sessionStorage.getItem("verificationId");
      const resolver = window.mfaResolver;

      if (!verificationId || !resolver) {
        throw new Error("Verification session expired. Please log in again.");
      }

      const credential = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion =
        PhoneMultiFactorGenerator.assertion(credential);

      await resolver.resolveSignIn(multiFactorAssertion);

      sessionStorage.removeItem("verificationId");
      sessionStorage.removeItem("mfaRememberMe");
      window.mfaResolver = null;

      setSuccessMessage("Verification successful. Redirecting...");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 700);
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem("verificationId");
    sessionStorage.removeItem("mfaRememberMe");
    window.mfaResolver = null;
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Multi-factor verification</h1>
        <p style={styles.subtext}>
          Enter the 6-digit SMS code sent to your registered phone number to
          complete sign in.
        </p>

        {error && (
          <div style={styles.alertBox} role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div style={styles.successBox} role="status">
            {successMessage}
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="otpCode">
            Verification code
          </label>
          <input
            id="otpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            maxLength={6}
            style={styles.input}
          />
          <p style={styles.helper}>Use the code from the SMS message.</p>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          style={{
            ...styles.submitBtn,
            ...((loading || code.length !== 6)
              ? styles.submitBtnDisabled
              : {}),
          }}
        >
          {loading ? "Verifying..." : "Verify and continue"}
        </button>

        <button
          type="button"
          onClick={handleBackToLogin}
          style={styles.secondaryBtn}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}