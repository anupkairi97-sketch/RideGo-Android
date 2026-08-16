   import React, { useState, useEffect, createContext, useContext, memo } from "react";
import { db } from "./firebase";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import {
  ShieldCheck, Mail, Lock, LogOut, Users, Car, Navigation2,
  Loader2, TrendingUp, RefreshCw, ArrowLeft, Star, MapPin,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Collection names — match project's existing Firestore structure   */
/*  (see firebase.js: savePassenger / saveDriver / createRideRequest) */
/* ------------------------------------------------------------------ */
const COLLECTIONS = {
  passengers: "passengers",
  drivers: "drivers",
  rides: "rideRequests",
};

/* ------------------------------ Firebase ------------------------------ */
const auth = getAuth();

/* ------------------------------ Theme (matches app) ------------------------------ */
const BASE_THEME = {
  light: { "--bg": "#F6F5F3", "--surface": "#FFFFFF", "--surface-2": "#F3F1EF", "--ink": "#181414", "--muted": "#726B68", "--border": "#EAE5E1", "--amber": "#F2A93B", "--red": "#E23D3D", "--shadow": "0 14px 34px -14px rgba(24,20,20,0.22)" },
};
const ADMIN_ACCENT = { "--accent": "#2563EB", "--accent-dark": "#1D4ED8", "--accent-tint": "#E6EEFE", "--accent-grad": "linear-gradient(135deg,#60A5FA 0%,#2563EB 55%,#1D4ED8 100%)" };

function AdminFontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      * { box-sizing: border-box; }
      .rg-root { font-family: 'Inter', sans-serif; color: var(--ink); background: var(--bg); }
      .rg-display { font-family: 'Space Grotesk', sans-serif; }
      .rg-mono { font-family: 'IBM Plex Mono', monospace; }
      @keyframes rg-fadeup { from { opacity:0; transform: translateY(14px) scale(0.99);} to {opacity:1; transform: translateY(0) scale(1);} }
      .rg-anim-in { animation: rg-fadeup .38s cubic-bezier(.2,.8,.2,1) both; }
      input:focus, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      .rg-card { background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow); }
    `}</style>
  );
}

/* ------------------------------ Primitives (matches app) ------------------------------ */
const Btn = memo(function Btn({ children, variant = "primary", className = "", ...props }) {
  const base = "w-full rounded-2xl py-3.5 font-semibold text-[15px] transition-transform active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100";
  const styles = {
    primary: { background: "var(--accent-grad)", color: "#fff", boxShadow: "0 10px 24px -10px var(--accent)" },
    outline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--border)" },
    ghost: { background: "var(--surface-2)", color: "var(--ink)" },
  };
  return <button className={`${base} ${className}`} style={styles[variant]} {...props}>{children}</button>;
});

const Field = memo(function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      {Icon && <Icon size={18} style={{ color: "var(--muted)" }} />}
      <input className="w-full bg-transparent outline-none text-[15px]" style={{ color: "var(--ink)" }} {...props} />
    </div>
  );
});

/* ------------------------------ Admin Login ------------------------------ */
function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setLoading(false);
      const msg =
        e?.code === "auth/invalid-credential" || e?.code === "auth/wrong-password" || e?.code === "auth/user-not-found"
          ? "Invalid email or password."
          : e?.message || "Could not log in. Try again.";
      setError(msg);
    }
  };

  return (
    <div className="flex flex-col h-full px-6 justify-center rg-anim-in">
      <div className="flex flex-col items-center text-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1" style={{ background: "var(--accent-grad)", boxShadow: "0 14px 30px -10px var(--accent)" }}>
          <ShieldCheck size={30} color="#fff" />
        </div>
        <h1 className="rg-display text-2xl font-bold">RideGo Admin</h1>
        <p style={{ color: "var(--muted)" }} className="text-[15px]">Sign in to the control panel</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Email</label>
        <Field icon={Mail} type="email" placeholder="admin@ridego.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "var(--muted)" }}>Password</label>
        <Field icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}
        <Btn disabled={!email || !password || loading} onClick={handleLogin} className="mt-2">
          {loading ? <Loader2 size={17} className="animate-spin" /> : "Log In"}
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------ Stat Card ------------------------------ */
function StatCard({ icon: Icon, label, value, loading, onClick }) {
  return (
    <button onClick={onClick} className="rg-card rounded-2xl p-4 flex flex-col gap-3 text-left transition-transform active:scale-[0.97]">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-tint)" }}>
        <Icon size={20} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{label}</p>
        <p className="rg-display text-3xl font-bold mt-0.5">
          {loading ? <Loader2 size={20} className="animate-spin" style={{ color: "var(--muted)" }} /> : value}
        </p>
      </div>
    </button>
  );
}

/* ------------------------------ Detail List screens ------------------------------ */
function ListHeader({ title, count, onBack }) {
  return (
    <div className="px-5 pt-5 pb-3 flex items-center gap-3 shrink-0">
      <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)" }}>
        <ArrowLeft size={17} />
      </button>
      <div className="flex-1">
        <h1 className="rg-display text-lg font-bold">{title}</h1>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{count == null ? "Loading…" : `${count} total`}</p>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>No {label} yet.</p>;
}

function PassengersListScreen({ onBack }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.passengers),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Passengers list error:", err)
    );
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <ListHeader title="Passengers" count={items?.length} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {items?.length === 0 && <EmptyState label="passengers" />}
        {items?.map((p) => (
          <div key={p.id} className="rg-card rounded-2xl p-3.5 mb-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center rg-display font-bold shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
              {(p.name || "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{p.name || "Unnamed"}</p>
              <p className="text-xs rg-mono" style={{ color: "var(--muted)" }}>{p.mobile}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
              <Star size={12} fill="var(--amber)" color="var(--amber)" /> {p.rating || "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriversListScreen({ onBack }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.drivers),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Drivers list error:", err)
    );
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <ListHeader title="Drivers" count={items?.length} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {items?.length === 0 && <EmptyState label="drivers" />}
        {items?.map((d) => (
          <div key={d.id} className="rg-card rounded-2xl p-3.5 mb-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center rg-display font-bold shrink-0" style={{ background: "var(--accent-grad)", color: "#fff" }}>
              {(d.name || "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{d.name || "Unnamed"}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {d.vehicleName || "—"} · <span className="rg-mono">{d.plate || "—"}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: d.online ? "#DCFCE7" : "var(--surface-2)", color: d.online ? "#15803D" : "var(--muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.online ? "#22C55E" : "var(--muted)" }} />
                {d.online ? "Online" : "Offline"}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold"><Star size={11} fill="var(--amber)" color="var(--amber)" /> {d.rating || "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const RIDE_STATUS_STYLE = {
  searching: { bg: "#FEF3C7", fg: "#92400E", label: "Searching" },
  accepted: { bg: "#DBEAFE", fg: "#1D4ED8", label: "Accepted" },
  arrived: { bg: "#DBEAFE", fg: "#1D4ED8", label: "Arrived" },
  ontrip: { bg: "#DCFCE7", fg: "#15803D", label: "On trip" },
  completed: { bg: "#F3F1EF", fg: "#726B68", label: "Completed" },
  cancelled: { bg: "#FEE2E2", fg: "#B91C1C", label: "Cancelled" },
};

function RidesListScreen({ onBack }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.rides), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Rides list error:", err)
    );
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <ListHeader title="Rides" count={items?.length} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {items?.length === 0 && <EmptyState label="rides" />}
        {items?.length === 50 && (
          <p className="text-[11px] text-center mb-2" style={{ color: "var(--muted)" }}>Showing the 50 most recent rides</p>
        )}
        {items?.map((r) => {
          const s = RIDE_STATUS_STYLE[r.status] || { bg: "var(--surface-2)", fg: "var(--muted)", label: r.status || "Unknown" };
          return (
            <div key={r.id} className="rg-card rounded-2xl p-3.5 mb-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                <span className="font-bold text-sm">₹{r.fare ?? "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }} />
                <div className="min-w-0">
                  <p className="truncate">{r.pickup || "—"}</p>
                  <p className="truncate" style={{ color: "var(--muted)" }}>→ {r.drop || "—"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                <span>{r.passenger || "Passenger"}{r.driverName ? ` · ${r.driverName}` : ""}</span>
                <span className="rg-mono">{r.distanceKm ? `${Number(r.distanceKm).toFixed(1)} km` : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Admin Dashboard ------------------------------ */
function AdminDashboardScreen({ adminEmail }) {
  const [counts, setCounts] = useState({ passengers: null, drivers: null, rides: null });
  const [connected, setConnected] = useState(true);
  const [view, setView] = useState("dashboard"); // dashboard | passengers | drivers | rides

  useEffect(() => {
    const unsubs = Object.entries(COLLECTIONS).map(([key, colName]) =>
      onSnapshot(
        collection(db, colName),
        (snap) => {
          setConnected(true);
          setCounts((prev) => ({ ...prev, [key]: snap.size }));
        },
        (err) => {
          console.error(`Live count error for "${colName}":`, err);
          setConnected(false);
        }
      )
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  if (view === "passengers") return <PassengersListScreen onBack={() => setView("dashboard")} />;
  if (view === "drivers") return <DriversListScreen onBack={() => setView("dashboard")} />;
  if (view === "rides") return <RidesListScreen onBack={() => setView("dashboard")} />;

  return (
    <div className="flex flex-col h-full rg-anim-in">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between shrink-0">
        <div>
          <h1 className="rg-display text-xl font-bold">Admin Dashboard</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>{adminEmail}</p>
        </div>
        <button onClick={() => signOut(auth)} aria-label="Log out" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
          <LogOut size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-8">
        {!connected && (
          <div className="rounded-xl px-3 py-2 mb-3 text-xs flex items-center gap-2" style={{ background: "var(--accent-tint)", color: "var(--accent-dark)" }}>
            <RefreshCw size={13} /> Reconnecting to live data…
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} label="Passengers" value={counts.passengers} loading={counts.passengers === null} onClick={() => setView("passengers")} />
          <StatCard icon={Car} label="Drivers" value={counts.drivers} loading={counts.drivers === null} onClick={() => setView("drivers")} />
          <StatCard icon={Navigation2} label="Total Rides" value={counts.rides} loading={counts.rides === null} onClick={() => setView("rides")} />
          <div className="rg-card rounded-2xl p-4 flex flex-col justify-center gap-1" style={{ background: "var(--accent-grad)", border: "none" }}>
            <TrendingUp size={20} color="#fff" />
            <p className="text-xs font-semibold text-white/85 mt-1">Live sync</p>
            <p className="text-[11px] text-white/70">Updates instantly from Firestore</p>
          </div>
        </div>

        <p className="text-[11px] mt-5" style={{ color: "var(--muted)" }}>
          Tap a card above to see the live list. Counts update via Firestore listeners on{" "}
          <span className="rg-mono">{COLLECTIONS.passengers}</span>, <span className="rg-mono">{COLLECTIONS.drivers}</span> and{" "}
          <span className="rg-mono">{COLLECTIONS.rides}</span> (ride requests).
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Root ------------------------------ */
export default function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = logged out
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const vars = { ...BASE_THEME.light, ...ADMIN_ACCENT };

  return (
    <div className="rg-root w-full h-screen flex items-center justify-center" style={{ ...vars, background: "#EDEAE7" }}>
      <AdminFontStyles />
      <div className="relative w-full h-full sm:h-[850px] sm:w-[400px] sm:rounded-[2.5rem] overflow-hidden flex flex-col" style={{ background: "var(--bg)", boxShadow: "var(--shadow)" }}>
        {user === undefined ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} /></div>
        ) : user ? (
          <AdminDashboardScreen adminEmail={user.email} />
        ) : (
          <AdminLoginScreen />
        )}
      </div>
    </div>
  );
}
       
