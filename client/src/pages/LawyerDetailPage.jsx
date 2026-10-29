import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getLawyerById, submitReview } from "../api/fetchApi"

function StarRating({ rating, interactive = false, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: interactive ? 28 : 14, cursor: interactive ? "pointer" : "default", color: star <= (hover || Math.round(rating)) ? "#BA7517" : "#D3D1C7", transition: "color 0.1s" }}>★</span>
      ))}
      {!interactive && <span style={{ fontSize: 12, color: "#888780", marginLeft: 4 }}>{parseFloat(rating || 0).toFixed(1)}</span>}
    </div>
  )
}

function LawyerDetailPage() {
  const { userId } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [lawyer, setLawyer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("about")
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getLawyerById(userId)
        setLawyer(res.data)
      } catch (err) { setError("Lawyer not found.") }
      setLoading(false)
    }
    load()
  }, [userId])

  const handleBook = () => {
    const appointmentUrl = `/appointments?lawyer=${userId}&name=${lawyer.username}`
    if (!user) {
      // ✅ Redirect to /login with redirect back to appointments
      navigate(`/login?redirect=${encodeURIComponent(appointmentUrl)}`)
    } else {
      navigate(appointmentUrl)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.rating) { setReviewError("Please select a rating."); return }
    setSubmittingReview(true)
    setReviewError(null)
    try {
      const res = await submitReview(userId, reviewForm)
      setLawyer(prev => ({ ...prev, reviews: [res.data, ...(prev.reviews || [])] }))
      setReviewSuccess(true)
      setReviewForm({ rating: 0, comment: "" })
    } catch (err) {
      setReviewError(
        err.response?.data?.error || err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] || "Failed to submit review."
      )
    }
    setSubmittingReview(false)
  }

  const winRate = lawyer?.total_cases > 0 ? Math.round((lawyer.cases_won / lawyer.total_cases) * 100) : 0

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner-border" />
    </div>
  )

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--color-text-danger)" }}>{error}</div>
    </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/lawyers")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>← Back</button>
          <Link to="/" style={{ fontSize: 16, fontWeight: 500, textDecoration: "none", color: "var(--color-text-primary)" }}>⚖️ LawSystem</Link>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <button onClick={() => navigate("/dashboard")} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", border: "none", cursor: "pointer" }}>Dashboard</button>
          ) : (
            <>
              <Link to="/login" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)", textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", textDecoration: "none" }}>Register</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile header */}
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 6, background: lawyer.is_available ? "#1D9E75" : "#888780" }} />
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

              {/* Avatar */}
              <div style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 500, color: "#0C447C", overflow: "hidden" }}>
                {lawyer.profile_image
                  ? <img src={`http://127.0.0.1:8000${lawyer.profile_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : lawyer.username?.[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontWeight: 500 }}>Adv. {lawyer.username}</h4>
                  <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: lawyer.is_available ? "#E1F5EE" : "#F1EFE8", color: lawyer.is_available ? "#0F6E56" : "#5F5E5A" }}>
                    {lawyer.is_available ? "Available" : "Busy"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  {lawyer.specialization || "General Practice"} Law · {lawyer.court_level || "—"} Court · {lawyer.lawyer_type || "—"}
                </div>
                <StarRating rating={lawyer.average_rating || 0} />
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>
                  {lawyer.total_reviews} review{lawyer.total_reviews !== 1 ? "s" : ""}
                  {lawyer.city && ` · 📍 ${lawyer.city}${lawyer.state ? `, ${lawyer.state}` : ""}`}
                </div>
              </div>

              {/* Book */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>CONSULTATION FEE</div>
                  <div style={{ fontSize: 24, fontWeight: 500 }}>₹{parseFloat(lawyer.consultation_fee || 0).toLocaleString()}</div>
                </div>
                <button onClick={handleBook} disabled={!lawyer.is_available} style={{
                  width: "100%", padding: "10px 20px", borderRadius: 8, fontSize: 13,
                  background: lawyer.is_available ? "#185FA5" : "var(--color-background-secondary)",
                  color: lawyer.is_available ? "#fff" : "var(--color-text-tertiary)",
                  border: "none", cursor: lawyer.is_available ? "pointer" : "not-allowed", fontWeight: 500,
                }}>
                  {lawyer.is_available ? "Book Appointment" : "Not Available"}
                </button>
                {/* ✅ Show login hint for guests */}
                {!user && lawyer.is_available && (
                  <small style={{ color: "var(--color-text-tertiary)", fontSize: 11, textAlign: "center" }}>
                    You'll be asked to login
                  </small>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              {[
                { label: "Experience", value: `${lawyer.experience_years} yrs` },
                { label: "Total Cases", value: lawyer.total_cases },
                { label: "Cases Won", value: lawyer.cases_won },
                { label: "Win Rate", value: `${winRate}%`, highlight: winRate >= 70 },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center", padding: "12px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: stat.highlight ? "#0F6E56" : "var(--color-text-primary)" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 20 }}>
          {["about", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", fontSize: 13, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "2px solid #185FA5" : "2px solid transparent",
              color: activeTab === tab ? "#185FA5" : "var(--color-text-secondary)",
              fontWeight: activeTab === tab ? 500 : 400, textTransform: "capitalize",
            }}>
              {tab === "reviews" ? `Reviews (${lawyer.reviews?.length || 0})` : "About"}
            </button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === "about" && (
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "20px 24px" }}>
            {lawyer.bio && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>About</div>
                <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.7, margin: 0 }}>{lawyer.bio}</p>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Bar Council No.", value: lawyer.bar_council_number || "—" },
                { label: "Specialization", value: lawyer.specialization ? `${lawyer.specialization} Law` : "—" },
                { label: "Court Level", value: lawyer.court_level ? `${lawyer.court_level} Court` : "—" },
                { label: "Experience", value: `${lawyer.experience_years} years` },
                { label: "Location", value: [lawyer.city, lawyer.state].filter(Boolean).join(", ") || "—" },
                { label: "Email", value: lawyer.email ? <a href={`mailto:${lawyer.email}`} style={{ color: "#185FA5", textDecoration: "none" }}>{lawyer.email}</a> : "—" },
                { label: "Phone", value: lawyer.phone || "—" },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div>
            {/* Submit review — logged in clients only */}
            {user?.role === "CLIENT" && !reviewSuccess && (
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Rate this lawyer</div>
                {reviewError && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{reviewError}</div>}
                <StarRating rating={reviewForm.rating} interactive onChange={r => setReviewForm(prev => ({ ...prev, rating: r }))} />
                <textarea placeholder="Share your experience (optional)..." value={reviewForm.comment}
                  onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} rows={3}
                  style={{ width: "100%", marginTop: 12, padding: "10px 12px", borderRadius: 8, boxSizing: "border-box", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13, resize: "vertical" }} />
                <button onClick={handleSubmitReview} disabled={submittingReview || !reviewForm.rating}
                  style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, fontSize: 13, background: reviewForm.rating ? "#185FA5" : "var(--color-background-secondary)", color: reviewForm.rating ? "#fff" : "var(--color-text-tertiary)", border: "none", cursor: reviewForm.rating ? "pointer" : "not-allowed", fontWeight: 500 }}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}

            {/* ✅ Not logged in prompt with /login link */}
            {!user && (
              <div style={{ background: "#E6F1FB", borderRadius: 10, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#0C447C" }}>
                <Link to={`/login?redirect=${encodeURIComponent(`/lawyers/${userId}`)}`} style={{ color: "#185FA5", fontWeight: 500 }}>Login</Link> to leave a review for this lawyer.
              </div>
            )}

            {reviewSuccess && <div style={{ background: "#EAF3DE", color: "#27500A", padding: "12px 16px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✓ Review submitted successfully!</div>}

            {!lawyer.reviews?.length && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>No reviews yet. Be the first to review!</div>}

            {lawyer.reviews?.map(review => (
              <div key={review.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500 }}>
                      {review.client_username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{review.client_username}</div>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default LawyerDetailPage