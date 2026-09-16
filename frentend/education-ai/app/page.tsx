"use client";

// Ported from the standalone EduInsight AI landing page design.

function IcoBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5a2 2 0 012-2h4.5A2.5 2.5 0 0112 5.5V16a2.5 2.5 0 00-2.5-2.5H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 5.5A2.5 2.5 0 0114.5 3H17v11h-2.5A2.5 2.5 0 0012 16.5V5.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IcoCap() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L2 7.5l8 4.5 8-4.5L10 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 9.5V14c0 1.657 2.239 3 5 3s5-1.343 5-3V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17.5 7.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IcoArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IcoPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M12.5 2.5a2 2 0 012.83 2.83L5.5 15.17 2 16l.83-3.5L12.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IcoChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="10" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="7" y="6" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="12" y="2" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IcoUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 16c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 13c1.66 0 3 1.34 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IcoTimer() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 7v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 2h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IcoClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4" y="3" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 3V2h4v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 9h5M6.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Nav() {
  const links = ["Home", "How it works", "For Students", "For Teachers", "For Administrators"];

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", gap: 0 }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1769E0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <IcoCap />
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: "#0F172A", letterSpacing: "-0.01em" }}>
            EduInsight <span style={{ color: "#1769E0" }}>AI</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 36 }} className="nav-links">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                fontWeight: 500,
                color: "#475569",
                textDecoration: "none",
                padding: "5px 11px",
                borderRadius: 6,
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#1769E0";
                el.style.background = "#EAF2FF";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#475569";
                el.style.background = "transparent";
              }}
            >
              {l}
            </a>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href="/login"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 500,
              color: "#475569",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 7,
              border: "1px solid #E2ECF6",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#BFDBFE";
              el.style.color = "#1769E0";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E2ECF6";
              el.style.color = "#475569";
            }}
          >
            Login
          </a>
          <a
            href="/login"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#fff",
              background: "#1769E0",
              textDecoration: "none",
              padding: "6px 16px",
              borderRadius: 7,
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1257BD";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1769E0";
            }}
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroDashboard() {
  return (
    <div style={{ position: "relative", padding: "8px 8px 48px 8px" }}>
      <div style={{ background: "#fff", border: "1px solid #E2ECF6", borderRadius: 14, boxShadow: "0 6px 28px rgba(23,105,224,0.09), 0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ background: "#F6F9FC", borderBottom: "1px solid #E2ECF6", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FCA5A5" }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FDE68A" }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#86EFAC" }} />
          </div>
          <div style={{ flex: 1, background: "#E2ECF6", borderRadius: 4, height: 6, maxWidth: 160 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#94A3B8" }}>eduinsight.ai</span>
        </div>

        <div style={{ padding: "18px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Hello student 👋</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B", marginTop: 2 }}>Spring Semester 2026</div>
            </div>
            <div style={{ background: "#EAF2FF", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#1769E0", display: "flex" }}><IcoCap /></span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "#1769E0" }}>Avg 15/20</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>My Courses</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CourseRow name="Mathematics" score={15} max={20} color="#16A34A" />
              <CourseRow name="Physics" score={11} max={20} color="#F59E0B" />
              <CourseRow name="SVT" score={18} max={20} color="#15803D" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#f7a83d", border: "1px solid #f0a133", borderRadius: 12, padding: "14px 14px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color: "#fffaf1", display: "flex" }}><IcoTimer /></span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#fffaf1", textTransform: "uppercase", letterSpacing: "0.06em" }}>Focus Productivity</span>
                </div>
                <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff9f2", borderRadius: 999, padding: "4px 10px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700 }}>Pomodoro</span>
              </div>

              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(56, 26, 0, 0.8)", lineHeight: 1.5, marginBottom: 10 }}>
                Keep study sessions focused and track administrative time.
              </div>

              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 28, color: "#fffaf5", letterSpacing: "-0.02em", marginBottom: 12 }}>25:00</div>

              <button
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 10,
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "inline-flex" }}>▶</span>
                Start Timer
              </button>
            </div>

            <div style={{ background: "#F6F9FC", border: "1px solid #E2ECF6", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.06em" }}>Upcoming Deadlines</div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#64748B", fontWeight: 600 }}>View All</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "#dff7eb", border: "1px solid #a7e7c5", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: "#22c55e", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>✓</span>
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#0f172a", fontWeight: 700 }}>Exame 1 Math</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#15803d", marginTop: 2 }}>Completed 100%</div>
                    </div>
                  </div>
                  <span style={{ background: "#d9f9e8", color: "#15803d", borderRadius: 999, padding: "4px 8px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700 }}>Done</span>
                </div>

                <div style={{ background: "#fff7dd", border: "1px solid #f3d37b", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: "#f59e0b", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>!</span>
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#0f172a", fontWeight: 700 }}>Physics Homework Review</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#7c5a00", marginTop: 2 }}>Due Today, 11:59 PM</div>
                    </div>
                  </div>
                  <span style={{ background: "#ffe7b8", color: "#b45309", borderRadius: 999, padding: "4px 8px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700 }}>Urgent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: -12, right: -16, background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 10, padding: "9px 13px", boxShadow: "0 4px 14px rgba(22,163,74,0.14)" }}>
        <div style={{ fontSize: 18, textAlign: "center" }}>🎓</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#16A34A", textAlign: "center", marginTop: 2 }}>Top student</div>
      </div>

      <div style={{ position: "absolute", bottom: 24, left: -16, background: "#EAF2FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "9px 13px", boxShadow: "0 4px 14px rgba(23,105,224,0.12)" }}>
        <div style={{ fontSize: 18, textAlign: "center" }}>📚</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#1769E0", textAlign: "center", marginTop: 2 }}>3 courses</div>
      </div>
    </div>
  );
}

function CourseRow({ name, score, max, color }: { name: string; score: number; max: number; color: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "#334155" }}>{name}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color, fontWeight: 600 }}>{score}/{max}</span>
      </div>
      <div style={{ height: 5, background: "#E2ECF6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function ActivityDot({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>{text}</span>
    </div>
  );
}

const CYCLE = [
  { label: "LEARN", icon: "📖", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
  { label: "PRACTICE", icon: "✏️", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { label: "SUBMIT", icon: "📤", color: "#92670A", bg: "#FEF3C7", border: "#FDE68A" },
  { label: "GET FEEDBACK", icon: "💬", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { label: "IMPROVE", icon: "📈", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
];

function Hero() {
  return (
    <section style={{ background: "#F6F9FC", padding: "80px 24px 96px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="hero-grid">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#EAF2FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "5px 14px", marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: "#1769E0" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 600, color: "#1769E0", letterSpacing: "0.05em", textTransform: "uppercase" }}>Education Management Platform</span>
          </div>

          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 4.2vw, 54px)", lineHeight: 1.08, color: "#0F172A", letterSpacing: "-0.025em", margin: "0 0 22px" }}>
            Make <span style={{ color: "#16A34A" }}>Learning</span><br />
            Clearer. Smarter.<br />
            <span style={{ color: "#1769E0" }}>Better.</span>
          </h1>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16.5, lineHeight: 1.72, color: "#475569", margin: "0 0 36px", maxWidth: 460 }}>
            EduInsight AI brings students, teachers and administrators together to manage learning, track academic progress and stay organized.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14.5,
                fontWeight: 600,
                color: "#fff",
                background: "#1769E0",
                textDecoration: "none",
                padding: "11px 24px",
                borderRadius: 8,
                boxShadow: "0 2px 10px rgba(23,105,224,0.25)",
                transition: "background 0.13s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1257BD";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1769E0";
              }}
            >
              Get Started <IcoArrow />
            </a>
            <a
              href="#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 14.5,
                fontWeight: 500,
                color: "#475569",
                background: "#fff",
                textDecoration: "none",
                padding: "11px 22px",
                borderRadius: 8,
                border: "1px solid #E2ECF6",
                transition: "border-color 0.13s, color 0.13s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#86EFAC";
                el.style.color = "#16A34A";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E2ECF6";
                el.style.color = "#475569";
              }}
            >
              Explore the Platform
            </a>
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
            {[
              { c: "#16A34A", t: "Student progress tracking" },
              { c: "#1769E0", t: "Teacher management tools" },
              { c: "#F59E0B", t: "Focus & productivity" },
            ].map(({ c, t }) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: c }}><IcoCheck /></span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

function WhatIs() {
  return (
    <section style={{ background: "#fff", padding: "88px 24px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(26px, 3vw, 40px)", color: "#0F172A", letterSpacing: "-0.022em", margin: "0 0 16px" }}>
            One platform for the entire learning journey.
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15.5, color: "#64748B", lineHeight: 1.65, maxWidth: 520, margin: "0 auto" }}>
            From the first lecture to the final exam — EduInsight AI connects every step of the educational experience in one clear, organized place.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {CYCLE.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: step.bg, border: `1px solid ${step.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {step.icon}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{step.label}</span>
              </div>
              {i < CYCLE.length - 1 && (
                <div style={{ padding: "0 10px 14px" }}>
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                    <path d="M1 7h18M13 1l6 6-6 6" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForStudents() {
  return (
    <section id="for-students" style={{ background: "#F0FDF4", padding: "88px 24px", borderBottom: "1px solid #BBF7D0" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 20, padding: "4px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🎓</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.06em" }}>For Students</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.8vw, 36px)", color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.2 }}>
            Progress becomes <span style={{ color: "#16A34A" }}>visible.</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.7, color: "#374151", margin: "0 0 28px" }}>
            Know where you stand and what to improve. EduInsight AI shows you exactly how you're doing — across every course, every exercise and every exam.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "View all your courses and grades in one place",
              "Track your academic progress over time",
              "Submit exercises and receive feedback",
              "Monitor your attendance record",
              "Use the focus timer to stay productive",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: "#DCFCE7", border: "1px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, color: "#16A34A" }}>
                  <IcoCheck />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#374151", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ background: "#fff", border: "1px solid #BBF7D0", borderRadius: 14, boxShadow: "0 6px 28px rgba(22,163,74,0.08)", overflow: "hidden" }}>
            <div style={{ background: "#16A34A", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>My Dashboard</span>
              <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 10px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#fff", fontWeight: 500 }}>Spring 2026</span>
              </div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                <ScoreChip label="Avg Score" value="15/20" color="#16A34A" bg="#DCFCE7" />
                <ScoreChip label="Courses" value="3 active" color="#1769E0" bg="#EAF2FF" />
                <ScoreChip label="Attendance" value="96%" color="#92670A" bg="#FEF3C7" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>My Courses</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <StudentCourseCard name="Mathematics" score={15} total={20} color="#16A34A" progress={75} />
                  <StudentCourseCard name="Physics" score={11} total={20} color="#F59E0B" progress={55} />
                  <StudentCourseCard name="SVT" score={18} total={20} color="#15803D" progress={90} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f7a83d", border: "1px solid #f0a133", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#fffaf1", display: "flex" }}><IcoTimer /></span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#fffaf1", textTransform: "uppercase", letterSpacing: "0.06em" }}>Focus Timer</span>
                    </div>
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "4px 8px", color: "#fffaf1", fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700 }}>Pomodoro</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 24, color: "#fffaf5", marginBottom: 6 }}>25:00</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(83, 39, 0, 0.8)", marginTop: 2 }}>Next: Calculus Ch.4</div>
                </div>

                <div style={{ background: "#edf9f2", border: "1px solid #bfe9d2", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Activities</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#16A34A", fontWeight: 600 }}>View</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: "#16A34A", display: "inline-flex" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>Exercise submitted</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: "#1769E0", display: "inline-flex" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>New grade received</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: "#F59E0B", display: "inline-flex" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#475569" }}>Exam in 2 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreChip({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 9, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color }}>{value}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color, opacity: 0.8, marginTop: 2, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function StudentCourseCard({ name, score, total, color, progress }: { name: string; score: number; total: number; color: string; progress: number }) {
  return (
    <div style={{ background: "#F6F9FC", border: "1px solid #E2ECF6", borderRadius: 9, padding: "10px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{name}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color, fontWeight: 600 }}>{score}/{total}</span>
      </div>
      <div style={{ height: 5, background: "#E2ECF6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

const TEACHER_MENU = [
  { label: "My Classes", icon: <IcoUsers />, count: 4, color: "#1769E0", bg: "#EAF2FF" },
  { label: "Courses", icon: <IcoBook />, count: 8, color: "#1769E0", bg: "#EAF2FF" },
  { label: "Exercises", icon: <IcoPencil />, count: 24, color: "#1769E0", bg: "#EAF2FF" },
  { label: "Submissions", icon: <IcoClipboard />, count: 12, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Grades", icon: <IcoChart />, count: 156, color: "#16A34A", bg: "#DCFCE7" },
  { label: "Attendance", icon: <IcoCheck />, count: 94, color: "#16A34A", bg: "#DCFCE7" },
];

function ForTeachers() {
  return (
    <section id="for-teachers" style={{ background: "#fff", padding: "88px 24px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
        <div>
          <div style={{ background: "#fff", border: "1px solid #E2ECF6", borderRadius: 14, boxShadow: "0 6px 28px rgba(23,105,224,0.07)", overflow: "hidden" }}>
            <div style={{ background: "#1769E0", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>Teacher Workspace</span>
              <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "2px 10px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#fff", fontWeight: 500 }}>Mr. Okafor</span>
              </div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                <ScoreChip label="Students" value="86" color="#1769E0" bg="#EAF2FF" />
                <ScoreChip label="Pending" value="12" color="#92670A" bg="#FEF3C7" />
                <ScoreChip label="Graded" value="144" color="#16A34A" bg="#DCFCE7" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TEACHER_MENU.map((item) => (
                  <div
                    key={item.label}
                    style={{ background: "#F6F9FC", border: "1px solid #E2ECF6", borderRadius: 9, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "border-color 0.13s" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = item.color === "#F59E0B" ? "#FDE68A" : item.color === "#16A34A" ? "#86EFAC" : "#BFDBFE";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#E2ECF6";
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{item.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: item.color, fontWeight: 500 }}>{item.count} items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EAF2FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "4px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🏫</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#1769E0", textTransform: "uppercase", letterSpacing: "0.06em" }}>For Teachers</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.8vw, 36px)", color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.2 }}>
            Everything stays <span style={{ color: "#1769E0" }}>organized.</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.7, color: "#475569", margin: "0 0 28px" }}>
            Manage your classes, courses, and exercises in one place. Review student submissions, record grades and track attendance — all from a clear, focused interface.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { t: "Manage classes and course materials", c: "#1769E0", bg: "#EAF2FF" },
              { t: "Create and publish exercises", c: "#1769E0", bg: "#EAF2FF" },
              { t: "Review and grade student submissions", c: "#16A34A", bg: "#DCFCE7" },
              { t: "Track attendance for every class", c: "#16A34A", bg: "#DCFCE7" },
              { t: "Monitor pending tasks with yellow alerts", c: "#92670A", bg: "#FEF3C7" },
            ].map(({ t, c, bg }) => (
              <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: bg, border: `1px solid ${c === "#1769E0" ? "#BFDBFE" : c === "#16A34A" ? "#86EFAC" : "#FDE68A"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, color: c }}>
                  <IcoCheck />
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#334155", fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ADMIN_CARDS = [
  { label: "Students", value: "1,284", icon: "👨‍🎓", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
  { label: "Teachers", value: "92", icon: "👩‍🏫", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { label: "Classes", value: "48", icon: "🏫", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
  { label: "Courses", value: "136", icon: "📚", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
];

const FLOW = ["Students", "Classes", "Courses", "Learning"];
const FLOW_COLORS = ["#1769E0", "#16A34A", "#92670A", "#16A34A"];
const FLOW_BG = ["#EAF2FF", "#DCFCE7", "#FEF3C7", "#DCFCE7"];

function ForAdmins() {
  return (
    <section id="for-administrators" style={{ background: "#F6F9FC", padding: "88px 24px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 20, padding: "4px 14px", marginBottom: 20 }}>
            <span style={{ fontSize: 14 }}>🏛️</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#92670A", textTransform: "uppercase", letterSpacing: "0.06em" }}>For Administrators</span>
          </div>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.8vw, 36px)", color: "#0F172A", letterSpacing: "-0.02em", margin: "0 0 14px" }}>
            Education stays <span style={{ color: "#1769E0" }}>connected.</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.7, color: "#475569", maxWidth: 500, margin: "0 auto" }}>
            Manage your institution from one central dashboard. Students, teachers and classes — always organized, always accessible.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 48 }} className="admin-cards">
          {ADMIN_CARDS.map((c) => (
            <div key={c.label} style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 12, padding: "20px 20px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {c.icon}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 24, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B", fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2ECF6", borderRadius: 14, padding: "32px 36px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 24, textAlign: "center" }}>How it all connects</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
            {FLOW.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ background: FLOW_BG[i], borderRadius: 10, padding: "10px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: FLOW_COLORS[i], border: `1px solid ${FLOW_COLORS[i] === "#1769E0" ? "#BFDBFE" : FLOW_COLORS[i] === "#16A34A" ? "#86EFAC" : "#FDE68A"}` }}>
                  {step}
                </div>
                {i < FLOW.length - 1 && (
                  <div style={{ padding: "0 12px" }}>
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                      <path d="M1 6h18M13 1l6 5-6 5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const HOW_STEPS = [
  { n: "01", label: "MANAGE", headline: "Set up classes", body: "Admins configure classes, enroll students, and assign teachers before the semester begins.", icon: "⚙️", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
  { n: "02", label: "LEARN", headline: "Access courses", body: "Students find their courses, read materials and get familiar with the semester plan.", icon: "📖", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { n: "03", label: "PRACTICE", headline: "Complete exercises", body: "Teachers publish exercises. Students work on them and submit directly through the platform.", icon: "✏️", color: "#92670A", bg: "#FEF3C7", border: "#FDE68A" },
  { n: "04", label: "TRACK", headline: "Grades & attendance", body: "Teachers record grades and mark attendance. Every result is visible to students instantly.", icon: "📊", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" },
  { n: "05", label: "IMPROVE", headline: "See the progress", body: "Students and teachers review performance trends. Everyone knows where to go next.", icon: "📈", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE" },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: "#fff", padding: "88px 24px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.8vw, 38px)", color: "#0F172A", letterSpacing: "-0.022em", margin: "0 0 14px" }}>
            How EduInsight AI works
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#64748B", lineHeight: 1.65, maxWidth: 440, margin: "0 auto" }}>
            A simple learning journey — from setup to results.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 16 }} className="steps-grid">
          {HOW_STEPS.map((s) => (
            <div key={s.n} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: s.color, background: "rgba(255,255,255,0.7)", borderRadius: 5, padding: "2px 7px", border: "1px solid rgba(255,255,255,0.9)" }}>{s.n}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#0F172A", lineHeight: 1.25, marginBottom: 8 }}>{s.headline}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY = [
  { n: "01", label: "SIMPLE", headline: "Everything important in one place.", body: "No more switching between email, spreadsheets, and separate tools. Courses, grades, exercises and attendance — one clean platform for everyone.", color: "#1769E0", bg: "#EAF2FF", border: "#BFDBFE", icon: "✦" },
  { n: "02", label: "CONNECTED", headline: "Students, teachers and administrators work together.", body: "When a teacher grades an exercise, the student sees it immediately. When an admin updates the schedule, everyone is in sync.", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC", icon: "◈" },
  { n: "03", label: "PROGRESS‑FOCUSED", headline: "Academic progress is easy to understand.", body: "Grades, attendance and course completion are always visible and clear. Students know where they stand. Teachers know who needs support.", color: "#92670A", bg: "#FEF3C7", border: "#FDE68A", icon: "▲" },
];

function WhySection() {
  return (
    <section style={{ background: "#F6F9FC", padding: "88px 24px", borderBottom: "1px solid #E2ECF6" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.8vw, 38px)", color: "#0F172A", letterSpacing: "-0.022em", margin: 0 }}>
            Why EduInsight AI
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }} className="features-grid">
          {WHY.map((w) => (
            <div key={w.n} style={{ background: "#fff", border: `1px solid ${w.border}`, borderRadius: 14, padding: "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: w.bg, border: `1px solid ${w.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 18, color: w.color, fontWeight: 700 }}>
                  {w.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: w.color, fontWeight: 600 }}>{w.n}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: w.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{w.label}</div>
                </div>
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: "#0F172A", lineHeight: 1.3, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{w.headline}</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#16A34A" }} />
          <div style={{ width: 32, height: 8, borderRadius: 4, background: "#16A34A" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#16A34A" }} />
        </div>

        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 46px)", color: "#0F172A", letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 18px" }}>
          Make every step of learning <span style={{ color: "#16A34A" }}>visible.</span>
        </h2>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: 1.7, color: "#64748B", margin: "0 0 40px" }}>
          Manage learning. Track progress. Keep moving forward.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: "#1769E0",
              textDecoration: "none",
              padding: "13px 28px",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(23,105,224,0.28)",
              transition: "background 0.13s, box-shadow 0.13s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1257BD";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1769E0";
            }}
          >
            Get Started <IcoArrow />
          </a>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 500,
              color: "#16A34A",
              background: "#DCFCE7",
              textDecoration: "none",
              padding: "13px 26px",
              borderRadius: 8,
              border: "1px solid #86EFAC",
              transition: "background 0.13s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#BBF7D0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#DCFCE7";
            }}
          >
            Request a Demo
          </a>
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          {["Free 30-day trial", "No credit card required", "Setup in under 10 minutes"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#16A34A" }}><IcoCheck /></span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = ["Home", "How it works", "Students", "Teachers", "Administrators", "Login"];

  return (
    <footer style={{ background: "#0F172A", padding: "44px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, marginBottom: 36 }} className="footer-grid">
          <div>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1769E0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <IcoCap />
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
                EduInsight <span style={{ color: "#93C5FD" }}>AI</span>
              </span>
            </a>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              Education Management &amp; Student Progress Platform
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Platform</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
              {links.map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    transition: "color 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                  }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 EduInsight AI. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  textDecoration: "none",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)";
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const css = `
  @media (max-width: 1000px) {
    .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .steps-grid { grid-template-columns: 1fr 1fr !important; }
    .admin-cards { grid-template-columns: 1fr 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
    .nav-links { display: none !important; }
  }
  @media (max-width: 600px) {
    .steps-grid { grid-template-columns: 1fr !important; }
    .admin-cards { grid-template-columns: 1fr 1fr !important; }
  }
`;

export default function Home() {
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#F6F9FC" }}>
        <Nav />
        <Hero />
        <WhatIs />
        <ForStudents />
        <ForTeachers />
        <ForAdmins />
        <HowItWorks />
        <WhySection />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
