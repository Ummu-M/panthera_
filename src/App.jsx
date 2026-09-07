'use client';

import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Calendar,
  Award,
  DollarSign,
  Package,
  MoreHorizontal,
  LogOut,
  MapPin,
  Clock,
  Mail,
  Plus,
  Trash2,
  Check,
  X,
  Upload,
  Paperclip,
  Compass,
  Wrench,
  Shield,
  FileText,
  Heart,
  Globe,
  Handshake,
  Apple,
  Drama,
  Accessibility,
  Mountain,
  Activity,
  Ambulance,
  Droplet,
  Laptop,
  TreePine,
  Bell
} from "lucide-react";

const C = {
  gold: "#E8B84B",
  dkGold: "#C49A2A",
  dark: "#1E2228",
  panel: "#252B35",
  border: "#353D4A",
  muted: "#8A9BB5",
  text: "#D8DCE5",
  green: "#3DD68C",
  red: "#FF6B6B",
};

const S = {
  phone: {
    width: 393,
    height: 852,
    background: C.dark,
    borderRadius: 50,
    border: "2px solid #242424",
    boxShadow: "0 20px 60px rgba(0,0,0,.5)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI',sans-serif",
    color: C.text,
    margin: "30px auto",
  },
  notch: {
    width: 126,
    height: 36,
    background: "#000",
    borderRadius: "0 0 22px 22px",
    margin: "0 auto",
  },
  topBar: {
    padding: "12px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(8,8,8,.88)",
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  scroll: { padding: "14px 18px 140px", overflowY: "auto", maxHeight: 760 },
  card: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,.04)",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  btnGold: {
    border: "none",
    borderRadius: 12,
    padding: "12px 0",
    width: "100%",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    cursor: "pointer",
    background: `linear-gradient(135deg,${C.gold},${C.dkGold})`,
    color: "#000",
  },
  btnOutline: {
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "12px 0",
    width: "100%",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: "transparent",
    color: C.text,
  },
  secLabel: {
    fontSize: 10,
    letterSpacing: ".2em",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: 8,
  },
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(8,8,8,.97)",
    borderTop: `1px solid ${C.border}`,
    display: "flex",
    padding: "8px 0 20px",
    zIndex: 10,
  },
  modalOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,.7)",
    display: "flex",
    alignItems: "flex-end",
    zIndex: 20,
  },
  modal: {
    background: "#1A1F28",
    borderRadius: "20px 20px 0 0",
    padding: "24px 20px 32px",
    width: "100%",
    maxHeight: "80%",
    overflowY: "auto",
  },
};

const DEFAULT_APP_DATA = {
  pending: [],
  approved: [],
  rejected: [],
  scouts: [],
  finances: [],
  inventory: [],
  projects: [],
  badgeReports: [],
  awardedBadges: [],
  announcements: [],
  notifications: [],
  events: [
    {
      id: "ev-1",
      title: "Weekly Crew Meeting & Drills",
      date: "Every Wednesday",
      time: "5:00 PM",
      location: "Kenyatta University Bishop Square",
      tag: "Regular",
      desc: "Weekly gathering for skills training, crew coordination, and fellowship."
    }
  ],
  gallery: [
    { id: "g-1", url: "/panthera-crew.jpg", caption: "Panthera Rover Crew circle fellowship" },
    { id: "g-2", url: "/community-service.jpg", caption: "Community service & environmental cleanup" }
  ]
};

const DEFAULT_USER = {
  name: "",
  email: "",
  phone: "",
  regno: "",
  uni: "Kenyatta University",
  year: "",
};

async function loadAppData(token) {
  const response = await fetch("/api/state", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Could not load Panthera data.");
  return { ...DEFAULT_APP_DATA, ...(await response.json()) };
}

async function saveAppData(data, token) {
  const response = await fetch("/api/state", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Could not save Panthera data.");
  return response.json();
}

function roleScreen(role) {
  if (!role) return "landing";
  if (role === "MEMBER") return "member";
  return "admin";
}

const Logo = ({ size = 28 }) => (
  <img
    src="/pantheralogo.png"
    alt="Panthera Logo"
    style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
  />
);

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        padding: "4px 0",
      }}
    >
      <Icon size={20} color={active ? C.gold : C.muted} />
      <span style={{ fontSize: 9, color: active ? C.gold : C.muted, letterSpacing: ".04em" }}>{label}</span>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, opacity: active ? 1 : 0 }} />
    </div>
  );
}

function TopBar({ title, right }) {
  return (
    <div style={S.topBar}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={28} />
        <span style={{ fontWeight: 900, fontSize: 16, color: C.gold, letterSpacing: ".04em" }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{title}</span>
          <span onClick={onClose} style={{ cursor: "pointer", color: C.muted }}><X size={20} /></span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 10px", textAlign: "center", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
        <Icon size={20} color={color || C.gold} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 18, color: color || C.gold }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  PUBLIC · LANDING
// ══════════════════════════════════════════════
function Landing({ setScreen, events = [], gallery = [] }) {
  const leadership = [
    { role: "Jasiri Scout Leader", name: "Dr. David Muigai" },
    { role: "Assistant JSL", name: "Nicolas Mwangi" },
    { role: "Crew Leader", name: "Horas Obutinda" },
    { role: "Assistant Crew Leader", name: "Charles Njuguna" },
    { role: "Quartermaster", name: "Sharon Juma" },
    { role: "Scribe", name: "Sheiline Jerop" },
    { role: "Organising Secretary", name: "Justus Kipchirchir" },
    { role: "Disciplinarian", name: "Romelse Akoyo" },
    { role: "Treasurer", name: "Ummuayman Mohamed" },
  ];

  return (
    <div style={{ overflowY: "auto", maxHeight: 780, paddingBottom: 40 }}>
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(160deg,#060C06,#0C180C,#080D08)", padding: "36px 24px 28px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", margin: "0 auto 14px", boxShadow: `0 0 0 2px ${C.gold},0 0 36px rgba(212,160,23,.3)` }}>
          <img src="/pantheralogo.png" alt="Panthera Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 30, color: C.gold, lineHeight: 1.1 }}>PANTHERA ROVER CREW</div>
        <div style={{ fontSize: 11, letterSpacing: ".22em", color: C.muted, textTransform: "uppercase", marginTop: 6 }}>
          Rover Crew · Kenya
        </div>
        <div style={{ fontSize: 11, color: C.green, margin: "4px 0 14px", opacity: 0.9 }}>
          Kenyatta University Scouts Troop
        </div>
        <div style={{ background: "rgba(212,160,23,.07)", border: "1px solid rgba(212,160,23,.18)", borderRadius: 12, padding: "10px 14px", fontStyle: "italic", fontSize: 13, color: C.gold, marginBottom: 18 }}>
          "Scouting for the Young and the Young at Heart"
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setScreen("register")} style={{ flex: 1, ...S.btnGold, borderRadius: 12, padding: 12, fontSize: 13 }}>
            Join the Crew
          </button>
          <button
            onClick={() => setScreen("login")}
            style={{
              flex: 1,
              border: `1px solid rgba(212,160,23,.35)`,
              borderRadius: 12,
              padding: 12,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: "transparent",
              color: C.gold,
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            Sign In
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        {/* Weekly Fellowship Card */}
        <div style={{ background: "rgba(61,214,140,.08)", border: "1px solid rgba(61,214,140,.3)", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <MapPin size={24} color={C.green} />
          <div>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12 }}>Weekly Crew Fellowship</div>
            <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Every Wednesday • From 5:00 PM</div>
            <div style={{ fontSize: 11, color: C.muted }}>Kenyatta University, Bishop Square</div>
          </div>
        </div>

        {/* Stats */}
        <div style={S.secLabel}>Crew Highlights</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { label: "Active Rovers", val: "50+", icon: Users },
            { label: "Years Active", val: "6+", icon: Shield },
            { label: "Projects", val: "10+", icon: Award }
          ].map((item) => (
            <div key={item.label} style={{ ...S.card, flex: 1, textAlign: "center", marginBottom: 0, padding: "12px 6px" }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: C.gold }}>{item.val}</div>
              <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Gallery Preview */}
        {gallery.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={S.secLabel}>Crew Moments</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {gallery.map((img) => (
                <div key={img.id} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, background: C.panel }}>
                  <img src={img.url} alt={img.caption || "Crew image"} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                  {img.caption && <div style={{ fontSize: 10, color: C.muted, padding: "6px 8px", lineHeight: 1.3 }}>{img.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities & Upcoming Events */}
        <div style={S.secLabel}>Events & Schedule</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {events.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", fontSize: 12, color: C.muted }}>No upcoming events scheduled right now.</div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} style={{ ...S.card, marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{ev.title}</div>
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(212,160,23,.15)", color: C.gold, fontWeight: 700 }}>
                    {ev.tag || "Event"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.green, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} /> {ev.date} {ev.time && `• ${ev.time}`}
                </div>
                <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {ev.location}
                </div>
                {ev.desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 6, borderTop: `1px dashed ${C.border}`, paddingTop: 6 }}>{ev.desc}</div>}
              </div>
            ))
          )}
        </div>

        {/* Leadership */}
        <div style={S.secLabel}>Crew Leadership & Patrons</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {leadership.map((item, i) => (
            <div key={i} style={{ ...S.card, marginBottom: 0, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: C.gold, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>{item.role}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 3 }}>{item.name}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg,rgba(212,160,23,.12),rgba(26,107,58,.1))", border: "1px solid rgba(212,160,23,.25)", borderRadius: 14, padding: 16, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.gold, marginBottom: 4 }}>Ready to Join the Crew?</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
            Sign up with your KU registration number to start your Jasiri Rover progression.
          </div>
          <button style={S.btnGold} onClick={() => setScreen("register")}>
            Register as a Rover →
          </button>
        </div>

        {/* Footer & Contacts */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>Panthera Rover Crew</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 3, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
            <Mail size={13} /> <a href="mailto:kupantherascouts@gmail.com" style={{ color: C.gold, textDecoration: "none" }}>kupantherascouts@gmail.com</a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10 }}>
            <a href="https://www.instagram.com/ku_scouts_panthera?igsh=a29lOHNrdGFpMHp1" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 12, textDecoration: "none" }}>
              Instagram
            </a>
            <span style={{ color: C.border }}>•</span>
            <a href="https://www.tiktok.com/@kenyatta.universi5?_r=1&_t=ZS-98zH5Ox4n8H" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 12, textDecoration: "none" }}>
              TikTok
            </a>
          </div>
          <div style={{ fontSize: 10, color: C.muted, opacity: 0.6, marginTop: 10 }}>Kenyatta University • Kenya Scouts Association</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  PUBLIC · LOGIN
// ══════════════════════════════════════════════
function Login({ setScreen, onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  return (
    <div style={{ minHeight: 780, background: "linear-gradient(160deg,#060C06,#0C180C,#080D08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 28px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", boxShadow: `0 0 0 2px ${C.gold},0 0 24px rgba(212,160,23,.3)` }}>
        <img src="/pantheralogo.png" alt="Panthera" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 32, color: C.gold, marginBottom: 3 }}>PANTHERA</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>Sign in to your crew account</div>
      <div style={{ width: "100%" }}>
        <Field label="Full Name (optional)">
          <input style={S.input} type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email Address">
          <input style={S.input} type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <button
          style={{ ...S.btnGold, marginTop: 4 }}
          onClick={() => {
            if (!email) return alert("Please enter your email.");
            onLogin({ name, email });
          }}
        >
          SIGN IN
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 12 }}>
          New rover? <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => setScreen("register")}>Create account →</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ color: C.muted, fontSize: 13, cursor: "pointer" }} onClick={() => setScreen("landing")}>← View public page</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  PUBLIC · REGISTER
// ══════════════════════════════════════════════
function Register({ setScreen, onRegister }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", regno: "", year: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ overflowY: "auto", maxHeight: 780 }}>
      <div style={{ background: "linear-gradient(160deg,#060C06,#0C180C)", padding: "16px 22px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ color: C.muted, fontSize: 13, cursor: "pointer", marginBottom: 8 }} onClick={() => setScreen("landing")}>← Back</div>
        <div style={{ fontWeight: 900, fontSize: 24, color: C.gold }}>Join Panthera Rover Crew</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Kenyatta University Scouts Crew</div>
      </div>
      <div style={{ padding: "18px 22px 40px" }}>
        {[["name", "Full Name *", "e.g. Ummu Omar", "text"], ["email", "Email *", "your@email.com", "email"], ["phone", "Phone *", "+254 7XX XXX XXX", "tel"], ["regno", "School Reg. No. *", "e.g. I34/4793/2024", "text"]].map(([k, lbl, ph, type]) => (
          <Field key={k} label={lbl}>
            <input style={S.input} type={type} placeholder={ph} value={f[k]} onChange={set(k)} />
          </Field>
        ))}
        <Field label="Year of Study">
          <select style={{ ...S.input, background: C.panel }} value={f.year} onChange={set("year")}>
            <option value="">Select year…</option>
            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        <div style={{ background: "rgba(212,160,23,.06)", border: "1px solid rgba(212,160,23,.15)", borderRadius: 11, padding: "10px 13px", marginBottom: 13, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          ℹ️ A crew leader will verify your registration number before your account is activated.
        </div>
        <button
          style={S.btnGold}
          onClick={() => {
            if (!f.name || !f.email || !f.phone || !f.regno) return alert("Please fill in all required fields (*).");
            onRegister(f);
          }}
        >
          SUBMIT REGISTRATION
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 12 }}>
          Already a member? <span style={{ color: C.gold, cursor: "pointer" }} onClick={() => setScreen("login")}>Sign in →</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  PUBLIC · PENDING
// ══════════════════════════════════════════════
function Pending({ pendingId, setScreen }) {
  return (
    <div style={{ minHeight: 780, background: "linear-gradient(160deg,#060C06,#0C180C)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 26px", textAlign: "center" }}>
      <Award size={56} color={C.gold} style={{ marginBottom: 14 }} />
      <div style={{ fontWeight: 900, fontSize: 22, color: C.gold, marginBottom: 8 }}>Registration Submitted!</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
        Your application has been sent to the crew leader for review. You'll be contacted once your scout registration number is verified.
      </div>
      <div style={{ background: C.panel, border: "1px solid rgba(212,160,23,.3)", borderRadius: 13, padding: "12px 22px", fontSize: 17, letterSpacing: ".15em", color: C.gold, marginBottom: 18 }}>
        {pendingId}
      </div>
      <button style={{ ...S.btnOutline, width: 200, padding: 12, fontSize: 13 }} onClick={() => setScreen("login")}>
        Go to Sign In
      </button>
      <span style={{ color: C.muted, fontSize: 13, cursor: "pointer", marginTop: 12 }} onClick={() => setScreen("landing")}>
        ← Back to crew page
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · HOME
// ══════════════════════════════════════════════
function AdminHome({ pending, scouts, finances, inventory }) {
  const income = finances.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expense = finances.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  return (
    <div>
      <TopBar title="ADMIN DASHBOARD" right={null} />
      <div style={S.scroll}>
        <div style={{ background: "linear-gradient(135deg,#152010,#0D1A0D)", border: "1px solid rgba(26,107,58,.3)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: ".12em", textTransform: "uppercase" }}>Executive Panel</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginTop: 2 }}>Panthera Rover Crew KU</div>
          <div style={{ fontSize: 11, color: C.green, marginTop: 3 }}>Meeting Wednesdays @ Bishop Square</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <StatCard icon={Users} label="Scouts" value={scouts.length} />
          <StatCard icon={Clock} label="Pending" value={pending.length} color={C.gold} />
          <StatCard icon={DollarSign} label="Treasury" value={`Ksh ${(income - expense).toLocaleString()}`} color={C.green} />
          <StatCard icon={Package} label="Inventory" value={inventory.length} />
        </div>
        <div style={S.secLabel}>Pending Registrations</div>
        {pending.length === 0 && <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "20px 0" }}>No pending registrations 🎉</div>}
        {pending.slice(0, 3).map((a) => (
          <div key={a.id} style={{ ...S.card, borderLeft: `3px solid ${C.gold}` }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.email} · {a.regno}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Submitted: {a.submitted}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · EVENTS & MEDIA (File Picker & Creator)
// ══════════════════════════════════════════════
function AdminEvents({ events = [], setEvents, gallery = [], setGallery }) {
  const [eventModal, setEventModal] = useState(false);
  const [galleryModal, setGalleryModal] = useState(false);

  const [eForm, setEForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "Bishop Square",
    tag: "Regular",
    desc: "",
  });

  const [gForm, setGForm] = useState({ imageBase64: "", caption: "", preview: "" });

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGForm((prev) => ({
        ...prev,
        imageBase64: reader.result,
        preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addEvent = () => {
    if (!eForm.title || !eForm.date) return alert("Event title and date are required.");
    const newEvent = { ...eForm, id: "ev-" + Date.now() };
    setEvents((prev) => [...prev, newEvent]);
    setEventModal(false);
    setEForm({ title: "", date: "", time: "", location: "Bishop Square", tag: "Regular", desc: "" });
  };

  const addPhoto = () => {
    if (!gForm.imageBase64) return alert("Please choose an image file to upload.");
    const newPhoto = {
      id: "g-" + Date.now(),
      url: gForm.imageBase64,
      caption: gForm.caption,
    };
    setGallery((prev) => [...prev, newPhoto]);
    setGalleryModal(false);
    setGForm({ imageBase64: "", caption: "", preview: "" });
  };

  return (
    <div>
      <TopBar
        title="EVENTS & MEDIA"
        right={
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setEventModal(true)}
              style={{
                background: "rgba(212,160,23,.15)",
                border: `1px solid ${C.gold}`,
                color: C.gold,
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Plus size={13} /> Event
            </button>
            <button
              onClick={() => setGalleryModal(true)}
              style={{
                background: "rgba(61,214,140,.15)",
                border: `1px solid ${C.green}`,
                color: C.green,
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Upload size={13} /> Upload Photo
            </button>
          </div>
        }
      />

      <div style={S.scroll}>
        <div style={S.secLabel}>Upcoming & Scheduled Events ({events.length})</div>
        {events.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: C.muted }}>
            No events scheduled. Click "+ Event" above to create one.
          </div>
        )}
        {events.map((ev) => (
          <div key={ev.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{ev.title}</span>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 6, background: "rgba(212,160,23,.15)", color: C.gold, fontWeight: 700 }}>
                  {ev.tag || "Event"}
                </span>
              </div>
              <div style={{ fontSize: 11, color: C.green, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} /> {ev.date} {ev.time && `• ${ev.time}`}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> {ev.location}
              </div>
              {ev.desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 6, borderTop: `1px dashed ${C.border}`, paddingTop: 6 }}>{ev.desc}</div>}
            </div>
            <span onClick={() => setEvents((prev) => prev.filter((x) => x.id !== ev.id))} style={{ color: C.red, cursor: "pointer", paddingLeft: 8 }}>
              <Trash2 size={16} />
            </span>
          </div>
        ))}

        <div style={{ ...S.secLabel, marginTop: 22 }}>Crew Gallery Photos ({gallery.length})</div>
        {gallery.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: C.muted }}>
            No photos uploaded yet. Click "+ Upload Photo" to upload from your device.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {gallery.map((img) => (
            <div key={img.id} style={{ background: C.panel, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
              <img src={img.url} alt={img.caption || "Crew Photo"} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "6px 8px", fontSize: 10, color: C.muted, minHeight: 24 }}>
                {img.caption || "No caption"}
              </div>
              <span
                onClick={() => setGallery((prev) => prev.filter((x) => x.id !== img.id))}
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  background: "rgba(0,0,0,0.75)",
                  borderRadius: "50%",
                  padding: 4,
                  color: C.red,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Event */}
      <Modal open={eventModal} onClose={() => setEventModal(false)} title="Create New Event">
        <Field label="Event Title">
          <input style={S.input} placeholder="e.g. Jasiri Investiture & Campout" value={eForm.title} onChange={(e) => setEForm({ ...eForm, title: e.target.value })} />
        </Field>
        <Field label="Date">
          <input style={S.input} placeholder="e.g. 25th Sept 2026 or Every Wednesday" value={eForm.date} onChange={(e) => setEForm({ ...eForm, date: e.target.value })} />
        </Field>
        <Field label="Time">
          <input style={S.input} placeholder="e.g. 5:00 PM - 7:00 PM" value={eForm.time} onChange={(e) => setEForm({ ...eForm, time: e.target.value })} />
        </Field>
        <Field label="Venue / Location">
          <input style={S.input} placeholder="e.g. Bishop Square, KU" value={eForm.location} onChange={(e) => setEForm({ ...eForm, location: e.target.value })} />
        </Field>
        <Field label="Category / Tag">
          <select style={{ ...S.input, background: "#1A1F28" }} value={eForm.tag} onChange={(e) => setEForm({ ...eForm, tag: e.target.value })}>
            {["Regular", "Training", "Expedition", "Service", "Campout", "Ceremony"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Event Details (Optional)">
          <textarea style={{ ...S.input, height: 60 }} placeholder="Meeting agenda, gear required, etc." value={eForm.desc} onChange={(e) => setEForm({ ...eForm, desc: e.target.value })} />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setEventModal(false)}>Cancel</button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={addEvent}>Post Event</button>
        </div>
      </Modal>

      {/* Modal: Upload Image from Device */}
      <Modal open={galleryModal} onClose={() => setGalleryModal(false)} title="Upload Crew Photo">
        <Field label="Select Image File">
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: `2px dashed ${C.border}`,
              borderRadius: 12,
              padding: "20px 14px",
              cursor: "pointer",
              background: "rgba(255,255,255,.02)",
            }}
          >
            <Upload size={24} color={C.gold} />
            <span style={{ fontSize: 12, color: C.text }}>Click to choose image from device</span>
            <span style={{ fontSize: 10, color: C.muted }}>PNG, JPG, JPEG up to 2MB</span>
            <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: "none" }} />
          </label>
        </Field>

        {gForm.preview && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            <img src={gForm.preview} alt="Upload preview" style={{ width: "100%", maxHeight: 130, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}` }} />
          </div>
        )}

        <Field label="Photo Caption">
          <input style={S.input} placeholder="e.g. Tree planting at KU Main Campus" value={gForm.caption} onChange={(e) => setGForm({ ...gForm, caption: e.target.value })} />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => { setGalleryModal(false); setGForm({ imageBase64: "", caption: "", preview: "" }); }}>
            Cancel
          </button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={addPhoto}>Save to Gallery</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · SCOUTS
// ══════════════════════════════════════════════
function AdminScouts({ pending, setPending, approved, setApproved, rejected, setRejected, scouts, setScouts }) {
  const [tab, setTab] = useState("pending");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", regno: "", uni: "Kenyatta University", year: "", rank: "Jasiri" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const approve = (a) => {
    setScouts((s) => [...s, { ...a, joinDate: new Date().toLocaleDateString(), badges: 0, serviceHrs: 0 }]);
    setApproved((x) => [...x, { ...a, approvedOn: new Date().toLocaleDateString() }]);
    setPending((p) => p.filter((x) => x.id !== a.id));
  };
  const reject = (a) => {
    setRejected((x) => [...x, { ...a, rejectedOn: new Date().toLocaleDateString() }]);
    setPending((p) => p.filter((x) => x.id !== a.id));
  };
  const addScout = () => {
    if (!form.name || !form.email) return alert("Name and email required.");
    const id = "KC-" + String(Math.floor(Math.random() * 9000) + 1000);
    setScouts((s) => [...s, { ...form, id, joinDate: new Date().toLocaleDateString(), badges: 0, serviceHrs: 0 }]);
    setModal(false);
    setForm({ name: "", phone: "", email: "", regno: "", uni: "Kenyatta University", year: "", rank: "Jasiri" });
  };

  const list = tab === "pending" ? pending : tab === "approved" ? approved : tab === "rejected" ? rejected : scouts;

  return (
    <div>
      <TopBar title="SCOUTS" right={<button onClick={() => setModal(true)} style={{ background: `rgba(212,160,23,.1)`, border: `1px solid rgba(212,160,23,.3)`, color: C.gold, borderRadius: 9, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} /> Add</button>} />
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "rgba(8,8,8,.5)" }}>
        {[["pending", "Pending", pending.length], ["approved", "Approved", approved.length], ["rejected", "Rejected", rejected.length], ["all", "All", scouts.length]].map(([id, lbl, count]) => (
          <div key={id} onClick={() => setTab(id)} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 10, fontWeight: 700, cursor: "pointer", color: tab === id ? C.gold : C.muted, borderBottom: tab === id ? `2px solid ${C.gold}` : "2px solid transparent" }}>
            {lbl}<br /><span style={{ fontSize: 13, fontWeight: 900, color: tab === id ? C.gold : C.text }}>{count}</span>
          </div>
        ))}
      </div>
      <div style={S.scroll}>
        {list.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", fontSize: 13, color: C.muted }}>Nothing here yet</div>}
        {list.map((a, i) => (
          <div key={i} style={{ ...S.card, borderLeft: `3px solid ${tab === "approved" ? C.green : tab === "rejected" ? C.red : tab === "all" ? C.border : C.gold}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
              <span style={{ fontSize: 10, color: C.muted, background: "rgba(255,255,255,.05)", padding: "2px 7px", borderRadius: 6 }}>{a.id}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", marginBottom: tab === "pending" ? 10 : 0 }}>
              {[["📧", a.email], ["📞", a.phone || "—"], ["🎓", a.regno || "—"], ["🏫", a.uni || "KU"], ["📚", a.year || "—"]].map(([ic, val], j) => (
                <div key={j} style={{ fontSize: 11, color: C.muted, display: "flex", gap: 4 }}>
                  <span>{ic}</span>
                  <span style={{ color: C.text }}>{val}</span>
                </div>
              ))}
            </div>
            {tab === "pending" && (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={() => approve(a)} style={{ flex: 1, background: "rgba(46,204,113,.1)", border: "1px solid rgba(46,204,113,.3)", color: C.green, borderRadius: 9, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Check size={14} /> APPROVE
                </button>
                <button onClick={() => reject(a)} style={{ flex: 1, background: "rgba(231,76,60,.1)", border: "1px solid rgba(231,76,60,.3)", color: C.red, borderRadius: 9, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <X size={14} /> REJECT
                </button>
              </div>
            )}
            {tab === "approved" && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>Approved {a.approvedOn}</div>}
            {tab === "rejected" && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>Rejected {a.rejectedOn}</div>}
            {tab === "all" && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Joined: {a.joinDate} · Badges: {a.badges} · Svc Hrs: {a.serviceHrs}</div>}
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Scout Manually">
        {[["name", "Full Name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["regno", "Reg. No.", "text"]].map(([k, lbl, type]) => (
          <Field key={k} label={lbl}><input style={S.input} type={type} value={form[k]} onChange={set(k)} /></Field>
        ))}
        <Field label="Year">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.year} onChange={set("year")}>
            <option value="">Select…</option>
            {["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"].map((y) => <option key={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Rank">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.rank} onChange={set("rank")}>
            {["Sungura", "Chipukizi", "Mwamba", "Jasiri"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={addScout}>Add Scout</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · FINANCES
// ══════════════════════════════════════════════
function AdminFinances({ finances, setFinances }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "income", desc: "", amount: "", date: "", person: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const income = finances.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expense = finances.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  const add = () => {
    if (!form.desc || !form.amount) return alert("Description and amount required.");
    setFinances((f) => [...f, { ...form, amount: parseFloat(form.amount) }]);
    setModal(false);
    setForm({ type: "income", desc: "", amount: "", date: "", person: "" });
  };
  return (
    <div>
      <TopBar title="FINANCES" right={<button onClick={() => setModal(true)} style={{ background: "rgba(212,160,23,.1)", border: "1px solid rgba(212,160,23,.3)", color: C.gold, borderRadius: 9, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} /> Add</button>} />
      <div style={S.scroll}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <StatCard icon={DollarSign} label="Balance" value={`Ksh ${(income - expense).toLocaleString()}`} color={income - expense >= 0 ? C.green : C.red} />
          <StatCard icon={DollarSign} label="Income" value={`Ksh ${income.toLocaleString()}`} color={C.green} />
          <StatCard icon={DollarSign} label="Expense" value={`Ksh ${expense.toLocaleString()}`} color={C.red} />
        </div>
        <div style={S.secLabel}>All Transactions ({finances.length})</div>
        {finances.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", fontSize: 13, color: C.muted }}>No transactions yet</div>}
        {[...finances].reverse().map((f, i) => (
          <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{f.desc}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{f.date || "—"} · {f.person || "—"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: f.type === "income" ? C.green : C.red }}>
                {f.type === "income" ? "+" : "-"}Ksh {Number(f.amount).toLocaleString()}
              </span>
              <span onClick={() => setFinances((x) => x.filter((_, j) => j !== finances.length - 1 - i))} style={{ color: C.red, cursor: "pointer" }}>
                <Trash2 size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Transaction">
        <Field label="Type">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.type} onChange={set("type")}>
            <option value="income">Income (Money In)</option>
            <option value="expense">Expense (Money Out)</option>
          </select>
        </Field>
        <Field label="Description"><input style={S.input} placeholder="e.g. Member registration fee" value={form.desc} onChange={set("desc")} /></Field>
        <Field label="Amount (Ksh)"><input style={S.input} type="number" placeholder="0.00" value={form.amount} onChange={set("amount")} /></Field>
        <Field label="Date"><input style={S.input} type="date" value={form.date} onChange={set("date")} /></Field>
        <Field label="Paid By / To"><input style={S.input} placeholder="Rover name or vendor" value={form.person} onChange={set("person")} /></Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={add}>Add</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · INVENTORY
// ══════════════════════════════════════════════
function AdminInventory({ inventory, setInventory }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Camping Gear", qty: "", condition: "Good", location: "Bishop Square Store" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const add = () => {
    if (!form.name || !form.qty) return alert("Item name and quantity required.");
    setInventory((i) => [...i, { ...form, qty: parseInt(form.qty) }]);
    setModal(false);
    setForm({ name: "", category: "Camping Gear", qty: "", condition: "Good", location: "Bishop Square Store" });
  };
  const condColor = { Excellent: C.green, Good: C.green, Fair: C.gold, "Needs Repair": C.red };
  return (
    <div>
      <TopBar title="INVENTORY" right={<button onClick={() => setModal(true)} style={{ background: "rgba(212,160,23,.1)", border: "1px solid rgba(212,160,23,.3)", color: C.gold, borderRadius: 9, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Plus size={12} /> Add</button>} />
      <div style={S.scroll}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <StatCard icon={Package} label="Total" value={inventory.length} />
          <StatCard icon={Package} label="Repair" value={inventory.filter((i) => i.condition === "Needs Repair").length} color={C.red} />
          <StatCard icon={Package} label="Good" value={inventory.filter((i) => ["Good", "Excellent"].includes(i.condition)).length} color={C.green} />
        </div>
        <div style={S.secLabel}>Quartermaster Gear ({inventory.length})</div>
        {inventory.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", fontSize: 13, color: C.muted }}>No gear recorded yet</div>}
        {inventory.map((item, i) => (
          <div key={i} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{item.category} · 📍 {item.location || "Store"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,.05)", padding: "2px 8px", borderRadius: 8, color: C.text }}>Qty: {item.qty}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `rgba(${condColor[item.condition] === C.green ? "46,204,113" : condColor[item.condition] === C.red ? "231,76,60" : "212,160,23"},.1)`, color: condColor[item.condition] || C.muted }}>{item.condition}</span>
              </div>
            </div>
            <span onClick={() => setInventory((x) => x.filter((_, j) => j !== i))} style={{ color: C.red, cursor: "pointer", marginLeft: 8 }}>
              <Trash2 size={16} />
            </span>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Inventory Item">
        <Field label="Item Name"><input style={S.input} placeholder="Tent, Ropes, Shovel, First Aid Box…" value={form.name} onChange={set("name")} /></Field>
        <Field label="Category">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.category} onChange={set("category")}>
            {["Camping Gear", "Navigation", "First Aid", "Tools", "Clothing", "Cooking", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Quantity"><input style={S.input} type="number" placeholder="1" value={form.qty} onChange={set("qty")} /></Field>
        <Field label="Condition">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.condition} onChange={set("condition")}>
            {["Excellent", "Good", "Fair", "Needs Repair"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Storage Location"><input style={S.input} placeholder="Bishop Square, Store Room…" value={form.location} onChange={set("location")} /></Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={add}>Add Item</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN · BADGES
// ══════════════════════════════════════════════
function AdminBadges({ scouts, badgeReports, setBadgeReports, awardedBadges, setAwardedBadges }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ scoutId: "", badge: "", category: "Compulsory", date: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const compulsory = ["Jasiri Rovermatestar", "Jasiri Instructor", "Jasiri Projectstar", "Jasiri Craftstar", "City First Aider", "Jasiri Sexual Reproductive Health"];
  const nonComp = ["Jasiri Afiya", "Jasiri Mzalendo", "Jasiri Food Security", "Jasiri Utamaduni", "Jasiri People Living with Disability", "Jasiri Mountain Rescue", "Jasiri Sportsperson", "Jasiri Rescue", "Jasiri Lifesaver", "Jasiri Computerist", "Jasiri Conservation"];
  const pendingReports = badgeReports.filter((r) => r.status === "Pending");
  const approvedReports = badgeReports.filter((r) => r.status === "Approved");

  const approveReport = (report) => {
    setBadgeReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: "Approved" } : r)));
    setAwardedBadges((prev) => [
      {
        id: report.id,
        badge: report.badgeName,
        scoutName: report.memberName,
        category: compulsory.includes(report.badgeName) ? "Compulsory" : "Non-Compulsory",
        date: report.date,
        reportName: report.fileName,
      },
      ...prev,
    ]);
  };

  const award = () => {
    if (!form.scoutId || !form.badge || !form.date) return alert("Please fill in all fields.");
    const scout = scouts.find((s) => s.id === form.scoutId);
    setAwardedBadges((a) => [...a, { ...form, scoutName: scout?.name || "Unknown" }]);
    setModal(false);
    setForm({ scoutId: "", badge: "", category: "Compulsory", date: "" });
  };

  return (
    <div>
      <TopBar title="BADGES" right={<button onClick={() => setModal(true)} style={{ background: "rgba(212,160,23,.1)", border: "1px solid rgba(212,160,23,.3)", color: C.gold, borderRadius: 9, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Review Reports</button>} />
      <div style={S.scroll}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <StatCard icon={FileText} label="Pending" value={pendingReports.length} />
          <StatCard icon={Check} label="Approved" value={approvedReports.length} color={C.green} />
          <StatCard icon={Award} label="Awarded" value={awardedBadges.length} color={C.gold} />
        </div>

        <div style={S.secLabel}>Pending Report Approvals ({pendingReports.length})</div>
        {pendingReports.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: C.muted }}>No reports waiting for approval</div>}
        {pendingReports.map((report) => (
          <div key={report.id} style={{ ...S.card, borderLeft: `3px solid ${C.gold}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{report.badgeName}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{report.memberName} · {report.date}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <Paperclip size={12} /> Attachment: {report.fileName}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={{ ...S.btnGold, flex: 1, padding: "10px 0", fontSize: 11 }} onClick={() => approveReport(report)}>Approve Badge</button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 14 }}>
          <div style={S.secLabel}>Approved Badges ({awardedBadges.length})</div>
          {awardedBadges.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: C.muted }}>No badges approved yet</div>}
          {[...awardedBadges].reverse().map((a, i) => (
            <div key={a.id || i} style={{ ...S.card, borderLeft: `3px solid ${a.category === "Compulsory" ? C.gold : C.green}` }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.badge}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{a.scoutName} · {a.date}</div>
              {a.reportName && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Report: {a.reportName}</div>}
              <span style={{ display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 8, marginTop: 6, background: a.category === "Compulsory" ? "rgba(212,160,23,.1)" : "rgba(46,204,113,.1)", color: a.category === "Compulsory" ? C.gold : C.green }}>{a.category}</span>
            </div>
          ))}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Award Badge">
        <Field label="Scout">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.scoutId} onChange={set("scoutId")}>
            <option value="">-- Select Scout --</option>
            {scouts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Badge">
          <select style={{ ...S.input, background: "#1A1F28" }} value={form.badge} onChange={(e) => {
            const b = e.target.value;
            setForm((p) => ({ ...p, badge: b, category: compulsory.includes(b) ? "Compulsory" : "Non-Compulsory" }));
          }}>
            <option value="">-- Select Badge --</option>
            <optgroup label="Compulsory">{compulsory.map((b) => <option key={b}>{b}</option>)}</optgroup>
            <optgroup label="Non-Compulsory">{nonComp.map((b) => <option key={b}>{b}</option>)}</optgroup>
          </select>
        </Field>
        <Field label="Date Awarded"><input style={S.input} type="date" value={form.date} onChange={set("date")} /></Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button style={{ ...S.btnOutline, flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
          <button style={{ ...S.btnGold, flex: 1 }} onClick={award}>Award Badge</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════
//  ADMIN SHELL
// ══════════════════════════════════════════════
function AdminShell({ onSignOut, data, updateData }) {
  const [tab, setTab] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const { pending, approved, rejected, scouts, finances, inventory, badgeReports, awardedBadges, events = [], gallery = [] } = data;

  const adminNav = [
    { id: "home", label: "Home", icon: Home },
    { id: "scouts", label: "Scouts", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "badges", label: "Badges", icon: Award },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Package },
  ];

  return (
    <div>
      {tab === "home" && <AdminHome pending={pending} scouts={scouts} finances={finances} inventory={inventory} />}
      {tab === "scouts" && <AdminScouts pending={pending} setPending={updateData("pending")} approved={approved} setApproved={updateData("approved")} rejected={rejected} setRejected={updateData("rejected")} scouts={scouts} setScouts={updateData("scouts")} />}
      {tab === "events" && <AdminEvents events={events} setEvents={updateData("events")} gallery={gallery} setGallery={updateData("gallery")} />}
      {tab === "badges" && <AdminBadges scouts={scouts} badgeReports={badgeReports} setBadgeReports={updateData("badgeReports")} awardedBadges={awardedBadges} setAwardedBadges={updateData("awardedBadges")} />}
      {tab === "finances" && <AdminFinances finances={finances} setFinances={updateData("finances")} />}
      {tab === "inventory" && <AdminInventory inventory={inventory} setInventory={updateData("inventory")} />}

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(8,8,8,.97)", borderTop: `1px solid ${C.border}`, zIndex: 10, padding: "8px 0 20px" }}>
        {moreOpen && (
          <div style={{ position: "absolute", right: 10, bottom: 70, width: 174, background: "#171B22", border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 14px 40px rgba(0,0,0,.45)", overflow: "hidden" }}>
            {adminNav.slice(3).map(({ id, label, icon: Icon }) => (
              <div key={id} onClick={() => { setTab(id); setMoreOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: tab === id ? "rgba(212,160,23,.08)" : "transparent" }}>
                <Icon size={16} color={tab === id ? C.gold : C.muted} />
                <span style={{ fontSize: 12, fontWeight: 700, color: tab === id ? C.gold : C.text }}>{label}</span>
              </div>
            ))}
            <div onClick={onSignOut} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", cursor: "pointer" }}>
              <LogOut size={16} color={C.red} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>Sign Out</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex" }}>
          {adminNav.slice(0, 3).map(({ id, label, icon: Icon }) => (
            <NavItem key={id} icon={Icon} label={label} active={tab === id} onClick={() => { setTab(id); setMoreOpen(false); }} />
          ))}
          <NavItem icon={MoreHorizontal} label="More" active={moreOpen || adminNav.slice(3).some((n) => tab === n.id)} onClick={() => setMoreOpen((o) => !o)} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  MEMBER SCREENS
// ══════════════════════════════════════════════
function MemberHome({ member, setScreen }) {
  return (
    <div>
      <TopBar title="PANTHERA ROVER CREW" right={<div style={{ position: "relative" }}><Bell size={20} color={C.gold} /></div>} />
      <div style={S.scroll}>
        <div style={{ background: "linear-gradient(135deg,#152010,#0D1A0D)", border: "1px solid rgba(26,107,58,.35)", borderRadius: 18, padding: 18, marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -8, bottom: -14, fontSize: 72, opacity: 0.08 }}><Logo size={72} /></div>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: ".1em" }}>Welcome back, Rover</div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 2 }}>{member.name}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
            {[["0", "Activities"], ["0", "Badges"], ["0", "Svc Hrs"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 20, color: C.gold }}>{n}</div><div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em"}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={S.secLabel}>Quick Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Events", sub: "Upcoming", nav: "events", icon: Calendar },
            { label: "My Badges", sub: "Track progress", nav: "badges", icon: Award },
            { label: "Service Log", sub: "Log hours", nav: null, icon: Clock },
            { label: "My Profile", sub: "View & edit", nav: "profile", icon: Users }
          ].map(({ label, sub, nav, icon: Icon }) => (
            <div key={label} onClick={() => nav && setScreen(nav)} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Icon size={20} color={C.gold} /></div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{label}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberEvents({ events = [] }) {
  return (
    <div>
      <TopBar title="EVENTS" right={<span style={{ fontSize: 11, color: C.gold }}>KU Panthera</span>} />
      <div style={S.scroll}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: C.muted }}>No events scheduled yet</div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: C.green, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} /> {ev.date} {ev.time && `• ${ev.time}`}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> {ev.location}
              </div>
              {ev.desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{ev.desc}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MemberBadges({ member, setBadgeReports }) {
  const compulsory = [
    { icon: Award, name: "Jasiri Rovermatestar" },
    { icon: Compass, name: "Jasiri Instructor" },
    { icon: FileText, name: "Jasiri Projectstar" },
    { icon: Wrench, name: "Jasiri Craftstar" },
    { icon: Shield, name: "Jasiri First Aider" },
    { icon: Heart, name: "Jasiri Sexual Reproductive Health" },
  ];
  const nonComp = [
    { icon: Globe, name: "Jasiri Afya" },
    { icon: Handshake, name: "Jasiri Mzalendo" },
    { icon: Apple, name: "Jasiri Food Security" },
    { icon: Drama, name: "Jasiri Utamaduni" },
    { icon: Accessibility, name: "Jasiri People Living with Disability" },
    { icon: Mountain, name: "Jasiri Mountain Rescue" },
    { icon: Activity, name: "Jasiri Sportsperson" },
    { icon: Ambulance, name: "Jasiri Rescue" },
    { icon: Droplet, name: "Jasiri Lifesaver" },
    { icon: Laptop, name: "Jasiri Computerist" },
    { icon: TreePine, name: "Jasiri Conservation" },
  ];
  const [reports, setReports] = useState({});
  const [submittedBadges, setSubmittedBadges] = useState([]);

  const handleReportUpload = (badgeName, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const report = {
      id: Date.now(),
      memberName: member.name || "Member",
      memberEmail: member.email || "",
      badgeName,
      fileName: file.name,
      status: "Pending",
      date: new Date().toLocaleDateString(),
    };

    setBadgeReports((prev) => [report, ...prev]);
    setReports((prev) => ({ ...prev, [badgeName]: file.name }));
    setSubmittedBadges((prev) => (prev.includes(badgeName) ? prev : [...prev, badgeName]));
  };

  return (
    <div>
      <TopBar title="MY BADGES" right={<span style={{ fontSize: 11, color: C.gold }}>{submittedBadges.length} / {compulsory.length + nonComp.length}</span>} />
      <div style={S.scroll}>
        <div style={{ background: "rgba(212,160,23,.06)", border: "1px solid rgba(212,160,23,.2)", borderRadius: 11, padding: "10px 13px", marginBottom: 14, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          ⭐ <strong style={{ color: C.gold }}>6 Compulsory</strong> badges required · <strong style={{ color: C.text }}>11 Optional</strong> badges available
        </div>
        <div style={S.secLabel}>Compulsory (6)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
          {compulsory.map(({ icon: Icon, name }) => {
            const e = submittedBadges.includes(name) || Boolean(reports[name]);
            const uploaded = reports[name];
            return (
              <div key={name} style={{ background: C.panel, border: `1px solid ${e ? "rgba(212,160,23,.4)" : C.border}`, borderRadius: 13, padding: 13, textAlign: "center", opacity: e ? 1 : 0.55 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Icon size={24} color={C.gold} /></div>
                <div style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.3, marginBottom: 4 }}>{name}</div>
                <div style={{ display: "inline-block", fontSize: 9, padding: "2px 7px", borderRadius: 7, background: e ? "rgba(212,160,23,.1)" : "rgba(255,255,255,.05)", color: e ? C.gold : C.muted, marginBottom: 8 }}>{e ? "✓ Unlocked" : "Locked"}</div>
                <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, padding: "6px 8px", borderRadius: 8, background: "rgba(212,160,23,.08)", border: "1px solid rgba(212,160,23,.25)", color: C.gold, cursor: "pointer", fontWeight: 700 }}>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => handleReportUpload(name, event)} style={{ display: "none" }} />
                  {uploaded ? <><Paperclip size={10} /> Attached</> : <><Upload size={10} /> Upload report</>}
                </label>
                {uploaded && <div style={{ fontSize: 9, color: C.green, marginTop: 6 }}>Report submitted</div>}
              </div>
            );
          })}
        </div>
        <div style={S.secLabel}>Non-Compulsory (11)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {nonComp.map(({ icon: Icon, name }) => {
            const e = submittedBadges.includes(name) || Boolean(reports[name]);
            const uploaded = reports[name];
            return (
              <div key={name} style={{ background: C.panel, border: `1px solid ${e ? "rgba(46,204,113,.35)" : C.border}`, borderRadius: 13, padding: 13, textAlign: "center", opacity: e ? 1 : 0.55 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Icon size={24} color={C.green} /></div>
                <div style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.3, marginBottom: 4 }}>{name}</div>
                <div style={{ display: "inline-block", fontSize: 9, padding: "2px 7px", borderRadius: 7, background: e ? "rgba(46,204,113,.1)" : "rgba(255,255,255,.05)", color: e ? C.green : C.muted, marginBottom: 8 }}>{e ? "✓ Unlocked" : "Locked"}</div>
                <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 10, padding: "6px 8px", borderRadius: 8, background: "rgba(46,204,113,.08)", border: "1px solid rgba(46,204,113,.25)", color: C.green, cursor: "pointer", fontWeight: 700 }}>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => handleReportUpload(name, event)} style={{ display: "none" }} />
                  {uploaded ? <><Paperclip size={10} /> Attached</> : <><Upload size={10} /> Upload report</>}
                </label>
                {uploaded && <div style={{ fontSize: 9, color: C.green, marginTop: 6 }}>Report submitted</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemberProfile({ member, setScreen }) {
  const [phone, setPhone] = useState(member.phone || "+254 7XX XXX XXX");
  return (
    <div>
      <TopBar title="MY PROFILE" right={null} />
      <div style={{ background: "linear-gradient(160deg,#152010,#0D1A0D)", padding: "22px 20px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,rgba(212,160,23,.35),rgba(212,160,23,.1))", border: "2px solid rgba(212,160,23,.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "0 auto 10px" }}>
          <Logo size={72} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>{member.name}</div>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 3 }}>Panthera Rover Crew</div>
      </div>
      <div style={{ padding: "14px 18px 100px", overflowY: "auto", maxHeight: 490 }}>
        {[["Full Name", member.name], ["Email", member.email], ["Reg. No.", member.regno || "Not set"], ["Campus", member.uni || "Kenyatta University"], ["Year", member.year || "Not set"], ["Service Hours", "0 hrs"], ["Joined", new Date().getFullYear()]].map(([lbl, val]) => (
          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.muted }}>{lbl}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ["Reg. No.", "Service Hours"].includes(lbl) ? C.gold : C.text }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, color: C.muted }}>Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 11px", color: C.text, fontFamily: "inherit", fontSize: 13, outline: "none", width: "58%", textAlign: "right" }} />
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <button style={S.btnOutline} onClick={() => setScreen("landing")}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════
export default function Page() {
  const [screen, setScreen] = useState("landing");
  const [member, setMember] = useState(DEFAULT_USER);
  const [pendingId, setPendingId] = useState("");
  const [memberTab, setMemberTab] = useState("home");
  const [data, setData] = useState(DEFAULT_APP_DATA);
  const [dataReady, setDataReady] = useState(false);
  const [apiStatus, setApiStatus] = useState("Connecting to backend...");
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("panthera_token");
    if (!savedToken) {
      setScreen("landing");
      setApiStatus("");
      return;
    }

    let mounted = true;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${savedToken}` } })
      .then(async (response) => {
        if (!mounted) return;
        if (!response.ok) {
          localStorage.removeItem("panthera_token");
          setApiStatus("");
          return;
        }
        const body = await response.json();
        setToken(savedToken);
        setScreen(roleScreen(body.user.role));
        return loadAppData(savedToken);
      })
      .then((serverData) => {
        if (!mounted) return;
        if (serverData) {
          setData(serverData);
          setApiStatus("");
          setDataReady(true);
        }
      })
      .catch((error) => {
        if (!mounted) return;
        setApiStatus(error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dataReady || !token) return;
    const timeout = setTimeout(() => {
      saveAppData(data, token)
        .then(() => setApiStatus(""))
        .catch((error) => setApiStatus(error.message));
    }, 300);
    return () => clearTimeout(timeout);
  }, [data, dataReady, token]);

  const updateData = (key) => (updater) => {
    setData((current) => ({
      ...current,
      [key]: typeof updater === "function" ? updater(current[key]) : updater,
    }));
  };

  const handleLogin = async (loginData) => {
    setApiStatus("Signing in...");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, name: loginData.name }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Login failed");
      }
      const body = await response.json();
      localStorage.setItem("panthera_token", body.token);
      setToken(body.token);
      setScreen(roleScreen(body.user.role));
      const serverData = await loadAppData(body.token);
      setData(serverData);
      setApiStatus("");
      setDataReady(true);
    } catch (error) {
      setApiStatus(error.message);
    }
  };

  const handleRegister = (form) => {
    const id = "KC-2026-" + String(Math.floor(Math.random() * 900) + 100);
    const registration = { ...form, id, submitted: new Date().toISOString().split("T")[0] };
    setPendingId(id);
    updateData("pending")((p) => [...p, registration]);
    setScreen("pending");
  };

  const memberNav = [
    { id: "home", label: "Home", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "badges", label: "Badges", icon: Award },
    { id: "profile", label: "Profile", icon: Users },
  ];

  return (
    <div style={{ background: "#0C0C0C", minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={S.phone}>
        <div style={S.notch}></div>

        {screen === "landing" && <Landing setScreen={setScreen} events={data.events} gallery={data.gallery} />}
        {screen === "login" && <Login setScreen={setScreen} onLogin={handleLogin} />}
        {screen === "register" && <Register setScreen={setScreen} onRegister={handleRegister} />}
        {screen === "pending" && <Pending pendingId={pendingId} setScreen={setScreen} />}
        {screen === "admin" && <AdminShell onSignOut={() => setScreen("landing")} data={data} updateData={updateData} />}

        {apiStatus && (
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 86, zIndex: 30, background: "rgba(0,0,0,.82)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px", fontSize: 11, color: C.muted, textAlign: "center" }}>
            {apiStatus}
          </div>
        )}

        {screen === "member" && (
          <div>
            {memberTab === "home" && <MemberHome member={member} setScreen={setMemberTab} />}
            {memberTab === "events" && <MemberEvents events={data.events} />}
            {memberTab === "badges" && <MemberBadges member={member} badgeReports={data.badgeReports} setBadgeReports={updateData("badgeReports")} />}
            {memberTab === "profile" && <MemberProfile member={member} setScreen={setScreen} />}
            <div style={S.nav}>
              {memberNav.map(({ id, label, icon: Icon }) => (
                <NavItem key={id} icon={Icon} label={label} active={memberTab === id} onClick={() => setMemberTab(id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}