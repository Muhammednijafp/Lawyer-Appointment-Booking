import { useEffect, useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getLawyers } from "../api/fetchApi"

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ fontSize: 13, color: star <= Math.round(rating) ? "#BA7517" : "#D3D1C7" }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#888780", marginLeft: 4 }}>{parseFloat(rating || 0).toFixed(1)}</span>
    </div>
  )
}

function LawyerCard({ lawyer, onView, onBook }) {
  const winRate = lawyer.total_cases > 0 ? Math.round((lawyer.cases_won / lawyer.total_cases) * 100) : 0

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 14, overflow: "hidden",
      transition: "border-color 0.15s, transform 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-border-secondary)"; e.currentTarget.style.transform = "translateY(-2px)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-tertiary)"; e.currentTarget.style.transform = "translateY(0)" }}
    >
      <div style={{ height: 4, background: lawyer.is_available ? "#1D9E75" : "#888780" }} />
      <div style={{ padding: "20px 20px 16px" }}>

        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "#E6F1FB", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, fontWeight: 500,
            color: "#0C447C", overflow: "hidden",
          }}>
            {lawyer.profile_image
              ? <img src={`http://127.0.0.1:8000${lawyer.profile_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : lawyer.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>Adv. {lawyer.username}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{lawyer.specialization || "General"} Law · {lawyer.court_level || "—"} Court</div>
            <StarRating rating={lawyer.average_rating || 0} />
          </div>
          <span style={{
            alignSelf: "flex-start", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 500,
            background: lawyer.is_available ? "#E1F5EE" : "#F1EFE8",
            color: lawyer.is_available ? "#0F6E56" : "#5F5E5A",
          }}>
            {lawyer.is_available ? "Available" : "Busy"}
          </span>
        </div>

        {lawyer.bio && (
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {lawyer.bio}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: "0.5px solid var(--color-border-tertiary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "10px 0", marginBottom: 14, gap: 8 }}>
          {[
            { label: "Exp.", value: `${lawyer.experience_years}y` },
            { label: "Cases", value: lawyer.total_cases },
            { label: "Win %", value: `${winRate}%`, highlight: winRate >= 70 },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", borderLeft: i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: s.highlight ? "#0F6E56" : "var(--color-text-primary)" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>FEE</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>₹{parseFloat(lawyer.consultation_fee || 0).toLocaleString()}</div>
          </div>
          {(lawyer.city || lawyer.state) && (
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>📍 {[lawyer.city, lawyer.state].filter(Boolean).join(", ")}</div>
          )}
        </div>

        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 14 }}>
          {lawyer.total_reviews} review{lawyer.total_reviews !== 1 ? "s" : ""}
          {lawyer.bar_council_number && ` · Bar No. ${lawyer.bar_council_number}`}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onView(lawyer.user_id)} style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", cursor: "pointer" }}>
            View Profile
          </button>
          <button onClick={() => onBook(lawyer)} disabled={!lawyer.is_available} style={{
            flex: 1, padding: "8px", borderRadius: 8, fontSize: 13,
            background: lawyer.is_available ? "#185FA5" : "var(--color-background-secondary)",
            color: lawyer.is_available ? "#fff" : "var(--color-text-tertiary)",
            border: "none", cursor: lawyer.is_available ? "pointer" : "not-allowed", fontWeight: 500,
          }}>
            Book Now
          </button>
        </div>

      </div>
    </div>
  )
}

function LawyersPage() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [courtLevel, setCourtLevel] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sort, setSort] = useState("-average_rating")

  useEffect(() => { loadLawyers() }, [specialization, courtLevel, availableOnly, sort])

  const loadLawyers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (specialization) params.specialization = specialization
      if (courtLevel) params.court_level = courtLevel
      if (availableOnly) params.available = "true"
      if (sort) params.sort = sort
      const res = await getLawyers(params)
      setLawyers(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch (err) { setError("Failed to load lawyers.") }
    setLoading(false)
  }

  const handleBook = (lawyer) => {
    const appointmentUrl = `/appointments?lawyer=${lawyer.user_id}&name=${lawyer.username}`
    if (!user) {
      // ✅ Redirect to /login with redirect back to appointments
      navigate(`/login?redirect=${encodeURIComponent(appointmentUrl)}`)
    } else {
      navigate(appointmentUrl)
    }
  }

  const filtered = lawyers.filter(l =>
    !search ||
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.bio?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>

      {/* Public navbar */}
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ fontSize: 16, fontWeight: 500, textDecoration: "none", color: "var(--color-text-primary)" }}>⚖️ LawSystem</Link>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <button onClick={() => navigate("/dashboard")} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", border: "none", cursor: "pointer" }}>
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)", textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", textDecoration: "none" }}>Register</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 500, marginBottom: 8 }}>Find the Right Lawyer</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 15, margin: 0 }}>
            Browse verified lawyers, check profiles, ratings and book a consultation.
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }} />
          <select value={specialization} onChange={e => setSpecialization(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }}>
            <option value="">All specializations</option>
            {["Criminal","Civil","Family","Property","Corporate","Labour","Tax","Constitutional"].map(s => <option key={s} value={s}>{s} Law</option>)}
          </select>
          <select value={courtLevel} onChange={e => setCourtLevel(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }}>
            <option value="">All courts</option>
            {["District","High","Supreme"].map(c => <option key={c} value={c}>{c} Court</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13 }}>
            <option value="-average_rating">Top Rated</option>
            <option value="-experience_years">Most Experienced</option>
            <option value="consultation_fee">Lowest Fee</option>
            <option value="-total_cases">Most Cases</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
            <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
            Available only
          </label>
          <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{filtered.length} lawyer{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {error && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 14, height: 340, border: "0.5px solid var(--color-border-tertiary)" }} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-secondary)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍⚖️</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>No lawyers found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map(lawyer => (
              <LawyerCard key={lawyer.id} lawyer={lawyer}
                onView={(userId) => navigate(`/lawyers/${userId}`)}
                onBook={handleBook}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default LawyersPage