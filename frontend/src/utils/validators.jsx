/**
 * validators.js
 * Whitelist-based validation for all frontend input fields.
 * Each function returns { valid: boolean, message: string }
 *
 * SECURITY NOTE:
 * These validators are for UX only — they improve user experience
 * and reduce bad requests. The backend MUST re-validate everything.
 * Never trust frontend validation alone.
 */

// ─── Airport / City Lookup ─────────────────────────────────────────────────

/**
 * Maps common city names (uppercase) to their primary IATA airport code.
 * Add more entries as your route network grows.
 */
export const AIRPORT_LOOKUP = {
  // Egypt
  CAIRO: "CAI",
  ALEXANDRIA: "HBE",
  HURGHADA: "HRG",
  "SHARM EL-SHEIKH": "SSH",
  "SHARM EL SHEIKH": "SSH",
  SHARM: "SSH",
  LUXOR: "LXR",
  ASWAN: "ASW",
  MARSA: "RMF",
  // Gulf / Middle East
  DUBAI: "DXB",
  "ABU DHABI": "AUH",
  DOHA: "DOH",
  RIYADH: "RUH",
  JEDDAH: "JED",
  MUSCAT: "MCT",
  KUWAIT: "KWI",
  BAHRAIN: "BAH",
  AMMAN: "AMM",
  BEIRUT: "BEY",
  TEHRAN: "IKA",
  ISTANBUL: "IST",
  ANKARA: "ESB",
  // Europe
  LONDON: "LHR",
  PARIS: "CDG",
  AMSTERDAM: "AMS",
  FRANKFURT: "FRA",
  MADRID: "MAD",
  ROME: "FCO",
  BARCELONA: "BCN",
  MUNICH: "MUC",
  ZURICH: "ZRH",
  BRUSSELS: "BRU",
  VIENNA: "VIE",
  MILAN: "MXP",
  ATHENS: "ATH",
  LISBON: "LIS",
  OSLO: "OSL",
  STOCKHOLM: "ARN",
  COPENHAGEN: "CPH",
  HELSINKI: "HEL",
  WARSAW: "WAW",
  PRAGUE: "PRG",
  BUDAPEST: "BUD",
  ZURICH: "ZRH",
  NICE: "NCE",
  // Africa
  NAIROBI: "NBO",
  JOHANNESBURG: "JNB",
  "CAPE TOWN": "CPT",
  CASABLANCA: "CMN",
  TUNIS: "TUN",
  TRIPOLI: "TIP",
  ALGIERS: "ALG",
  KHARTOUM: "KRT",
  ADDIS: "ADD",
  "ADDIS ABABA": "ADD",
  LAGOS: "LOS",
  ACCRA: "ACC",
  DAKAR: "DSS",
  // Asia
  BEIJING: "PEK",
  SHANGHAI: "PVG",
  TOKYO: "NRT",
  OSAKA: "KIX",
  SINGAPORE: "SIN",
  "HONG KONG": "HKG",
  BANGKOK: "BKK",
  "KUALA LUMPUR": "KUL",
  DELHI: "DEL",
  MUMBAI: "BOM",
  CHENNAI: "MAA",
  BANGALORE: "BLR",
  KARACHI: "KHI",
  DHAKA: "DAC",
  COLOMBO: "CMB",
  KATHMANDU: "KTM",
  SEOUL: "ICN",
  TAIPEI: "TPE",
  MANILA: "MNL",
  JAKARTA: "CGK",
  HO: "SGN",
  "HO CHI MINH": "SGN",
  HANOI: "HAN",
  // Americas
  "NEW YORK": "JFK",
  "LOS ANGELES": "LAX",
  CHICAGO: "ORD",
  MIAMI: "MIA",
  DALLAS: "DFW",
  "SAN FRANCISCO": "SFO",
  HOUSTON: "IAH",
  BOSTON: "BOS",
  TORONTO: "YYZ",
  MONTREAL: "YUL",
  VANCOUVER: "YVR",
  "SAO PAULO": "GRU",
  "RIO DE JANEIRO": "GIG",
  BOGOTA: "BOG",
  LIMA: "LIM",
  SANTIAGO: "SCL",
  BUENOS: "EZE",
  "BUENOS AIRES": "EZE",
  MEXICO: "MEX",
  "MEXICO CITY": "MEX",
  // Oceania
  SYDNEY: "SYD",
  MELBOURNE: "MEL",
  BRISBANE: "BNE",
  AUCKLAND: "AKL",
};

/**
 * Resolves a user input (city name or IATA code) to a 3-letter IATA code.
 * Returns the resolved code string, or null if unrecognised.
 *
 * Examples:
 *   resolveAirportCode("CAI")    → "CAI"
 *   resolveAirportCode("cairo")  → "CAI"
 *   resolveAirportCode("London") → "LHR"
 *   resolveAirportCode("XYZ")    → "XYZ"  (unknown code — passes through)
 *   resolveAirportCode("unkn")   → null
 */
export function resolveAirportCode(input) {
  if (!input || input.trim() === "") return null;
  const upper = input.trim().toUpperCase();

  // Already a valid 3-letter IATA code — trust it (Firestore holds codes)
  if (/^[A-Z]{3}$/.test(upper)) return upper;

  // City name lookup
  return AIRPORT_LOOKUP[upper] || null;
}

/**
 * Validates an airport field that accepts either a city name or an IATA code.
 * Returns { valid, message, resolved } — resolved is the IATA code if valid.
 */
export function validateAirportInput(value, fieldName = "Airport") {
  if (!value || value.trim() === "") {
    return { valid: false, message: `${fieldName} is required.`, resolved: null };
  }

  const resolved = resolveAirportCode(value);
  if (!resolved) {
    return {
      valid: false,
      message: `${fieldName}: enter a city (e.g. Cairo) or IATA code (e.g. CAI).`,
      resolved: null,
    };
  }

  return { valid: true, message: "", resolved };
}

// ─── Auth Fields ───────────────────────────────────────────────────────────

export function validateEmail(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Email address is required." };
  }
  // Whitelist: standard email format, max 254 chars (RFC 5321)
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(value.trim())) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  if (value.length > 254) {
    return { valid: false, message: "Email address is too long." };
  }
  return { valid: true, message: "" };
}

export function validatePassword(value) {
  if (!value || value === "") {
    return { valid: false, message: "Password is required." };
  }
  if (value.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (value.length > 128) {
    return { valid: false, message: "Password is too long." };
  }
  return { valid: true, message: "" };
}

export function validateMFACode(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Verification code is required." };
  }
  // Whitelist: exactly 6 digits
  const pattern = /^\d{6}$/;
  if (!pattern.test(value.trim())) {
    return { valid: false, message: "Code must be exactly 6 digits." };
  }
  return { valid: true, message: "" };
}

// ─── Passenger / Booking Fields ────────────────────────────────────────────

export function validateFullName(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Full name is required." };
  }
  // Whitelist: letters, spaces, hyphens, apostrophes only
  const pattern = /^[a-zA-Z\s'\-]{2,80}$/;
  if (!pattern.test(value.trim())) {
    return {
      valid: false,
      message: "Name may only contain letters, spaces, hyphens, and apostrophes.",
    };
  }
  return { valid: true, message: "" };
}

export function validatePassportNumber(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Passport number is required." };
  }
  // Whitelist: alphanumeric only, 6–20 characters
  const pattern = /^[a-zA-Z0-9]{6,20}$/;
  if (!pattern.test(value.trim())) {
    return {
      valid: false,
      message: "Passport number must be 6–20 alphanumeric characters only.",
    };
  }
  return { valid: true, message: "" };
}

export function validatePhone(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Phone number is required." };
  }
  // Whitelist: digits, optional leading +, 7–15 digits (E.164 standard)
  const pattern = /^\+?[0-9]{7,15}$/;
  if (!pattern.test(value.trim())) {
    return {
      valid: false,
      message: "Phone number must be 7–15 digits, optionally starting with +.",
    };
  }
  return { valid: true, message: "" };
}

// ─── Flight Search Fields ──────────────────────────────────────────────────

export function validateAirportCode(value, fieldName = "Airport code") {
  if (!value || value.trim() === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }
  // Whitelist: exactly 3 uppercase letters (IATA code)
  const pattern = /^[A-Z]{3}$/;
  if (!pattern.test(value.trim().toUpperCase())) {
    return {
      valid: false,
      message: `${fieldName} must be a 3-letter IATA code (e.g. CAI, LHR).`,
    };
  }
  return { valid: true, message: "" };
}

export function validateTravelDate(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Travel date is required." };
  }
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selected.getTime())) {
    return { valid: false, message: "Please enter a valid date." };
  }
  if (selected < today) {
    return { valid: false, message: "Travel date must be today or in the future." };
  }
  // Reject dates more than 1 year ahead (business rule)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (selected > oneYearFromNow) {
    return { valid: false, message: "Travel date cannot be more than 1 year from now." };
  }
  return { valid: true, message: "" };
}

export function validatePassengerCount(value) {
  const num = parseInt(value, 10);
  if (isNaN(num) || value === "" || value === null) {
    return { valid: false, message: "Number of passengers is required." };
  }
  if (num < 1) {
    return { valid: false, message: "At least 1 passenger is required." };
  }
  if (num > 9) {
    return { valid: false, message: "Maximum 9 passengers per booking." };
  }
  return { valid: true, message: "" };
}

// ─── Booking Reference ─────────────────────────────────────────────────────

export function validateBookingReference(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Booking reference is required." };
  }
  // Whitelist: alphanumeric only, 6–36 chars (covers short refs and UUIDs)
  const pattern = /^[a-zA-Z0-9\-]{6,36}$/;
  if (!pattern.test(value.trim())) {
    return {
      valid: false,
      message: "Booking reference must be alphanumeric characters only.",
    };
  }
  return { valid: true, message: "" };
}

// ─── Utility ───────────────────────────────────────────────────────────────

/**
 * Runs multiple validators at once.
 * Returns an errors object: { fieldName: "error message" }
 *
 * Usage:
 *   const errors = runValidators({
 *     email: [form.email, validateEmail],
 *     password: [form.password, validatePassword],
 *   });
 */
export function runValidators(fieldMap) {
  const errors = {};
  for (const [field, [value, validator]] of Object.entries(fieldMap)) {
    const result = validator(value);
    if (!result.valid) {
      errors[field] = result.message;
    }
  }
  return errors;
}
