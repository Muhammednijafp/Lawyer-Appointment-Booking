import { useEffect, useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getLawyers, verifyLawyer } from "../api/fetchApi"
import { toast, ToastContainer } from "react-toastify"

function StarRating({ rating }) {
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ fontSize: 13, color: star <= Math.round(rating) ? "#BA7517" : "#CBD5E1" }}>
          ★
        </span>
      ))}
      <span className="ms-1 small fw-bold text-secondary">{parseFloat(rating || 0).toFixed(1)}</span>
    </div>
  )
}

function LawyerCard({ lawyer, onView, onBook, userRole, onAdminAction }) {
  const winRate = lawyer.total_cases > 0 ? Math.round((lawyer.cases_won / lawyer.total_cases) * 100) : 0

  return (
    <div
      className="law-card overflow-hidden h-100 d-flex flex-column"
      style={{
        transition: "all 0.2s ease",
        borderColor: lawyer.is_verified ? "rgba(16, 185, 129, 0.3)" : "var(--color-border-primary)",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: lawyer.is_verified
            ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
            : lawyer.is_available
            ? "linear-gradient(90deg, #185FA5 0%, #0EA5E9 100%)"
            : "#94A3B8",
        }}
      />

      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Header: Photo, Name, Verified Badge, Availability */}
        <div className="d-flex gap-3 mb-3">
          <div
            className="rounded-circle overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{
              width: 54,
              height: 54,
              fontSize: 22,
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

          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex align-items-center justify-content-between gap-1 mb-1">
              <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: "15px" }}>
                Adv. {lawyer.username}
              </h6>
              <span
                className="badge rounded-pill"
                style={{
                  fontSize: "10px",
                  background: lawyer.is_available ? "#ECFDF5" : "#F1F5F9",
                  color: lawyer.is_available ? "#047857" : "#64748B",
                  border: `1px solid ${lawyer.is_available ? "#A7F3D0" : "#E2E8F0"}`,
                }}
              >
                {lawyer.is_available ? "● Available" : "○ Busy"}
              </span>
            </div>

            <div className="text-secondary small mb-1" style={{ fontSize: "12px" }}>
              {lawyer.specialization || "General"} Law · {lawyer.court_level || "High"} Court
            </div>

            <StarRating rating={lawyer.average_rating || 0} />
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="mb-2">
          {lawyer.is_verified ? (
            <div className="verified-shield w-100 justify-content-center py-1">
              <span>🛡️ Bar Council Verified</span>
              {lawyer.bar_council_number && (
                <span className="opacity-75 ms-1">({lawyer.bar_council_number})</span>
              )}
            </div>
          ) : lawyer.verification_status === "PENDING" ? (
            <div className="pending-badge w-100 justify-content-center py-1">
              <span>⏳ Bar Verification Pending</span>
              {lawyer.bar_council_number && (
                <span className="opacity-75 ms-1">({lawyer.bar_council_number})</span>
              )}
            </div>
          ) : (
            <div className="unverified-badge w-100 justify-content-center py-1">
              <span>⚠️ Unverified Advocate Profile</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {lawyer.bio ? (
          <p
            className="text-secondary small mb-3"
            style={{
              fontSize: "12px",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {lawyer.bio}
          </p>
        ) : (
          <p className="text-muted small fst-italic mb-3" style={{ fontSize: "11px" }}>
            Practicing legal advocate specializing in litigation and dispute resolution.
          </p>
        )}

        {/* Stats Grid */}
        <div className="row g-1 text-center py-2 mb-3 bg-light rounded-3 border">
          <div className="col-4 border-end">
            <div className="fw-bold text-dark small">{lawyer.experience_years || 0}y</div>
            <small className="text-muted" style={{ fontSize: "10px" }}>Exp</small>
          </div>
          <div className="col-4 border-end">
            <div className="fw-bold text-dark small">{lawyer.total_cases || 0}</div>
            <small className="text-muted" style={{ fontSize: "10px" }}>Cases</small>
          </div>
          <div className="col-4">
            <div className="fw-bold text-success small">{winRate}%</div>
            <small className="text-muted" style={{ fontSize: "10px" }}>Win Rate</small>
          </div>
        </div>

        {/* Fee & City */}
        <div className="d-flex justify-content-between align-items-center mb-3 mt-auto">
          <div>
            <small className="text-muted d-block" style={{ fontSize: "10px" }}>CONSULTATION</small>
            <span className="fw-bold text-dark fs-6">
              ₹{parseFloat(lawyer.consultation_fee || 0).toLocaleString()}
            </span>
          </div>
          {(lawyer.city || lawyer.state) && (
            <div className="text-secondary small d-flex align-items-center gap-1" style={{ fontSize: "12px" }}>
              <span>📍</span>
              <span>{[lawyer.city, lawyer.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button
            onClick={() => onView(lawyer.user_id)}
            className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
            style={{ borderRadius: "8px" }}
          >
            View Profile
          </button>
          <button
            onClick={() => onBook(lawyer)}
            disabled={!lawyer.is_available}
            className="btn btn-sm btn-primary flex-fill fw-bold"
            style={{
              borderRadius: "8px",
              background: lawyer.is_available ? "var(--color-primary)" : "#CBD5E1",
              borderColor: lawyer.is_available ? "var(--color-primary)" : "#CBD5E1",
            }}
          >
            Book Now
          </button>
        </div>

        {/* Admin Quick Verification Action */}
        {userRole === "ADMIN" && (
          <div className="mt-2 pt-2 border-top d-flex gap-2 justify-content-between">
            {!lawyer.is_verified ? (
              <button
                className="btn btn-sm btn-success w-100 fw-bold"
                style={{ fontSize: "11px" }}
                onClick={() => onAdminAction(lawyer.user_id, "approve")}
              >
                ✓ Verify & Approve Listing
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-danger w-100"
                style={{ fontSize: "11px" }}
                onClick={() => onAdminAction(lawyer.user_id, "reject")}
              >
                Revoke Verification
              </button>
            )}
          </div>
        )}
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
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sort, setSort] = useState("-average_rating")

  useEffect(() => {
    loadLawyers()
  }, [specialization, courtLevel, verifiedOnly, availableOnly, sort])

  const loadLawyers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (specialization) params.specialization = specialization
      if (courtLevel) params.court_level = courtLevel
      if (verifiedOnly) params.verified = "true"
      if (availableOnly) params.available = "true"
      if (sort) params.sort = sort

      const res = await getLawyers(params)
      setLawyers(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch (err) {
      setError("Failed to load lawyers.")
    }
    setLoading(false)
  }

  const handleBook = (lawyer) => {
    const appointmentUrl = `/appointments?lawyer=${lawyer.user_id}&name=${lawyer.username}`
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(appointmentUrl)}`)
    } else {
      navigate(appointmentUrl)
    }
  }

  const handleAdminVerify = async (userId, action) => {
    try {
      await verifyLawyer(userId, { action })
      toast.success(`Advocate ${action === "approve" ? "verified" : "updated"} successfully!`)
      loadLawyers()
    } catch (err) {
      toast.error("Failed to update advocate status.")
    }
  }

  const filtered = lawyers.filter(l =>
    !search ||
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()) ||
    l.bar_council_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.bio?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-secondary)" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Navigation Top Header */}
      <div
        className="px-4 py-3 d-flex align-items-center justify-content-between sticky-top"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-primary)",
        }}
      >
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white"
            style={{ width: 36, height: 36, background: "linear-gradient(135deg, #C5A880 0%, #185FA5 100%)", fontSize: 18 }}
          >
            ⚖️
          </div>
          <span className="fw-bold text-dark fs-5">LexCore Advocates</span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-sm btn-primary fw-semibold px-3 py-1.5 rounded-pill"
            >
              Dashboard →
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary px-3 py-1.5 rounded-pill fw-bold">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 1240 }}>
        {/* Hero Section */}
        <div className="text-center mb-4">
          <span className="badge px-3 py-1.5 rounded-pill mb-2" style={{ background: "rgba(24, 95, 165, 0.1)", color: "var(--color-primary)", border: "1px solid rgba(24, 95, 165, 0.2)" }}>
            🛡️ Bar Council Authenticated Directory
          </span>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Find Genuine, Verified Advocates
          </h2>
          <p className="text-secondary small mb-0" style={{ maxWidth: 640, margin: "0 auto" }}>
            Every advocate in our certified directory is verified with their official State Bar Council Enrollment ID.
            Compare expertise, ratings, fee structures, and book immediate consultations.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="law-card p-3 mb-4">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <input
                placeholder="Search by advocate name, Bar ID, city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-control form-control-sm"
              />
            </div>
            <div className="col-md-2 col-6">
              <select
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">All Practices</option>
                {["Criminal", "Civil", "Family", "Property", "Corporate", "Labour", "Tax", "Constitutional"].map(s => (
                  <option key={s} value={s}>{s} Law</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 col-6">
              <select
                value={courtLevel}
                onChange={e => setCourtLevel(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">All Courts</option>
                {["District", "High", "Supreme"].map(c => (
                  <option key={c} value={c}>{c} Court</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 col-6">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="-average_rating">Top Rated</option>
                <option value="-experience_years">Most Experienced</option>
                <option value="consultation_fee">Lowest Fee</option>
                <option value="-total_cases">Most Cases</option>
              </select>
            </div>
            <div className="col-md-2 col-6 d-flex align-items-center gap-3">
              <label className="d-flex align-items-center gap-1.5 cursor-pointer small text-secondary mb-0">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="form-check-input"
                />
                <span className="fw-semibold">🛡️ Verified</span>
              </label>

              <label className="d-flex align-items-center gap-1.5 cursor-pointer small text-secondary mb-0">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={e => setAvailableOnly(e.target.checked)}
                  className="form-check-input"
                />
                <span>Available</span>
              </label>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Lawyer Cards Grid */}
        {loading ? (
          <div className="row g-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-md-4">
                <div className="law-card p-5 text-center">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="law-card p-5 text-center">
            <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍⚖️</div>
            <h5 className="fw-bold text-dark">No Advocates Found</h5>
            <p className="text-secondary small mb-3">
              No registered lawyers match your current filters. Try relaxing your filter criteria.
            </p>
            <button
              onClick={() => {
                setSearch("")
                setSpecialization("")
                setCourtLevel("")
                setVerifiedOnly(false)
                setAvailableOnly(false)
              }}
              className="btn btn-sm btn-outline-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map(lawyer => (
              <div key={lawyer.id} className="col-lg-4 col-md-6">
                <LawyerCard
                  lawyer={lawyer}
                  onView={(userId) => navigate(`/lawyers/${userId}`)}
                  onBook={handleBook}
                  userRole={user?.role}
                  onAdminAction={handleAdminVerify}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LawyersPage
