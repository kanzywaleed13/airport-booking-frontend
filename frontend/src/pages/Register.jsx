import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { validateEmail, validatePhone, validatePassword } from "../utils/validators";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    padding: "2rem",
  },
  left: {
    flex: 1,
    maxWidth: "420px",
    paddingRight: "4rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2.5rem",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "#c8a96e",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#c8a96e",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: "34px",
    fontWeight: "400",
    color: "#f0ebe0",
    lineHeight: "1.25",
    marginBottom: "1.25rem",
    letterSpacing: "-0.5px",
    fontFamily: "Georgia, serif",
  },
  taglineAccent: {
    color: "#c8a96e",
    fontStyle: "italic",
  },
  subtext: {
    fontSize: "14px",
    color: "#7a8099",
    lineHeight: "1.7",
    marginBottom: "2rem",
  },
  perks: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  perk: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#7a8099",
  },
  perkDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#c8a96e",
    flexShrink: 0,
  },
  right: {
    width: "420px",
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "2.25rem",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#f0ebe0",
    marginBottom: "4px",
    fontFamily: "Georgia, serif",
  },
  formSub: {
    fontSize: "13px",
    color: "#7a8099",
    marginBottom: "1.75rem",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  fieldGroup: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#7a8099",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#f0ebe0",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    fontFamily: "sans-serif",
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
    marginTop: "5px",
  },
  passWrap: {
    position: "relative",
  },
  toggleBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7a8099",
    fontSize: "12px",
    fontFamily: "sans-serif",
    padding: "0",
  },
  strengthRow: {
    display: "flex",
    gap: "4px",
    marginTop: "8px",
  },
  alertBox: {
    background: "#2a0f0f",
    border: "0.5px solid #7f1d1d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "1rem",
  },
  successBox: {
    background: "#0d1a0d",
    border: "0.5px solid #14532d",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#4ade80",
    marginBottom: "1rem",
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
    marginBottom: "0.75rem",
  },
  submitDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "1.25rem",
    marginTop: "0.5rem",
  },
  dividerLine: {
    flex: 1,
    height: "0.5px",
    background: "#1f2a3c",
  },
  dividerLabel: {
    fontSize: "10px",
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
    fontSize: "11px",
    color: "#4ade80",
  },
  securityDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#4ade80",
    flexShrink: 0,
  },
  footer: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "13px",
    color: "#7a8099",
  },
  footerLink: {
    color: "#c8a96e",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "sans-serif",
    fontSize: "13px",
    padding: 0,
  },
};

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

function strengthLabel(score) {
  if (score === 0) return null;
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

let recaptchaVerifierInstance = null;

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [registrationStep, setRegistrationStep] = useState("form");
  const [verificationId, setVerificationId] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === "firstName" || name === "lastName") {
      sanitized = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 50);
    }

    if (name === "phone") {
      sanitized = value.replace(/[^0-9+]/g, "").slice(0, 15);
    }

    if (name === "email") {
      sanitized = value.trim().slice(0, 254);
    }

    if (name === "password" || name === "confirmPassword") {
      sanitized = value.slice(0, 128);
    }

    setForm((prev) => ({ ...prev, [name]: sanitized }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) setServerError("");
  };

  const validate = () => {
    const errs = {};

    if (!form.firstName.trim()) {
      errs.firstName = "First name is required.";
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(form.firstName.trim())) {
      errs.firstName = "Enter a valid first name.";
    }

    if (!form.lastName.trim()) {
      errs.lastName = "Last name is required.";
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(form.lastName.trim())) {
      errs.lastName = "Enter a valid last name.";
    }

    const emailResult = validateEmail(form.email);
    if (!emailResult.valid) errs.email = emailResult.message;

    const phoneResult = validatePhone(form.phone);
    if (!phoneResult.valid) errs.phone = phoneResult.message;

    const passwordResult = validatePassword(form.password);
    if (!passwordResult.valid) errs.password = passwordResult.message;

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    return errs;
  };

  const getInputStyle = (field) => ({
    ...s.input,
    ...(errors[field] ? s.inputError : {}),
    ...(focused === field && !errors[field] ? s.inputFocus : {}),
  });

  const getRecaptchaVerifier = () => {
    if (!recaptchaVerifierInstance) {
      recaptchaVerifierInstance = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaVerifierInstance;
  };

  const startMfaEnrollment = async () => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You are not signed in. Please log in again.");
    }

    await user.reload();

    if (!user.emailVerified) {
      throw new Error("Please verify your email before enabling MFA.");
    }

    const recaptchaVerifier = getRecaptchaVerifier();
    const mfaSession = await multiFactor(user).getSession();
    const phoneAuthProvider = new PhoneAuthProvider(auth);

    const newVerificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        phoneNumber: form.phone.trim(),
        session: mfaSession,
      },
      recaptchaVerifier
    );

    setVerificationId(newVerificationId);
    setRegistrationStep("mfa");
    setSuccessMessage("Email verified. We sent a verification code to your phone.");
  };

  const finishMfaEnrollment = async () => {
    try {
      if (otpCode.length !== 6) {
        setServerError("Please enter the 6-digit SMS verification code.");
        return;
      }

      setLoading(true);
      setServerError("");
      setSuccessMessage("");

      const user = auth.currentUser;

      if (!user) {
        throw new Error("You are not signed in. Please log in again.");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

      await multiFactor(user).enroll(multiFactorAssertion, "Primary phone");

      setSuccessMessage("Account created and MFA enabled successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setServerError(err.message || "Failed to verify the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerifiedContinue = async () => {
    try {
      setLoading(true);
      setServerError("");
      setSuccessMessage("");

      await startMfaEnrollment();
    } catch (err) {
      setServerError(err.message || "Could not start MFA enrollment.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setServerError("");
      setSuccessMessage("");

      const user = auth.currentUser;

      if (!user) {
        throw new Error("You are not signed in. Please register again.");
      }

      await sendEmailVerification(user);
      setSuccessMessage("Verification email sent again. Please check your inbox.");
    } catch (err) {
      setServerError(err.message || "Could not resend verification email.");
    } finally {
      setLoading(false);
    }
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
    setSuccessMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: "passenger",
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);

      setRegistrationStep("verifyEmail");
      setSuccessMessage(
        "Account created. Please verify your email, then click “I verified my email”."
      );
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setServerError("An account with this email already exists. Please log in.");
      } else if (err.code === "auth/invalid-email") {
        setServerError("The email address is invalid.");
      } else if (err.code === "auth/weak-password") {
        setServerError("Password is too weak. Please choose a stronger password.");
      } else {
        setServerError(`Registration failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const strengthInfo = strengthLabel(strength);

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="#0a0f1e" strokeWidth="1.5" fill="none" />
              <path d="M6 10H14M10 6V14" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={s.logoText}>AeroSecure</span>
        </div>

        <h1 style={s.tagline}>
          Start your
          <br />
          <span style={s.taglineAccent}>secure</span> journey
          <br />
          today.
        </h1>

        <p style={s.subtext}>
          Join thousands of passengers who trust AeroSecure for safe, encrypted
          flight booking.
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

      <div style={s.right}>
        <p style={s.formTitle}>Create your account</p>
        <p style={s.formSub}>Takes less than 2 minutes</p>

        {serverError && (
          <div style={s.alertBox} role="alert">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div style={s.successBox} role="status">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {(registrationStep === "form" || registrationStep === "verifyEmail") && (
            <>
              <div style={s.grid2}>
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocused("firstName")}
                    onBlur={() => setFocused(null)}
                    style={getInputStyle("firstName")}
                    placeholder="Kanzy"
                    maxLength={50}
                    autoComplete="given-name"
                    disabled={registrationStep !== "form"}
                  />
                  {errors.firstName && <p style={s.errorMsg}>{errors.firstName}</p>}
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocused("lastName")}
                    onBlur={() => setFocused(null)}
                    style={getInputStyle("lastName")}
                    placeholder="Waleed"
                    maxLength={50}
                    autoComplete="family-name"
                    disabled={registrationStep !== "form"}
                  />
                  {errors.lastName && <p style={s.errorMsg}>{errors.lastName}</p>}
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("email")}
                  placeholder="you@example.com"
                  maxLength={254}
                  autoComplete="email"
                  disabled={registrationStep !== "form"}
                />
                {errors.email && <p style={s.errorMsg}>{errors.email}</p>}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                  style={getInputStyle("phone")}
                  placeholder="+201234567890"
                  maxLength={15}
                  autoComplete="tel"
                  disabled={registrationStep !== "form"}
                />
                {errors.phone && <p style={s.errorMsg}>{errors.phone}</p>}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="password">Password</label>
                <div style={s.passWrap}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    style={{ ...getInputStyle("password"), paddingRight: "52px" }}
                    placeholder="Min. 8 characters"
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={registrationStep !== "form"}
                  />
                  <button
                    type="button"
                    style={s.toggleBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={registrationStep !== "form"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {registrationStep === "form" && form.password && (
                  <>
                    <div style={s.strengthRow}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: "3px",
                            borderRadius: "2px",
                            background: strength >= level ? barColor(strength) : "#1f2a3c",
                            transition: "background 0.2s",
                          }}
                        />
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

              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="confirmPassword">Confirm password</label>
                <div style={s.passWrap}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocused("confirmPassword")}
                    onBlur={() => setFocused(null)}
                    style={{ ...getInputStyle("confirmPassword"), paddingRight: "52px" }}
                    placeholder="Repeat your password"
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={registrationStep !== "form"}
                  />
                  <button
                    type="button"
                    style={s.toggleBtn}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    disabled={registrationStep !== "form"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <p style={s.errorMsg}>{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {registrationStep === "mfa" && (
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="otpCode">SMS verification code</label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={s.input}
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <p style={{ ...s.errorMsg, color: "#7a8099" }}>
                Enter the code sent to {form.phone.trim()}.
              </p>
            </div>
          )}

          {registrationStep === "form" && (
            <button
              type="submit"
              style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          )}

          {registrationStep === "verifyEmail" && (
            <>
              <button
                type="button"
                style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }}
                disabled={loading}
                onClick={handleEmailVerifiedContinue}
              >
                {loading ? "Checking..." : "I verified my email"}
              </button>

              <button
                type="button"
                style={{ ...s.secondaryBtn, ...(loading ? s.submitDisabled : {}) }}
                disabled={loading}
                onClick={handleResendVerification}
              >
                {loading ? "Sending..." : "Resend verification email"}
              </button>
            </>
          )}

          {registrationStep === "mfa" && (
            <button
              type="button"
              style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }}
              disabled={loading || otpCode.length !== 6}
              onClick={finishMfaEnrollment}
            >
              {loading ? "Verifying..." : "Verify phone and enable MFA"}
            </button>
          )}

          <div id="recaptcha-container"></div>

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
          <button
            type="button"
            style={s.footerLink}
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}