import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getLawyerById, submitReview } from "../api/fetchApi"

function StarRating({ rating, interactive = false, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{
            fontSize: interactive ? 28 : 14,
            cursor: interactive ? "pointer" : "default",
            color: star <= (hover || Math.round(rating)) ? "#BA7517" : "#CBD5E1",
            transition: "color 0.1s",
          }}
        >
          ★
        </span>
      ))}
      {!interactive && (
        <span style={{ fontSize: 13, color: "#64748B", marginLeft: 4, fontWeight: 600 }}>
          {parseFloat(rating || 0).toFixed(1)}
        </span>
      )}
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
      } catch (err) {
        setError("Advocate not found or profile is unavailable.")
      }
      setLoading(false)
    }
    load()
  }, [userId])

  const handleBook = () => {
    const appointmentUrl = `/appointments?lawyer=${userId}&name=${lawyer.username}`
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(appointmentUrl)}`)
    } else {
      navigate(appointmentUrl)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.rating) {
      setReviewError("Please select a star rating.")
      return
    }
    setSubmittingReview(true)
    setReviewError(null)
    try {
      const res = await submitReview(userId, reviewForm)
      setLawyer(prev => ({ ...prev, reviews: [res.data, ...(prev.reviews || [])] }))
      setReviewSuccess(true)
      setReviewForm({ rating: 0, comment: "" })
    } catch (err) {
      setReviewError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to submit review."
      )
    }
    setSubmittingReview(false)
  }

  const winRate = lawyer?.total_cases > 0 ? Math.round((lawyer.cases_won / lawyer.total_cases) * 100) : 0

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner-border text-primary" />
      </div>
    )
  }

  if (error || !lawyer) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="text-danger fw-bold">{error || "Advocate not found."}</div>
        <button onClick={() => navigate("/lawyers")} className="btn btn-sm btn-primary">
          ← Back to Advocates Directory
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)" }}>
      {/* Top Navbar */}
      <div
        className="px-4 py-3 d-flex align-items-center justify-content-between sticky-top"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-primary)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate("/lawyers")} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
            ← Directory
          </button>
          <Link to="/" className="text-decoration-none fw-bold text-dark fs-5">
            ⚖️ LexCore
          </Link>
        </div>

        <div>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill">
              Dashboard →
            </button>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill">
              Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 940 }}>
        {/* Profile Card Header */}
        <div className="law-card overflow-hidden mb-4">
          <div
            style={{
              height: 6,
              background: lawyer.is_verified
                ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                : "linear-gradient(90deg, #185FA5 0%, #0EA5E9 100%)",
            }}
          />

          <div className="p-4">
            <div className="d-flex flex-wrap gap-4 align-items-start">
              {/* Profile Image */}
              <div
                className="rounded-circle overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                style={{
                  width: 90,
                  height: 90,
                  fontSize: 36,
                  background: "linear-gradient(135deg, #0A1128 0%, #185FA5 100%)",
                }}
              >
                {lawyer.profile_image ? (
                  <img
                    src={`http://127.0.0.1:8000${lawyer.profile_image}`}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  lawyer.username?.[0]?.toUpperCase()
                )}
              </div>

              {/* Bio & Credentials */}
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h3 className="fw-bold mb-0 text-dark">Adv. {lawyer.username}</h3>
                  {lawyer.is_verified ? (
                    <span className="verified-shield">🛡️ Bar Council Verified</span>
                  ) : (
                    <span className="unverified-badge">⚠️ Verification Pending</span>
                  )}
                  <span
                    className="badge rounded-pill"
                    style={{
                      background: lawyer.is_available ? "#ECFDF5" : "#F1EFE8",
                      color: lawyer.is_available ? "#047857" : "#5F5E5A",
                    }}
                  >
                    {lawyer.is_available ? "● Available for Consultations" : "○ Currently Unavailable"}
                  </span>
                </div>

                <div className="text-secondary small mb-2">
                  <strong>{lawyer.specialization || "General"} Law</strong> · Practicing at{" "}
                  <strong>{lawyer.court_level || "High"} Court</strong>
                  {lawyer.bar_council_number && (
                    <span className="text-dark fw-bold ms-2">
                      · Bar License No: <code>{lawyer.bar_council_number}</code>
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mb-2">
                  <StarRating rating={lawyer.average_rating || 0} />
                  <span className="text-muted small">
                    ({lawyer.total_reviews} verified client review{lawyer.total_reviews !== 1 ? "s" : ""})
                  </span>
                  {(lawyer.city || lawyer.state) && (
                    <span className="text-secondary small">
                      📍 {[lawyer.city, lawyer.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Fee & Action Card */}
              <div
                className="p-3 rounded-3 text-center d-flex flex-column gap-2"
                style={{
                  background: "var(--color-background-secondary)",
                  border: "1px solid var(--color-border-primary)",
                  minWidth: 190,
                }}
              >
                <small className="text-muted d-block fw-semibold" style={{ fontSize: "10px" }}>
                  CONSULTATION FEE
                </small>
                <h3 className="fw-bold text-dark mb-0">
                  ₹{parseFloat(lawyer.consultation_fee || 0).toLocaleString()}
                </h3>

                <button
                  onClick={handleBook}
                  disabled={!lawyer.is_available}
                  className="btn btn-sm btn-primary w-100 fw-bold mt-1"
                  style={{
                    background: lawyer.is_available ? "var(--color-primary)" : "#CBD5E1",
                    borderColor: lawyer.is_available ? "var(--color-primary)" : "#CBD5E1",
                  }}
                >
                  {lawyer.is_available ? "Book Appointment" : "Unavailable"}
                </button>
                {!user && lawyer.is_available && (
                  <small className="text-muted" style={{ fontSize: "10px" }}>
                    Sign in required to confirm slot
                  </small>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="row g-2 text-center mt-4 pt-3 border-top">
              <div className="col-3">
                <div className="p-2 bg-light rounded-3">
                  <h5 className="fw-bold text-dark mb-0">{lawyer.experience_years || 0} Years</h5>
                  <small className="text-muted" style={{ fontSize: "11px" }}>Experience</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 bg-light rounded-3">
                  <h5 className="fw-bold text-dark mb-0">{lawyer.total_cases || 0}</h5>
                  <small className="text-muted" style={{ fontSize: "11px" }}>Total Filings</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 bg-light rounded-3">
                  <h5 className="fw-bold text-dark mb-0">{lawyer.cases_won || 0}</h5>
                  <small className="text-muted" style={{ fontSize: "11px" }}>Cases Won</small>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 bg-light rounded-3">
                  <h5 className="fw-bold text-success mb-0">{winRate}%</h5>
                  <small className="text-muted" style={{ fontSize: "11px" }}>Success Rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex gap-2 border-bottom mb-4">
          <button
            onClick={() => setActiveTab("about")}
            className={`btn btn-sm pb-2 fw-bold rounded-0 border-0 ${
              activeTab === "about" ? "text-primary border-bottom border-primary border-3" : "text-secondary"
            }`}
          >
            About & Credentials
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`btn btn-sm pb-2 fw-bold rounded-0 border-0 ${
              activeTab === "reviews" ? "text-primary border-bottom border-primary border-3" : "text-secondary"
            }`}
          >
            Client Reviews ({lawyer.reviews?.length || 0})
          </button>
        </div>

        {/* Tab 1: About */}
        {activeTab === "about" && (
          <div className="law-card p-4">
            {lawyer.bio && (
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-2">Practice Profile & Experience</h6>
                <p className="text-secondary leading-relaxed mb-0" style={{ lineHeight: 1.7 }}>
                  {lawyer.bio}
                </p>
              </div>
            )}

            <h6 className="fw-bold text-dark mb-3">Authentic Bar Verification Overview</h6>
            <div className="row g-3">
              {[
                { label: "Bar Council Enrollment ID", value: lawyer.bar_council_number || "Not Recorded" },
                { label: "Verification Status", value: lawyer.is_verified ? "Official Verified Advocate ✓" : "Pending Verification" },
                { label: "Specialized Practice", value: `${lawyer.specialization || "General"} Law` },
                { label: "Primary Court", value: `${lawyer.court_level || "High"} Court` },
                { label: "Active Jurisdiction", value: [lawyer.city, lawyer.state].filter(Boolean).join(", ") || "All Courts" },
                { label: "Advocate Seniority", value: lawyer.lawyer_type || "Advocate" },
              ].map(item => (
                <div key={item.label} className="col-md-6">
                  <div className="p-3 rounded-3 bg-light border">
                    <small className="text-muted d-block" style={{ fontSize: "11px" }}>
                      {item.label}
                    </small>
                    <span className="fw-bold text-dark small">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === "reviews" && (
          <div>
            {user?.role === "CLIENT" && !reviewSuccess && (
              <div className="law-card p-4 mb-4">
                <h6 className="fw-bold text-dark mb-2">Leave a Verified Consultation Review</h6>
                {reviewError && <div className="alert alert-danger py-2">{reviewError}</div>}
                <div className="mb-3">
                  <StarRating rating={reviewForm.rating} interactive onChange={r => setReviewForm(p => ({ ...p, rating: r }))} />
                </div>
                <textarea
                  placeholder="Share feedback on advocate responsiveness, counsel clarity, and hearing representation..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  rows={3}
                  className="form-control mb-3"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewForm.rating}
                  className="btn btn-sm btn-primary fw-bold px-4"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                </button>
              </div>
            )}

            {reviewSuccess && (
              <div className="alert alert-success">✓ Thank you! Your review has been published.</div>
            )}

            {lawyer.reviews?.length === 0 ? (
              <div className="law-card p-5 text-center text-muted">
                No reviews recorded yet for Adv. {lawyer.username}.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {lawyer.reviews?.map(rev => (
                  <div key={rev.id} className="law-card p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 32, height: 32, background: "#185FA5", fontSize: 13 }}
                        >
                          {rev.client_username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">{rev.client_username}</div>
                          <StarRating rating={rev.rating} />
                        </div>
                      </div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    {rev.comment && <p className="text-secondary small mb-0">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LawyerDetailPage
