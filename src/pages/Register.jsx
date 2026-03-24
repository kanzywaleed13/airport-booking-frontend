import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils/validators";

const s = {
  page: {
    minHeight: "100vh", background: "#0a0f1e",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "sans-serif", padding: "2rem",
  },
  left: {
    flex: 1, maxWidth: "420px", paddingRight: "4rem",
    display: "flex", flexDirection: "column", justifyContent: "center",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "2.5rem" },
  logoIcon: {
    width: "36px", height: "36px", background: "#c8a96e", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: "13px", fontWeight: "600", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" },
  tagline: {
    fontSize: "34px", fontWeight: "400", color: "#f0ebe0",
    lineHeight: "1.25", marginBottom: "1.25rem",
    letterSpacing: "-0.5px", fontFamily: "Georgia, serif",
  },
  taglineAccent: { color: "#c8a96e", fontStyle: "italic" },
  subtext: { fontSize: "14px", color: "#7a8099", lineHeight: "1.7", marginBottom: "2rem" },
  perks: { display: "flex", flexDirection: "column", gap: "10px" },
  perk: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#7a8099" },
  perkDot: { width: "5px", height: "5px", borderRadius: "50%", background: "#c8a96e", flexShrink: 0 },
  right: {
    width: "420px", background: "#111827", border: "0.5px solid #1f2a3c",
    borderRadius: "16px", padding: "2.25rem",
  },
  formTitle: { fontSize: "20px", fontWeight: "500", color: "#f0ebe0", marginBottom: "4px", fontFamily: "Georgia, serif" },
  formSub: { fontSize: "13px", color: "#7a8099", marginBottom: "1.75rem" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
  fieldGroup: { marginBottom: "12px" },
  label: {
    display: "block", fontSize: "10px", fontWeight: "600",
    letterSpacing: "1.5px", textTransform: "uppercase",
    color: "#7a8099", marginBottom: "6px",
  },
  input: {
    width: "100%", background: "#0d1525", border: "0.5px solid #1f2a3c",
    borderRadius: "8px", padding: "10px 12px", fontSize: "14px",
    color: "#f0ebe0", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s", fontFamily: "sans-serif",
  },
  inputError: { borderColor: "#7f1d1d" },
  inputFocus: { borderColor: "#c8a96e" },
  errorMsg: { fontSize: "11px", color: "#f87171", marginTop: "5px" },
  passWrap: { position: "relative" },
  toggleBtn: {
    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "#7a8099", fontSize: "12px", fontFamily: "sans-serif", padding: "0",
  },
  strengthRow: { display: "flex", gap: "4px", marginTop: "8px" },
  alertBox: {
    background: "#2a0f0f", border: "0.5px solid #7f1d1d", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", color: "#f87171", marginBottom: "1rem",
  },
  submitBtn: {
    width: "100%", background: "#c8a96e", color: "#0a0f1e", border: "none",
    borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", letterSpacing: "0.5px", fontFamily: "sans-serif",
    transition: "opacity 0.2s", marginBottom: "1.25rem",
  },
  submitDisabled: { opacity: 0.45, cursor: "not-allowed" },
  dividerRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" },
  dividerLine: { flex: 1, height: "0.5px", background: "#1f2a3c" },
  dividerLabel: { fontSize: "10px", color: "#7a8099", letterSpacing: "1px", textTransform: "uppercase" },
  securityNote: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px",
    background: "#0d1a0d", border: "0.5px solid #14291a",
    borderRadius: "8px", fontSize: "11px", color: "#4ade80",
  },
  securityDot: { width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 },
  footer: { marginTop: "1.25rem", textAlign: "center", fontSize: "13px", color: "#7a8099" },
  footerLink: {
    color: "#c8a96e", background: "none", border: "none",
    cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", padding: 0,
  },
};

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

function strengthLabel(score) {
  if (score === 0) return "";
  if (score === 1) return { text: "Weak", color: "#ef4444" };
  if (score === 2) return { text: "Fair", color: "#f59e0b" };
  if (score === 3) return { text: "Good", color: "#22c55e" };
  return { text: "Strong", color: "#22c55e" };
}

function barColor(score) {
  if (score === 1) return "#ef4444";
  if (score === 2) return "#f59e0b";
  return "#22c55e";
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === "firstName" || name === "lastName") {
      sanitized = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 50);
    }
    if (name === "phone") {
      sanitized = value.replace(/[^0-9+]/g, "").slice(0, 15);
    }
    if (name === "email") sanitized = value.slice(0, 254);
    if (name === "password" || name === "confirmPassword") sanitized = value.slice(0, 128);
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    else if (!/^[a-zA-Z\s'-]{2,}$/.test(form.firstName.trim())) errs.firstName = "Letters only.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    else if (!/^[a-zA-Z\s'-]{2,}$/.test(form.lastName.trim())) errs.lastName = "Letters only.";
    const emailR = validateEmail(form.email);
    if (!emailR.valid) errs.email = emailR.message;
    const phoneR = validatePhone(form.phone);
    if (!phoneR.valid) errs.phone = phoneR.message;
    const passR = validatePassword(form.password);
    if (!passR.valid) errs.password = passR.message;
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      const response = await api.post("/auth/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if (response.data.success) {
        // Store email for MFA page display
        sessionStorage.setItem("mfa_pending", "true");
        sessionStorage.setItem("user_email", form.email.trim());
        navigate("/mfa-verify");
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setServerError("An account with this email already exists. Please log in.");
      } else if (status === 400) {
        setServerError("Please check your details and try again.");
      } else {
        setServerError("Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => ({
    ...s.input,
    ...(errors[field] ? s.inputError : {}),
    ...(focused === field && !errors[field] ? s.inputFocus : {}),
  });

  const strength = getStrength(form.password);
  const strengthInfo = strengthLabel(strength);

  return (
    <div style={s.page}>
      {/* Left branding */}
      <div style={s.left}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#0a0f1e" strokeWidth="1.5" fill="none"/>
              <path d="M6 10H14M10 6V14" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={s.logoText}>AeroSecure</span>
        </div>

        <h1 style={s.tagline}>
          Start your<br />
          <span style={s.taglineAccent}>secure</span> journey<br />
          today.
        </h1>

        <p style={s.subtext}>
          Join thousands of passengers who trust AeroSecure
          for safe, encrypted flight booking.
        </p>

        <div style={s.perks}>
          {[
            "MFA protection on every login",
            "Passport data encrypted with AES-256",
            "Zero data sold to third parties",
            "GDPR & PCI-DSS compliant",
          ].map((perk) => (
            <div key={perk} style={s.perk}>
              <div style={s.perkDot} />
              {perk}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={s.right}>
        <p style={s.formTitle}>Create your account</p>
        <p style={s.formSub}>Takes less than 2 minutes</p>

        {serverError && <div style={s.alertBox} role="alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {/* First + Last name */}
          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="firstName">First name</label>
              <input
                id="firstName" name="firstName" type="text"
                value={form.firstName} onChange={handleChange}
                onFocus={() => setFocused("firstName")} onBlur={() => setFocused(null)}
                style={getInputStyle("firstName")}
                placeholder="Kanzy" maxLength={50} autoComplete="given-name"
              />
              {errors.firstName && <p style={s.errorMsg}>{errors.firstName}</p>}
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="lastName">Last name</label>
              <input
                id="lastName" name="lastName" type="text"
                value={form.lastName} onChange={handleChange}
                onFocus={() => setFocused("lastName")} onBlur={() => setFocused(null)}
                style={getInputStyle("lastName")}
                placeholder="Waleed" maxLength={50} autoComplete="family-name"
              />
              {errors.lastName && <p style={s.errorMsg}>{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              style={getInputStyle("email")}
              placeholder="you@example.com" maxLength={254} autoComplete="email"
            />
            {errors.email && <p style={s.errorMsg}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="phone">Phone number</label>
            <input
              id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
              style={getInputStyle("phone")}
              placeholder="+201234567890" maxLength={15} autoComplete="tel"
            />
            {errors.phone && <p style={s.errorMsg}>{errors.phone}</p>}
          </div>

          {/* Password */}
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="password">Password</label>
            <div style={s.passWrap}>
              <input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={handleChange}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                style={{ ...getInputStyle("password"), paddingRight: "52px" }}
                placeholder="Min. 8 characters" maxLength={128} autoComplete="new-password"
              />
              <button type="button" style={s.toggleBtn} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Strength bars */}
            {form.password && (
              <>
                <div style={s.strengthRow}>
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} style={{
                      flex: 1, height: "3px", borderRadius: "2px",
                      background: strength >= level ? barColor(strength) : "#1f2a3c",
                      transition: "background 0.2s",
                    }} />
                  ))}
                </div>
                {strengthInfo && (
                  <p style={{ ...s.errorMsg, color: strengthInfo.color, marginTop: "5px" }}>
                    {strengthInfo.text} password
                  </p>
                )}
              </>
            )}
            {errors.password && <p style={s.errorMsg}>{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="confirmPassword">Confirm password</label>
            <div style={s.passWrap}>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword} onChange={handleChange}
                onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused(null)}
                style={{ ...getInputStyle("confirmPassword"), paddingRight: "52px" }}
                placeholder="Repeat your password" maxLength={128} autoComplete="new-password"
              />
              <button type="button" style={s.toggleBtn} onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <p style={s.errorMsg}>{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div style={s.dividerRow}>
            <div style={s.dividerLine} />
            <span style={s.dividerLabel}>secured by</span>
            <div style={s.dividerLine} />
          </div>

          <div style={s.securityNote}>
            <div style={s.securityDot} />
            <span>256-bit TLS · AES-256 encryption · MFA on signup</span>
          </div>
        </form>

        <p style={s.footer}>
          Already have an account?{" "}
          <button style={s.footerLink} onClick={() => navigate("/login")}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}