import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { DUMMY_FLIGHTS } from "../utils/seedData";

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#111827",
    border: "0.5px solid #1f2a3c",
    borderRadius: "16px",
    padding: "2rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.4rem",
  },
  title: {
    fontSize: "20px",
    fontWeight: "400",
    color: "#f0ebe0",
    fontFamily: "Georgia, serif",
  },
  badge: {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#f87171",
    background: "#2a0f0f",
    border: "0.5px solid #7f1d1d",
    borderRadius: "4px",
    padding: "3px 8px",
  },
  sub: {
    fontSize: "13px",
    color: "#7a8099",
    lineHeight: "1.6",
    marginBottom: "1.75rem",
  },
  divider: { height: "0.5px", background: "#1f2a3c", marginBottom: "1.75rem" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "1.75rem",
  },
  stat: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "10px",
    padding: "12px 14px",
    textAlign: "center",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "500",
    color: "#c8a96e",
    fontFamily: "Georgia, serif",
    display: "block",
    marginBottom: "3px",
  },
  statLabel: { fontSize: "11px", color: "#7a8099" },
  btnPrimary: {
    width: "100%",
    background: "#c8a96e",
    color: "#0a0f1e",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    marginBottom: "10px",
    transition: "opacity 0.2s",
  },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed" },
  btnDanger: {
    width: "100%",
    background: "transparent",
    color: "#f87171",
    border: "0.5px solid #7f1d1d",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    marginBottom: "10px",
    transition: "opacity 0.2s",
  },
  btnSecondary: {
    width: "100%",
    background: "transparent",
    color: "#7a8099",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
  logBox: {
    background: "#0d1525",
    border: "0.5px solid #1f2a3c",
    borderRadius: "8px",
    padding: "12px 14px",
    marginTop: "1.25rem",
    maxHeight: "200px",
    overflowY: "auto",
  },
  logLine: {
    fontSize: "12px",
    fontFamily: "monospace",
    lineHeight: "1.8",
    padding: "1px 0",
  },
  progressBar: {
    height: "4px",
    background: "#1f2a3c",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "1.25rem",
  },
  progressFill: (pct) => ({
    height: "100%",
    background: "#c8a96e",
    borderRadius: "2px",
    width: `${pct}%`,
    transition: "width 0.2s",
  }),
};

const ROUTES = [...new Set(DUMMY_FLIGHTS.map((f) => `${f.from}→${f.to}`))].length;
const AIRLINES = [...new Set(DUMMY_FLIGHTS.map((f) => f.airline))].length;

export default function SeedFlights() {
  const navigate = useNavigate();
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const addLog = (msg, color = "#7a8099") =>
    setLog((prev) => [...prev, { msg, color }]);

  // ─── Seed ────────────────────────────────────────────────────────────────

  const handleSeed = async () => {
    setLoading(true);
    setDone(false);
    setLog([]);
    setProgress(0);

    addLog(`Starting seed — ${DUMMY_FLIGHTS.length} flights...`, "#c8a96e");

    try {
      for (let i = 0; i < DUMMY_FLIGHTS.length; i++) {
        const flight = DUMMY_FLIGHTS[i];
        await addDoc(collection(db, "flights"), flight);
        addLog(
          `✓ [${i + 1}/${DUMMY_FLIGHTS.length}]  ${flight.from} → ${flight.to}  ${flight.airline}  $${flight.price}`,
          "#4ade80"
        );
        setProgress(Math.round(((i + 1) / DUMMY_FLIGHTS.length) * 100));
      }
      addLog("", "#7a8099");
      addLog("✅  All flights written to Firestore.", "#4ade80");
      setDone(true);
    } catch (err) {
      addLog(`❌  Error: ${err.message}`, "#f87171");
    } finally {
      setLoading(false);
    }
  };

  // ─── Clear all flights ───────────────────────────────────────────────────

  const handleClear = async () => {
    if (!window.confirm("Delete ALL documents in the flights collection? This cannot be undone.")) return;

    setLoading(true);
    setDone(false);
    setLog([]);
    setProgress(0);

    addLog("Deleting all flights...", "#f87171");

    try {
      const snapshot = await getDocs(collection(db, "flights"));
      const total = snapshot.docs.length;

      if (total === 0) {
        addLog("Collection is already empty.", "#7a8099");
        setLoading(false);
        return;
      }

      for (let i = 0; i < snapshot.docs.length; i++) {
        await deleteDoc(doc(db, "flights", snapshot.docs[i].id));
        setProgress(Math.round(((i + 1) / total) * 100));
      }
      addLog(`✅  Deleted ${total} flight documents.`, "#4ade80");
    } catch (err) {
      addLog(`❌  Error: ${err.message}`, "#f87171");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <p style={s.title}>Flight Database Seeder</p>
          <span style={s.badge}>Dev Tool</span>
        </div>
        <p style={s.sub}>
          Populates the Firestore <code style={{ color: "#c8a96e" }}>flights</code> collection
          with dummy data. Run once — then remove this route from your app before deploying to production.
        </p>

        <div style={s.divider} />

        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statNum}>{DUMMY_FLIGHTS.length}</span>
            <span style={s.statLabel}>Flights</span>
          </div>
          <div style={s.stat}>
            <span style={s.statNum}>{ROUTES}</span>
            <span style={s.statLabel}>Routes</span>
          </div>
          <div style={s.stat}>
            <span style={s.statNum}>{AIRLINES}</span>
            <span style={s.statLabel}>Airlines</span>
          </div>
        </div>

        {(loading || progress > 0) && (
          <div style={s.progressBar}>
            <div style={s.progressFill(progress)} />
          </div>
        )}

        <button
          style={{ ...s.btnPrimary, ...(loading ? s.btnDisabled : {}) }}
          onClick={handleSeed}
          disabled={loading}
        >
          {loading ? `Seeding... ${progress}%` : done ? "✓ Seeded — Run again to add more" : `Seed ${DUMMY_FLIGHTS.length} flights →`}
        </button>

        <button
          style={{ ...s.btnDanger, ...(loading ? s.btnDisabled : {}) }}
          onClick={handleClear}
          disabled={loading}
        >
          Clear flights collection
        </button>

        <button style={s.btnSecondary} onClick={() => navigate("/search")}>
          Back to flight search
        </button>

        {log.length > 0 && (
          <div style={s.logBox}>
            {log.map((entry, i) => (
              <div key={i} style={{ ...s.logLine, color: entry.color }}>
                {entry.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
