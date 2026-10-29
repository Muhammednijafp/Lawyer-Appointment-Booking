import { useState, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getLawyers } from "../api/fetchApi"
import { AuthContext } from "../context/AuthContext"
import LegalScrollExperience from "../components/landing/LegalScrollExperience";


// ── Quote Carousel ─────────────────────────────────────────────────────────
const QUOTES = [
  { text: "The good of the people is the greatest law.", author: "Marcus Tullius Cicero" },
  { text: "Justice delayed is justice denied.", author: "William E. Gladstone" },
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
  { text: "The law is reason, free from passion.", author: "Aristotle" },
  { text: "Law and order are the medicine of the body politic.", author: "B. R. Ambedkar" },
  { text: "No man is above the law and no man is below it.", author: "Theodore Roosevelt" },
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
      }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ textAlign: "center", padding: "60px 24px", background: "#0C1B33" }}>
      <div style={{ fontSize: 32, color: "#FAEEDA", marginBottom: 20, opacity: 0.4 }}>"</div>
      <p style={{
        fontSize: 20, fontStyle: "italic", color: "#E6F1FB",
        maxWidth: 700, margin: "0 auto 16px",
        lineHeight: 1.7,
        opacity: fade ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        {QUOTES[idx].text}
      </p>
      <div style={{ fontSize: 13, color: "#85B7EB", opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
        — {QUOTES[idx].author}
      </div>
      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
        {QUOTES.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
            background: i === idx ? "#378ADD" : "#444",
            cursor: "pointer", transition: "all 0.3s",
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Main Landing Page ──────────────────────────────────────────────────────
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
      } catch (err) { }
    }
    loadStats()

    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/lawyers${search ? `?search=${encodeURIComponent(search)}` : ""}`)
  }

  const categories = [
    { icon: "⚖️", name: "Criminal Law", desc: "Defence, bail, trials", color: "#FCEBEB", text: "#A32D2D" },
    { icon: "🏛️", name: "Civil Law", desc: "Disputes, contracts, torts", color: "#E6F1FB", text: "#0C447C" },
    { icon: "👨‍👩‍👧", name: "Family Law", desc: "Divorce, custody, adoption", color: "#FBEAF0", text: "#72243E" },
    { icon: "🏠", name: "Property Law", desc: "Land, titles, real estate", color: "#EAF3DE", text: "#27500A" },
    { icon: "🏢", name: "Corporate Law", desc: "Business, contracts, IPO", color: "#FAEEDA", text: "#633806" },
    { icon: "👷", name: "Labour Law", desc: "Employment, wages, disputes", color: "#E1F5EE", text: "#0F6E56" },
    { icon: "💰", name: "Tax Law", desc: "GST, income tax, disputes", color: "#EEEDFE", text: "#3C3489" },
    { icon: "📜", name: "Constitutional Law", desc: "Rights, petitions, writs", color: "#F1EFE8", text: "#444441" },
  ]

  const features = [
    { icon: "✅", title: "Verified Lawyers", desc: "All lawyers are verified with bar council registration numbers and credentials." },
    { icon: "🔒", title: "Confidential & Secure", desc: "Your case details and conversations are fully encrypted and private." },
    { icon: "⚡", title: "Quick Response", desc: "Get connected with a lawyer within minutes, not days." },
    { icon: "💬", title: "Real-time Chat", desc: "Chat directly with your lawyer through our secure messaging system." },
    { icon: "📄", title: "Document Management", desc: "Upload, store and share case documents securely in one place." },
    { icon: "💰", title: "Transparent Pricing", desc: "See consultation fees upfront before booking. No hidden charges." },
  ]

  const steps = [
    { num: "01", title: "Find a Lawyer", desc: "Browse our verified lawyers by specialization, location and ratings." },
    { num: "02", title: "Book a Consultation", desc: "Choose a convenient time and book an appointment in seconds." },
    { num: "03", title: "Get Legal Help", desc: "Chat, share documents and track your case all in one place." },
  ]

  return (
    <div style={{ background: "#fff", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrolled ? "0.5px solid #e5e5e5" : "none",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚖️</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: scrolled ? "#0C1B33" : "#fff" }}>
            LawSystem
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Lawyers", "How It Works", "About"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{
              fontSize: 14, color: scrolled ? "#444" : "rgba(255,255,255,0.85)",
              textDecoration: "none", fontWeight: 400,
            }}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13,
                background: "#185FA5", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" style={{     
                padding: "8px 18px", borderRadius: 8, fontSize: 13,
                border: `1px solid ${scrolled ? "#ddd" : "rgba(255,255,255,0.4)"}`,
                color: scrolled ? "#333" : "#fff", textDecoration: "none",
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13,
                background: "#185FA5", color: "#fff", textDecoration: "none", fontWeight: 500,
              }}>
                Register Free
              </Link>
            </>
          )}
        </div>
      </nav>

      <LegalScrollExperience />

      {/* ── Hero ───────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0C1B33 0%, #1a3a5c 50%, #0F6E56 100%)",
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "100px 24px 60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />

        <div style={{ maxWidth: 780, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block", padding: "6px 16px", borderRadius: 20,
            background: "rgba(255,255,255,0.1)", color: "#9FE1CB",
            fontSize: 12, fontWeight: 500, marginBottom: 24, letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            Kerala's Trusted Legal Platform
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 500, color: "#fff",
            margin: "0 0 20px", lineHeight: 1.2,
          }}>
            Find the Right Lawyer,<br />
            <span style={{ color: "#9FE1CB" }}>Get Justice Today</span>
          </h1>

          <p style={{
            fontSize: 18, color: "rgba(255,255,255,0.7)",
            marginBottom: 40, lineHeight: 1.7,
          }}>
            Connect with verified lawyers across Kerala for Criminal, Civil, Family,
            Property and Corporate matters. Book consultations, manage cases and get
            real-time legal support.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: "flex", gap: 0, maxWidth: 580, margin: "0 auto 32px",
            background: "#fff", borderRadius: 12, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <input
              type="text"
              placeholder="Search by lawyer name, specialization or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, padding: "16px 20px", border: "none",
                fontSize: 14, color: "#333", outline: "none",
                background: "transparent",
              }}
            />
            <button type="submit" style={{
              padding: "16px 28px", background: "#185FA5", color: "#fff",
              border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              Find Lawyer
            </button>
          </form>

          {/* Quick links */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["Criminal", "Civil", "Family", "Property", "Corporate"].map(cat => (
              <button key={cat} onClick={() => navigate(`/lawyers?specialization=${cat}`)} style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 12,
                background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
              }}>
                {cat} Law
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <div style={{
        background: "#185FA5", padding: "28px 40px",
        display: "flex", justifyContent: "center", gap: 80, flexWrap: "wrap",
      }}>
        {[
          { value: lawyerCount || "50+", label: "Verified Lawyers" },
          { value: "500+", label: "Cases Handled" },
          { value: "1000+", label: "Happy Clients" },
          { value: "8+", label: "Practice Areas" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 500, color: "#fff" }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Practice Areas ─────────────────────────────────── */}
      <div id="lawyers" style={{ padding: "80px 40px", background: "#f8f9fa", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#185FA5", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            Our Expertise
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 500, color: "#0C1B33", margin: "0 0 12px" }}>
            Practice Areas
          </h2>
          <p style={{ fontSize: 16, color: "#666", margin: 0 }}>
            Expert lawyers across all areas of law, ready to help you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {categories.map(cat => (
            <div
              key={cat.name}
              onClick={() => navigate(`/lawyers?specialization=${cat.name.split(" ")[0]}`)}
              style={{
                background: "#fff", borderRadius: 14, padding: "24px 20px",
                border: "1px solid #eee", cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", gap: 10,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"
                e.currentTarget.style.borderColor = "#185FA5"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.borderColor = "#eee"
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: cat.color, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {cat.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#0C1B33" }}>{cat.name}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{cat.desc}</div>
              <div style={{ fontSize: 12, color: "#185FA5", marginTop: 4 }}>Find lawyers →</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button onClick={() => navigate("/lawyers")} style={{
            padding: "12px 32px", borderRadius: 8, fontSize: 14,
            background: "#0C1B33", color: "#fff", border: "none",
            cursor: "pointer", fontWeight: 500,
          }}>
            Browse All Lawyers
          </button>
        </div>
      </div>

      {/* ── How It Works ───────────────────────────────────── */}
      <div id="how-it-works" style={{ padding: "80px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#185FA5", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Simple Process
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: "#0C1B33", margin: 0 }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: "absolute", top: 28, left: "60%", right: "-20%",
                    height: 1, background: "linear-gradient(90deg, #185FA5, transparent)",
                    opacity: 0.3,
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, #185FA5, #0F6E56)",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18, fontWeight: 500,
                  margin: "0 auto 20px",
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: "#0C1B33", marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Law Quotes ─────────────────────────────────────── */}
      <QuoteCarousel />

      {/* ── Why Choose Us ──────────────────────────────────── */}
      <div id="about" style={{ padding: "80px 40px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#185FA5", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Why Us
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 500, color: "#0C1B33", margin: 0 }}>
              Why Choose LawSystem
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: "#fff", borderRadius: 12, padding: "24px 22px",
                border: "1px solid #eee", display: "flex", gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "#E6F1FB", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#0C1B33", marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0C1B33, #185FA5)",
        padding: "72px 40px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 500, color: "#fff", margin: "0 0 14px" }}>
          Need Legal Help?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", margin: "0 0 32px" }}>
          Browse verified lawyers and book a consultation today. It's free to get started.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/lawyers")} style={{
            padding: "13px 32px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            background: "#fff", color: "#0C1B33", border: "none", cursor: "pointer",
          }}>
            Browse Lawyers
          </button>


        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ background: "#0C1B33", padding: "48px 40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40, flexWrap: "wrap" }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>⚖️</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: "#fff" }}>LawSystem</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
                Kerala's trusted platform for connecting clients with verified lawyers.
                Get expert legal help for all your needs.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Services</div>
              {["Criminal Law", "Civil Law", "Family Law", "Property Law", "Corporate Law"].map(s => (
                <div key={s} onClick={() => navigate(`/lawyers?specialization=${s.split(" ")[0]}`)}
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, cursor: "pointer" }}>
                  {s}
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Company</div>
              {["About Us", "How It Works", "Register as Lawyer", "Contact Us"].map(s => (
                <div key={s} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, cursor: "pointer" }}>
                  {s}
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Legal</div>
              {["Privacy Policy", "Terms of Service", "FAQ", "Sitemap"].map(s => (
                <div key={s} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, cursor: "pointer" }}>
                  {s}
                </div>
              ))}
            </div>

          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              © 2026 LawSystem. All rights reserved.
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              Serving Kerala · India
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage