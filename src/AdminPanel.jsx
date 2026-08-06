import React, { useState, useEffect, createContext, useContext, memo } from "react";
import { db } from "./firebase";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ShieldCheck, Mail, Lock, LogOut, Users, Car, Navigation2,
  Loader2, TrendingUp, RefreshCw,
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
function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="rg-card rounded-2xl p-4 flex flex-col gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-tint)" }}>
        <Icon size={20} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{label}</p>
        <p className="rg-display text-3xl font-bold mt-0.5">
          {loading ? <Loader2 size={20} className="animate-spin" style={{ color: "var(--muted)" }} /> : value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Admin Dashboard ------------------------------ */
function AdminDashboardScreen({ adminEmail }) {
  const [counts, setCounts] = useState({ passengers: null, drivers: null, rides: null });
  const [connected, setConnected] = useState(true);

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
          <StatCard icon={Users} label="Passengers" value={counts.passengers} loading={counts.passengers === null} />
          <StatCard icon={Car} label="Drivers" value={counts.drivers} loading={counts.drivers === null} />
          <StatCard icon={Navigation2} label="Total Rides" value={counts.rides} loading={counts.rides === null} />
          <div className="rg-card rounded-2xl p-4 flex flex-col justify-center gap-1" style={{ background: "var(--accent-grad)", border: "none" }}>
            <TrendingUp size={20} color="#fff" />
            <p className="text-xs font-semibold text-white/85 mt-1">Live sync</p>
            <p className="text-[11px] text-white/70">Updates instantly from Firestore</p>
          </div>
        </div>

        <p className="text-[11px] mt-5" style={{ color: "var(--muted)" }}>
          Counts update live via Firestore listeners on <span className="rg-mono">{COLLECTIONS.passengers}</span>,{" "}
          <span className="rg-mono">{COLLECTIONS.drivers}</span> and <span className="rg-mono">{COLLECTIONS.rides}</span> (ride requests).
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
