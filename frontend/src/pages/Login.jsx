import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { auth } from "../firebase";
import { validateEmail, validatePassword } from "../utils/validators";

// ─── EmailJS config ────────────────────────────────────────────────────────
// Sign up free at https://www.emailjs.com → create a service + template
// then paste your IDs into your .env file:
//   REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
//   REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
//   REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
//
// Your EmailJS template should contain these variables:
//   {{to_email}}   — recipient address
//   {{otp_code}}   — the 6-digit code
//   {{expires_in}} — "10 minutes"
const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// ─── OTP utilities ─────────────────────────────────────────────────────────

function generateOTP() {
  // Cryptographically random 6-digit code
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

async function hashOTP(otp) {
  const encoded = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function storeOTPSession(hash) {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  sessionStorage.setItem("otp_hash", hash);
  sessionStorage.setItem("otp_expiry", String(expiry));
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh", background: "#0a0f1e", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'Georgia', serif", padding: "2rem",
  },
  left: {
    flex: 1, maxWidth: "480px", paddingRight: "4rem",
    display: "flex", flexDirection: "column", justifyContent: "center",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "3rem" },
  logoIcon: { width: "36px", height: "36px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: "14px", fontWeight: "600", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Georgia', serif" },
  tagline: { fontSize: "38px", fontWeight: "400", color: "#f0ebe0", lineHeight: "1.25", marginBottom: "1.5rem", letterSpacing: "-0.5px" },
  taglineAccent: { color: "#c8a96e", fontStyle: "italic" },
  subtext: { fontSize: "15px", color: "#7a8099", lineHeight: "1.7", marginBottom: "2rem" },
  divider: { width: "40px", height: "1px", background: "#c8a96e", opacity: 0.5 },
  right: { width: "400px", background: "#111827", border: "0.5px solid #1f2a3c", borderRadius: "16px", padding: "2.5rem" },
  formTitle: { fontSize: "20px", fontWeight: "500", color: "#f0ebe0", marginBottom: "0.35rem", fontFamily: "'Georgia', serif" },
  formSub: { fontSize: "13px", color: "#7a8099", marginBottom: "2rem" },
  fieldGroup: { marginBottom: "1.25rem" },
  label: { display: "block", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7a8099", marginBottom: "8px", fontFamily: "sans-serif" },
  input: { width: "100%", background: "#0d1525", border: "0.5px solid #1f2a3c", borderRadius: "8px", padding: "11px 14px", fontSize: "14px", color: "#f0ebe0", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "sans-serif" },
  inputError: { borderColor: "#7f1d1d" },
  inputFocus: { borderColor: "#c8a96e" },
  errorMsg: { fontSize: "12px", color: "#f87171", marginTop: "6px", fontFamily: "sans-serif" },
  passwordWrapper: { position: "relative" },
  toggleBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a8099", fontSize: "12px", fontFamily: "sans-serif", padding: "0" },
  rememberRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#7a8099", cursor: "pointer", fontFamily: "sans-serif" },
  forgotLink: { fontSize: "13px", color: "#c8a96e", textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif", padding: 0 },
  submitBtn: { width: "100%", background: "#c8a96e", color: "#0a0f1e", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.5px", fontFamily: "sans-serif", transition: "opacity 0.2s", marginBottom: "1.25rem" },
  submitBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  alertBox: { background: "#2a0f0f", border: "0.5px solid #7f1d1d", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1.25rem", fontFamily: "sans-serif" },
  infoBox: { background: "#0d1a0d", border: "0.5px solid #14291a", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#4ade80", marginBottom: "1.25rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "8px" },
  dividerRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" },
  dividerLine: { flex: 1, height: "0.5px", background: "#1f2a3c" },
  dividerLabel: { fontSize: "11px", color: "#7a8099", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" },
  securityNote: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#0d1a0d", border: "0.5px solid #14291a", borderRadius: "8px", fontSize: "12px", color: "#4ade80", fontFamily: "sans-serif" },
  securityDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 },
  footer: { marginTop: "1.5rem", textAlign: "center", fontSize: "13px", color: "#7a8099", fontFamily: "sans-serif" },
  footerLink: { color: "#c8a96e", textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", padding: 0 },
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitized = name === "password"
      ? value.slice(0, 128)
      : value.trimStart().slice(0, 254);
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    const emailResult = validateEmail(form.email);
    if (!emailResult.valid) newErrors.email = emailResult.message;
    const passResult = validatePassword(form.password);
    if (!passResult.valid) newErrors.password = passResult.message;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setServerError("");

    try {
      // Step 1 — verify credentials with Firebase
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);

      // Step 2 — generate OTP and send via EmailJS
      const otp = generateOTP();
      const hash = await hashOTP(otp);
      storeOTPSession(hash);

      // Store email so MFAVerify can display it
      sessionStorage.setItem("otp_email", form.email.trim());
      sessionStorage.setItem("otp_remember", rememberMe ? "true" : "false");
      // ⚠️ MUST be set before navigate — tells the auth guard OTP is not yet done
      sessionStorage.setItem("otp_pending", "true");

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email:   form.email.trim(),
          otp_code:   otp,
          expires_in: "10 minutes",
        },
        EMAILJS_PUBLIC_KEY
      );

      // Step 3 — go to OTP verification screen
      navigate("/mfa-verify");
    } catch (err) {
      // Clean up session if anything went wrong
      sessionStorage.removeItem("otp_hash");
      sessionStorage.removeItem("otp_expiry");
      sessionStorage.removeItem("otp_email");

      if (err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password") {
        setServerError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setServerError("Too many attempts. Please wait before trying again.");
      } else if (err.code === "auth/invalid-email") {
        setServerError("Please enter a valid email address.");
      } else if (err.status === 400 || err.text) {
        // EmailJS error
        setServerError("Could not send verification email. Please try again.");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => ({
    ...styles.input,
    ...(errors[field] ? styles.inputError : {}),
    ...(focusedField === field && !errors[field] ? styles.inputFocus : {}),
  });

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#0a0f1e" strokeWidth="1.5" fill="none"/>
              <path d="M6 10H14M10 6V14" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>AeroSecure</span>
        </div>
        <h1 style={styles.tagline}>
          Your journey,<br/>
          <span style={styles.taglineAccent}>secured</span> at every<br/>
          altitude.
        </h1>
        <p style={styles.subtext}>
          Military-grade security for modern air travel. Your passport,
          payments, and personal data protected end-to-end.
        </p>
        <div style={styles.divider} />
      </div>

      <div style={styles.right}>
        <p style={styles.formTitle}>Welcome back</p>
        <p style={styles.formSub}>Sign in — we'll send a verification code to your email</p>

        {serverError && (
          <div style={styles.alertBox} role="alert">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("email")}
              placeholder="you@example.com"
              autoComplete="username" maxLength={254} required
            />
            {errors.email && <p style={styles.errorMsg} role="alert">{errors.email}</p>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.passwordWrapper}>
              <input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputStyle("password"), paddingRight: "52px" }}
                placeholder="Enter your password"
                autoComplete="current-password" maxLength={128} required
              />
              <button
                type="button" style={styles.toggleBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p style={styles.errorMsg} role="alert">{errors.password}</p>}
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#c8a96e" }}
              />
              Remember this device
            </label>
            <button type="button" style={styles.forgotLink}>Forgot password?</button>
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Sending code..." : "Continue →"}
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.dividerLine}/>
            <span style={styles.dividerLabel}>secured by</span>
            <div style={styles.dividerLine}/>
          </div>

          <div style={styles.securityNote}>
            <div style={styles.securityDot}/>
            <span>256-bit TLS · Email OTP · CSRF protected</span>
          </div>
        </form>

        <p style={styles.footer}>
          New passenger?{" "}
          <button type="button" style={styles.footerLink} onClick={() => navigate("/register")}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
