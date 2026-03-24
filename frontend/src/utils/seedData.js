// seedData.js
// All dummy flights. Each object maps 1:1 to a Firestore document in the "flights" collection.
// Fields match exactly what SearchFlights.jsx and BookingForm.jsx expect.

export const DUMMY_FLIGHTS = [
  // ─── Cairo (CAI) departures ─────────────────────────────────────────────
  {
    from: "CAI", to: "LHR", dep: "08:15", arr: "13:40",
    duration: "5h 25m", stops: "Direct", airline: "EgyptAir",
    price: 420, seats: 18,
  },
  {
    from: "CAI", to: "LHR", dep: "14:30", arr: "19:55",
    duration: "5h 25m", stops: "Direct", airline: "British Airways",
    price: 465, seats: 9,
  },
  {
    from: "CAI", to: "LHR", dep: "22:00", arr: "03:25+1",
    duration: "5h 25m", stops: "Direct", airline: "EgyptAir",
    price: 390, seats: 3,
  },
  {
    from: "CAI", to: "CDG", dep: "07:45", arr: "11:50",
    duration: "4h 05m", stops: "Direct", airline: "Air France",
    price: 395, seats: 14,
  },
  {
    from: "CAI", to: "CDG", dep: "23:10", arr: "03:15+1",
    duration: "4h 05m", stops: "Direct", airline: "EgyptAir",
    price: 360, seats: 22,
  },
  {
    from: "CAI", to: "DXB", dep: "06:00", arr: "10:15",
    duration: "4h 15m", stops: "Direct", airline: "Emirates",
    price: 280, seats: 31,
  },
  {
    from: "CAI", to: "DXB", dep: "13:20", arr: "17:35",
    duration: "4h 15m", stops: "Direct", airline: "flydubai",
    price: 210, seats: 7,
  },
  {
    from: "CAI", to: "DXB", dep: "20:45", arr: "01:00+1",
    duration: "4h 15m", stops: "Direct", airline: "EgyptAir",
    price: 195, seats: 44,
  },
  {
    from: "CAI", to: "IST", dep: "09:30", arr: "12:45",
    duration: "3h 15m", stops: "Direct", airline: "Turkish Airlines",
    price: 175, seats: 19,
  },
  {
    from: "CAI", to: "IST", dep: "16:00", arr: "19:15",
    duration: "3h 15m", stops: "Direct", airline: "Pegasus",
    price: 148, seats: 5,
  },
  {
    from: "CAI", to: "FRA", dep: "07:00", arr: "11:25",
    duration: "4h 25m", stops: "Direct", airline: "Lufthansa",
    price: 410, seats: 11,
  },
  {
    from: "CAI", to: "FRA", dep: "11:50", arr: "16:15",
    duration: "4h 25m", stops: "Direct", airline: "EgyptAir",
    price: 388, seats: 26,
  },
  {
    from: "CAI", to: "AMS", dep: "10:00", arr: "14:30",
    duration: "4h 30m", stops: "Direct", airline: "KLM",
    price: 405, seats: 8,
  },
  {
    from: "CAI", to: "RUH", dep: "08:50", arr: "12:05",
    duration: "3h 15m", stops: "Direct", airline: "Saudia",
    price: 220, seats: 33,
  },
  {
    from: "CAI", to: "DOH", dep: "05:30", arr: "08:45",
    duration: "3h 15m", stops: "Direct", airline: "Qatar Airways",
    price: 245, seats: 15,
  },
  {
    from: "CAI", to: "DOH", dep: "18:00", arr: "21:15",
    duration: "3h 15m", stops: "Direct", airline: "Qatar Airways",
    price: 260, seats: 20,
  },
  {
    from: "CAI", to: "JFK", dep: "01:30", arr: "09:15",
    duration: "12h 45m", stops: "1 stop", airline: "EgyptAir",
    price: 890, seats: 6,
  },
  {
    from: "CAI", to: "JFK", dep: "14:00", arr: "22:30",
    duration: "13h 30m", stops: "1 stop", airline: "Qatar Airways",
    price: 970, seats: 12,
  },
  {
    from: "CAI", to: "NBO", dep: "07:30", arr: "13:50",
    duration: "6h 20m", stops: "Direct", airline: "EgyptAir",
    price: 310, seats: 28,
  },
  {
    from: "CAI", to: "CMN", dep: "09:15", arr: "13:00",
    duration: "3h 45m", stops: "Direct", airline: "Royal Air Maroc",
    price: 185, seats: 17,
  },
  {
    from: "CAI", to: "AMM", dep: "11:00", arr: "12:30",
    duration: "1h 30m", stops: "Direct", airline: "Royal Jordanian",
    price: 130, seats: 39,
  },
  {
    from: "CAI", to: "BEY", dep: "08:20", arr: "09:40",
    duration: "1h 20m", stops: "Direct", airline: "MEA",
    price: 115, seats: 24,
  },
  {
    from: "CAI", to: "ATH", dep: "10:10", arr: "12:20",
    duration: "2h 10m", stops: "Direct", airline: "Aegean",
    price: 165, seats: 13,
  },
  {
    from: "CAI", to: "MAD", dep: "06:30", arr: "11:10",
    duration: "4h 40m", stops: "Direct", airline: "Iberia",
    price: 430, seats: 9,
  },
  {
    from: "CAI", to: "MXP", dep: "07:55", arr: "11:30",
    duration: "3h 35m", stops: "Direct", airline: "ITA Airways",
    price: 355, seats: 21,
  },

  // ─── Hurghada (HRG) routes ──────────────────────────────────────────────
  {
    from: "HRG", to: "LHR", dep: "09:00", arr: "14:15",
    duration: "5h 15m", stops: "Direct", airline: "EasyJet",
    price: 290, seats: 34,
  },
  {
    from: "HRG", to: "FRA", dep: "11:30", arr: "15:50",
    duration: "4h 20m", stops: "Direct", airline: "Condor",
    price: 275, seats: 16,
  },
  {
    from: "HRG", to: "AMS", dep: "14:00", arr: "18:25",
    duration: "4h 25m", stops: "Direct", airline: "TUI fly",
    price: 285, seats: 8,
  },
  {
    from: "HRG", to: "CAI", dep: "06:00", arr: "07:05",
    duration: "1h 05m", stops: "Direct", airline: "EgyptAir",
    price: 65, seats: 42,
  },
  {
    from: "HRG", to: "DXB", dep: "15:00", arr: "19:05",
    duration: "4h 05m", stops: "Direct", airline: "flydubai",
    price: 195, seats: 11,
  },

  // ─── Sharm El-Sheikh (SSH) routes ───────────────────────────────────────
  {
    from: "SSH", to: "LHR", dep: "10:00", arr: "14:55",
    duration: "4h 55m", stops: "Direct", airline: "TUI Airways",
    price: 305, seats: 22,
  },
  {
    from: "SSH", to: "CDG", dep: "08:30", arr: "12:20",
    duration: "3h 50m", stops: "Direct", airline: "Transavia",
    price: 270, seats: 14,
  },
  {
    from: "SSH", to: "CAI", dep: "07:00", arr: "08:00",
    duration: "1h 00m", stops: "Direct", airline: "EgyptAir",
    price: 60, seats: 48,
  },
  {
    from: "SSH", to: "IST", dep: "12:00", arr: "14:55",
    duration: "2h 55m", stops: "Direct", airline: "Turkish Airlines",
    price: 145, seats: 19,
  },

  // ─── Dubai (DXB) → popular destinations ────────────────────────────────
  {
    from: "DXB", to: "CAI", dep: "09:00", arr: "11:15",
    duration: "4h 15m", stops: "Direct", airline: "Emirates",
    price: 275, seats: 27,
  },
  {
    from: "DXB", to: "LHR", dep: "08:30", arr: "13:05",
    duration: "7h 35m", stops: "Direct", airline: "Emirates",
    price: 520, seats: 10,
  },
  {
    from: "DXB", to: "JFK", dep: "02:45", arr: "10:30",
    duration: "13h 45m", stops: "Direct", airline: "Emirates",
    price: 980, seats: 5,
  },

  // ─── London (LHR) → Cairo / other ──────────────────────────────────────
  {
    from: "LHR", to: "CAI", dep: "09:30", arr: "15:00",
    duration: "5h 30m", stops: "Direct", airline: "British Airways",
    price: 445, seats: 17,
  },
  {
    from: "LHR", to: "CAI", dep: "20:00", arr: "01:30+1",
    duration: "5h 30m", stops: "Direct", airline: "EgyptAir",
    price: 410, seats: 30,
  },
  {
    from: "LHR", to: "DXB", dep: "21:00", arr: "07:30+1",
    duration: "6h 30m", stops: "Direct", airline: "Emirates",
    price: 510, seats: 8,
  },
  {
    from: "LHR", to: "IST", dep: "11:00", arr: "16:00",
    duration: "3h 00m", stops: "Direct", airline: "Turkish Airlines",
    price: 195, seats: 23,
  },

  // ─── Istanbul (IST) routes ──────────────────────────────────────────────
  {
    from: "IST", to: "CAI", dep: "13:30", arr: "16:45",
    duration: "3h 15m", stops: "Direct", airline: "Turkish Airlines",
    price: 170, seats: 25,
  },
  {
    from: "IST", to: "LHR", dep: "07:00", arr: "09:55",
    duration: "2h 55m", stops: "Direct", airline: "Turkish Airlines",
    price: 190, seats: 14,
  },
  {
    from: "IST", to: "JFK", dep: "18:00", arr: "22:45",
    duration: "10h 45m", stops: "Direct", airline: "Turkish Airlines",
    price: 750, seats: 9,
  },

  // ─── Doha (DOH) routes ──────────────────────────────────────────────────
  {
    from: "DOH", to: "CAI", dep: "07:00", arr: "10:15",
    duration: "3h 15m", stops: "Direct", airline: "Qatar Airways",
    price: 240, seats: 18,
  },
  {
    from: "DOH", to: "LHR", dep: "10:00", arr: "16:15",
    duration: "6h 15m", stops: "Direct", airline: "Qatar Airways",
    price: 580, seats: 6,
  },
  {
    from: "DOH", to: "JFK", dep: "01:10", arr: "08:55",
    duration: "13h 45m", stops: "Direct", airline: "Qatar Airways",
    price: 1050, seats: 4,
  },
];
