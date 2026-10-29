import { useState, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getLawyers } from "../api/fetchApi"
import { AuthContext } from "../context/AuthContext"
import LegalScrollExperience from "../components/landing/LegalScrollExperience"

// ── Classical & Modern Legal Quotes ─────────────────────────────────────────
const QUOTES = [
  { text: "The good of the people is the greatest law.", author: "Marcus Tullius Cicero", title: "Roman Statesman & Lawyer" },
  { text: "Justice delayed is justice denied.", author: "William E. Gladstone", title: "British Jurist" },
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr.", title: "Civil Rights Leader" },
  { text: "The law is reason, free from passion.", author: "Aristotle", title: "Philosopher" },
  { text: "Law and order are the medicine of the body politic.", author: "Dr. B. R. Ambedkar", title: "Chief Architect of Indian Constitution" },
  { text: "No man is above the law and no man is below it.", author: "Theodore Roosevelt", title: "Statesman" },
]

function QuoteCarousel() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % QUOTES.length)
        setFade(true)
      }, 350)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #070D1A 0%, #0B1426 100%)",
        borderTop: "1px solid rgba(197, 168, 128, 0.15)",
        borderBottom: "1px solid rgba(197, 168, 128, 0.15)",
        padding: "80px 24px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative subtle background watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "220px",
          color: "rgba(197, 168, 128, 0.03)",
          fontFamily: "'Playfair Display', Georgia, serif",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        “
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 14px",
            borderRadius: 20,
            background: "rgba(197, 168, 128, 0.1)",
            border: "1px solid rgba(197, 168, 128, 0.25)",
            color: "#D4AF37",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          <span>⚖️</span>
          <span>Jurisprudence & Truth</span>
        </div>

        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px",
            fontStyle: "italic",
            color: "#FAF6F0",
            lineHeight: 1.6,
            minHeight: "80px",
            margin: "0 0 18px",
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(6px)",
            transition: "all 0.35s ease",
          }}
        >
          "{QUOTES[idx].text}"
        </p>

        <div
          style={{
            opacity: fade ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#C5A880", letterSpacing: "0.5px" }}>
            — {QUOTES[idx].author}
          </div>
          <small style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
            {QUOTES[idx].title}
          </small>
        </div>

        {/* Carousel Indicator Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 150); }}
              style={{
                width: i === idx ? 28 : 8,
                height: 6,
                borderRadius: 3,
                background: i === idx ? "linear-gradient(90deg, #C5A880, #D4AF37)" : "rgba(255, 255, 255, 0.2)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              title={QUOTES[i].author}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Landing Page ───────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [lawyerCount, setLawyerCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getLawyers()
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setLawyerCount(data.length)
      } catch (err) {}
    }
    loadStats()

    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/lawyers${search ? `?search=${encodeURIComponent(search)}` : ""}`)
  }

  const categories = [
    { icon: "⚖️", name: "Criminal Law", desc: "Bail hearings, trials & defense", color: "#FCEBEB", text: "#A32D2D", count: "120+ Cases" },
    { icon: "🏛️", name: "Civil Law", desc: "Contract disputes, torts & recovery", color: "#E6F1FB", text: "#0C447C", count: "210+ Cases" },
    { icon: "👨‍👩‍👧", name: "Family Law", desc: "Divorce, maintenance & custody", color: "#FBEAF0", text: "#72243E", count: "95+ Cases" },
    { icon: "🏠", name: "Property Law", desc: "Land titles, registration & transfers", color: "#EAF3DE", text: "#27500A", count: "140+ Cases" },
    { icon: "🏢", name: "Corporate Law", desc: "M&A, governance, contracts & IP", color: "#FAEEDA", text: "#633806", count: "85+ Cases" },
    { icon: "👷", name: "Labour Law", desc: "Employment rights & workplace disputes", color: "#E1F5EE", text: "#0F6E56", count: "60+ Cases" },
    { icon: "💰", name: "Tax Law", desc: "GST disputes, direct tax & tribunals", color: "#EEEDFE", text: "#3C3489", count: "75+ Cases" },
    { icon: "📜", name: "Constitutional Law", desc: "Fundamental rights & writ petitions", color: "#F1EFE8", text: "#444441", count: "50+ Cases" },
  ]

  const features = [
    {
      icon: "🛡️",
      title: "100% Bar Council Verified",
      desc: "Every advocate's State Bar Council Enrollment Number is strictly authenticated before directory listing.",
    },
    {
      icon: "🔒",
      title: "Privileged & Confidential",
      desc: "High-grade 256-bit data encryption protects attorney-client consultations, case notes, and evidentiary files.",
    },
    {
      icon: "⚡",
      title: "Rapid Consultation Booking",
      desc: "Schedule direct consultations with district, high, or supreme court advocates without delays.",
    },
    {
      icon: "💬",
      title: "Real-Time Legal Messaging",
      desc: "Stay connected through secure real-time messaging tied directly to your ongoing court matters.",
    },
    {
      icon: "📄",
      title: "Digital Document Vault",
      desc: "Safely upload, manage, and share court affidavits, petitions, and evidence with your advocate.",
    },
    {
      icon: "💳",
      title: "Transparent Legal Billing",
      desc: "Clear fee quotes upfront with digital Razorpay payments and downloadable GST-compliant receipts.",
    },
  ]

  const steps = [
    {
      num: "01",
      title: "Select Practice & Advocate",
      desc: "Filter through verified advocates by specialized field, court jurisdiction, and proven case records.",
    },
    {
      num: "02",
      title: "Schedule Confidential Hearing",
      desc: "Choose an available date and reserve an in-person or virtual consultation slot instantly.",
    },
    {
      num: "03",
      title: "Manage Legal Proceedings",
      desc: "Track case filings, review timeline updates, and collaborate securely from your personalized dashboard.",
    },
  ]

  return (
    <div style={{ backgroundColor: "#FFFFFF", color: "#0F172A", minHeight: "100vh" }}>

      {/* ── UPGRADED NAVIGATION BAR ─────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1050,
          height: 72,
          padding: "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          background: scrolled
            ? "rgba(10, 17, 40, 0.92)"
            : "linear-gradient(180deg, rgba(7, 13, 26, 0.85) 0%, rgba(7, 13, 26, 0) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled ? "1px solid rgba(197, 168, 128, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: scrolled ? "0 10px 30px rgba(0, 0, 0, 0.35)" : "none",
        }}
      >
        {/* Brand Emblem */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #C5A880 0%, #185FA5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 4px 16px rgba(197, 168, 128, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            ⚖️
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              LexCore
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#C5A880",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              Legal Intelligence
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="d-none d-md-flex align-items-center gap-4">
          {[
            { label: "Advocate Directory", href: "#advocates", route: "/lawyers" },
            { label: "Practice Areas", href: "#practices" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Bar Verification", href: "#verification" },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.route) {
                  e.preventDefault()
                  navigate(item.route)
                }
              }}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#C5A880"
                e.currentTarget.style.background = "rgba(197, 168, 128, 0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)"
                e.currentTarget.style.background = "transparent"
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right CTA / Auth Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-sm text-white fw-bold d-flex align-items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #185FA5 0%, #0F4377 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 20px",
                borderRadius: "30px",
                boxShadow: "0 4px 14px rgba(24, 95, 165, 0.35)",
              }}
            >
              <span>Dashboard</span>
              <span>→</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "8px 18px",
                  borderRadius: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  background: "rgba(255, 255, 255, 0.05)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#C5A880"
                  e.currentTarget.style.color = "#C5A880"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "8px 20px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #C5A880 0%, #A88B63 100%)",
                  boxShadow: "0 4px 14px rgba(197, 168, 128, 0.35)",
                  transition: "transform 0.15s ease",
                  display: "inline-block",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Join Platform
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── CINEMATIC COURTROOM SCROLL EXPERIENCE ──────────────────────── */}
      <LegalScrollExperience />

      {/* ── HERO BANNER & SEARCH SECTION ────────────────────────────────── */}
      <div
        id="advocates"
        style={{
          background: "radial-gradient(ellipse at 50% 10%, #152246 0%, #0A1128 65%, #060B17 100%)",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 880, textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Trust Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              borderRadius: "30px",
              background: "rgba(197, 168, 128, 0.12)",
              border: "1px solid rgba(197, 168, 128, 0.35)",
              color: "#E5C07B",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <span>🛡️</span>
            <span>Authenticated Bar Council Legal Network</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.18,
              marginBottom: 20,
            }}
          >
            Connect with Verified Advocates.<br />
            <span
              style={{
                background: "linear-gradient(135deg, #C5A880 0%, #F3E8D2 50%, #9FE1CB 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Secure Fair & Swift Justice.
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "rgba(255, 255, 255, 0.72)",
              maxWidth: 720,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            Search authenticated legal advocates across Criminal, Civil, Family, Property, and Corporate practices.
            Review Bar Council enrollment credentials, consult fees, and book privileged appointments.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              maxWidth: 620,
              margin: "0 auto 32px",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "6px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(197, 168, 128, 0.4)",
            }}
          >
            <input
              type="text"
              placeholder="Search by advocate name, Bar ID, practice or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "14px 18px",
                border: "none",
                fontSize: 14,
                color: "#0F172A",
                outline: "none",
                background: "transparent",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #185FA5 0%, #0F4377 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🔍</span>
              <span>Find Advocates</span>
            </button>
          </form>

          {/* Quick Practice Filter Pills */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", alignSelf: "center", marginRight: 4 }}>
              Popular:
            </span>
            {["Criminal", "Civil", "Family", "Property", "Corporate", "Constitutional"].map(cat => (
              <button
                key={cat}
                onClick={() => navigate(`/lawyers?specialization=${cat}`)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(197, 168, 128, 0.2)"
                  e.currentTarget.style.borderColor = "#C5A880"
                  e.currentTarget.style.color = "#FFFFFF"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)"
                }}
              >
                {cat} Law
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── METRIC COUNTER BAR ─────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #101B39 0%, #185FA5 100%)",
          padding: "32px 36px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            { value: lawyerCount || "50+", label: "Verified Advocates", icon: "🛡️" },
            { value: "100%", label: "Bar Council Authenticated", icon: "📜" },
            { value: "1,200+", label: "Cases & Consultations", icon: "⚖️" },
            { value: "4.8 / 5.0", label: "Client Satisfaction Rating", icon: "★" },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: "20px", marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: "30px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <small style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>
                {stat.label}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRACTICE AREAS SECTION ──────────────────────────────────────── */}
      <section id="practices" style={{ padding: "90px 32px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#185FA5",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                background: "rgba(24, 95, 165, 0.08)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              Legal Disciplines
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0F172A", margin: "14px 0 10px" }}>
              Comprehensive Practice Areas
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 600, margin: "0 auto" }}>
              Connect with specialized advocates practicing in Trial Courts, High Courts, and Appellate Tribunals.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {categories.map(cat => (
              <div
                key={cat.name}
                onClick={() => navigate(`/lawyers?specialization=${cat.name.split(" ")[0]}`)}
                className="law-card"
                style={{
                  padding: "26px 22px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.borderColor = "var(--color-primary)"
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.borderColor = "var(--color-border-primary)"
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: cat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span
                    className="badge rounded-pill"
                    style={{ fontSize: "10px", background: "#F1F5F9", color: "#475569" }}
                  >
                    {cat.count}
                  </span>
                </div>

                <div>
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "16px" }}>
                    {cat.name}
                  </h6>
                  <p className="text-secondary small mb-0" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>Consult Advocates</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <button
              onClick={() => navigate("/lawyers")}
              className="btn btn-law-primary px-4 py-2.5 fw-bold"
            >
              Browse Complete Directory →
            </button>
          </div>
        </div>
      </section>

      {/* ── BAR COUNCIL VERIFICATION SPOTLIGHT ──────────────────────────── */}
      <section
        id="verification"
        style={{
          background: "linear-gradient(135deg, #070D1A 0%, #0F1B38 100%)",
          padding: "85px 32px",
          color: "#FFFFFF",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#C5A880",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  background: "rgba(197, 168, 128, 0.15)",
                  padding: "4px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(197, 168, 128, 0.3)",
                }}
              >
                Zero Toleration for Fake Advocates
              </span>
              <h2 className="fw-bold text-white mt-3 mb-3" style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
                Authentic Legal Verification by Law
              </h2>
              <p className="text-white-50 mb-4" style={{ lineHeight: 1.7, fontSize: "15px" }}>
                Under the Advocates Act, practicing legal counsel must hold an active enrollment certificate.
                On LexCore, every advocate undergoes mandatory enrollment verification before appearing in search results:
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                {[
                  { title: "Bar Council ID Mandatory (*)", desc: "Enrolled license number verified against state bar records." },
                  { title: "Judicial Court Level Badges", desc: "Explicit transparency on practice eligibility in District, High, or Supreme Courts." },
                  { title: "Client Ratings & Genuine Case Audits", desc: "Real testimonials tied to recorded consultations and settled cases." },
                ].map(item => (
                  <div key={item.title} className="d-flex gap-3 align-items-start">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: 28, height: 28, background: "#10B981", fontSize: 13, marginTop: 2 }}
                    >
                      ✓
                    </div>
                    <div>
                      <div className="fw-bold text-white small">{item.title}</div>
                      <small className="text-white-50">{item.desc}</small>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/register")}
                className="btn btn-law-gold text-white fw-bold px-4 py-2"
              >
                Register as an Enrolled Advocate →
              </button>
            </div>

            <div className="col-lg-6">
              <div
                className="p-4 rounded-4"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(197, 168, 128, 0.3)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-25 mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "22px" }}>🛡️</span>
                    <h6 className="mb-0 fw-bold text-white">Genuine Advocate Verification</h6>
                  </div>
                  <span className="badge bg-success" style={{ fontSize: "11px" }}>Official Badge</span>
                </div>

                <div className="p-3 rounded-3 mb-3" style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981" }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-success fw-bold">✓ State Bar Council Verified</span>
                  </div>
                  <small className="text-white-50">
                    License Number: <strong>K/1842/2016</strong> · Bar Council of Kerala
                  </small>
                </div>

                <div className="d-flex justify-content-between small text-white-50 py-2 border-bottom border-secondary border-opacity-10">
                  <span>Authorized Jurisdiction:</span>
                  <span className="text-white fw-semibold">High Court & Appellate Tribunals</span>
                </div>
                <div className="d-flex justify-content-between small text-white-50 py-2 border-bottom border-secondary border-opacity-10">
                  <span>Advocate Seniority:</span>
                  <span className="text-white fw-semibold">Senior Counsel</span>
                </div>
                <div className="d-flex justify-content-between small text-white-50 py-2">
                  <span>Evidentiary Vault:</span>
                  <span className="text-success fw-semibold">256-Bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "90px 32px", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#185FA5",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                background: "rgba(24, 95, 165, 0.08)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              Streamlined Process
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0F172A", margin: "14px 0 10px" }}>
              How Legal Representation Works
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", margin: 0 }}>
              Transparent, confidential, and structured from initial brief to courtroom resolution.
            </p>
          </div>

          <div className="row g-4 position-relative">
            {steps.map((step) => (
              <div key={step.num} className="col-md-4">
                <div
                  className="law-card p-4 h-100 text-center"
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #185FA5 0%, #0F4377 100%)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                      margin: "0 auto 20px",
                      boxShadow: "0 6px 18px rgba(24, 95, 165, 0.3)",
                    }}
                  >
                    {step.num}
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{step.title}</h5>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE CAROUSEL ─────────────────────────────────────────────── */}
      <QuoteCarousel />

      {/* ── WHY CHOOSE US ──────────────────────────────────────────────── */}
      <section style={{ padding: "90px 32px", backgroundColor: "#F8FAFC" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 54 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#185FA5",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                background: "rgba(24, 95, 165, 0.08)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              Enterprise Standards
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0F172A", margin: "14px 0 10px" }}>
              Why Choose LexCore
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", margin: 0 }}>
              The modern standard for transparent legal counsel, case filing, and dispute advocacy.
            </p>
          </div>

          <div className="row g-3">
            {features.map(f => (
              <div key={f.title} className="col-lg-4 col-md-6">
                <div className="law-card p-4 h-100 d-flex gap-3">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "rgba(24, 95, 165, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{f.title}</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA HERO BANNER ────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #070D1A 0%, #0F1B38 50%, #185FA5 100%)",
          padding: "85px 32px",
          textAlign: "center",
          color: "#FFFFFF",
          borderTop: "1px solid rgba(197, 168, 128, 0.2)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: "38px", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Ready to Protect Your Rights?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255, 255, 255, 0.75)", marginBottom: 36, lineHeight: 1.6 }}>
            Browse verified counsel across high courts and district benches. Schedule your confidential consultation today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/lawyers")}
              className="btn btn-law-gold text-white fw-bold px-4 py-3"
            >
              Search Verified Advocates →
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn btn-outline-light fw-semibold px-4 py-3 rounded-3"
            >
              Register as an Advocate
            </button>
          </div>
        </div>
      </div>

      {/* ── UPGRADED FOOTER ────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#060A14",
          color: "#94A3B8",
          padding: "70px 32px 30px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="row g-4 mb-5">
            {/* Col 1: Brand & Trust Notice */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #C5A880 0%, #185FA5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  ⚖️
                </div>
                <span className="fw-bold text-white fs-5" style={{ letterSpacing: "-0.02em" }}>
                  LexCore
                </span>
              </div>
              <p className="small mb-3" style={{ lineHeight: 1.7, color: "rgba(255, 255, 255, 0.6)" }}>
                India's authenticated legal network connecting citizens and enterprises with genuine,
                Bar Council-enrolled advocates. Protecting rights through transparent counsel and digital courtroom workflow.
              </p>
              <div className="d-flex gap-2">
                <span className="badge px-2.5 py-1" style={{ background: "rgba(255, 255, 255, 0.06)", color: "#C5A880", border: "1px solid rgba(197, 168, 128, 0.3)", fontSize: "10px" }}>
                  🛡️ 256-Bit SSL Encrypted
                </span>
                <span className="badge px-2.5 py-1" style={{ background: "rgba(255, 255, 255, 0.06)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "10px" }}>
                  ✓ Bar Council Adherent
                </span>
              </div>
            </div>

            {/* Col 2: Legal Disciplines */}
            <div className="col-lg-2 col-md-6 col-6">
              <h6 className="fw-bold text-white text-uppercase small mb-3" style={{ letterSpacing: "1px" }}>
                Practices
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                {["Criminal Law", "Civil Litigation", "Family & Divorce", "Property & Titles", "Corporate M&A", "Constitutional Writs"].map(item => (
                  <li key={item}>
                    <a
                      href={`/lawyers?specialization=${item.split(" ")[0]}`}
                      onClick={(e) => { e.preventDefault(); navigate(`/lawyers?specialization=${item.split(" ")[0]}`); }}
                      className="text-decoration-none"
                      style={{ color: "rgba(255, 255, 255, 0.6)", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C5A880"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Advocates & Portal */}
            <div className="col-lg-3 col-md-6 col-6">
              <h6 className="fw-bold text-white text-uppercase small mb-3" style={{ letterSpacing: "1px" }}>
                For Advocates
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 small">
                {[
                  { label: "Apply for Directory Listing", action: () => navigate("/profile/edit") },
                  { label: "Bar Council Verification Policy", action: () => navigate("/lawyers") },
                  { label: "Case Docket & Hearings", action: () => navigate("/dashboard") },
                  { label: "Fee Invoicing & Razorpay", action: () => navigate("/billing") },
                  { label: "Advocate Code of Conduct", action: () => navigate("/lawyers") },
                ].map(item => (
                  <li key={item.label}>
                    <button
                      onClick={item.action}
                      className="btn btn-link p-0 text-start text-decoration-none small border-0"
                      style={{ color: "rgba(255, 255, 255, 0.6)", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C5A880"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Platform & Support */}
            <div className="col-lg-3 col-md-6">
              <h6 className="fw-bold text-white text-uppercase small mb-3" style={{ letterSpacing: "1px" }}>
                Client Assistance
              </h6>
              <p className="small mb-3" style={{ color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                Need emergency bail counsel or high court representation? Search our verified directory 24/7.
              </p>
              <div className="p-3 rounded-3" style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <small className="text-white-50 d-block mb-1">Direct Consultation Support</small>
                <div className="fw-bold text-white small">⚖️ verified@lexcore.legal</div>
              </div>
            </div>
          </div>

          {/* Bottom Bar & Statutory Disclaimer */}
          <div
            className="pt-4 border-top d-flex flex-wrap justify-content-between align-items-center gap-3"
            style={{ borderColor: "rgba(255, 255, 255, 0.08)", fontSize: "12px", color: "rgba(255, 255, 255, 0.4)" }}
          >
            <div>
              © 2026 LexCore Legal Technologies. All rights reserved. Registered under Indian Jurisdictions.
            </div>
            <div>
              Disclaimer: LexCore is a legal technology platform. Advocate listings adhere to the Advocates Act & Bar Council rules.
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
