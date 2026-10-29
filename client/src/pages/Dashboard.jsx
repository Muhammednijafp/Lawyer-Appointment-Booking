import { useEffect, useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import {
  getDashboard,
  getAppointments,
  getMyLawyerProfile,
  applyForLawyerListing,
  getLawyers,
  verifyLawyer,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"
import { toast, ToastContainer } from "react-toastify"

// ── Stat Card Component ────────────────────────────────────────────────────
function ModernStatCard({ title, value, icon, accent, subtitle, onClick }) {
  return (
    <div className="col-xl-3 col-md-6 mb-3">
      <div
        className="law-stat-card h-100"
        style={{
          "--stat-accent": accent || "var(--color-primary)",
          cursor: onClick ? "pointer" : "default",
        }}
        onClick={onClick}
      >
        <div
          className="rounded-3 d-flex align-items-center justify-content-center text-white"
          style={{
            width: 48,
            height: 48,
            fontSize: 22,
            background: accent || "var(--color-primary)",
            boxShadow: `0 4px 12px ${accent ? accent + "44" : "rgba(24,95,165,0.25)"}`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <small className="text-muted d-block fw-semibold text-truncate" style={{ fontSize: "12px" }}>
            {title}
          </small>
          <div className="d-flex align-items-baseline gap-2">
            <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-0.02em" }}>
              {value ?? <span className="spinner-border spinner-border-sm" />}
            </h3>
            {subtitle && (
              <small className="text-secondary" style={{ fontSize: "11px" }}>
                {subtitle}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Apply for Listing Modal (for Lawyer) ──────────────────────────────────
function ApplyListingModal({ profile, onClose, onApplied }) {
  const [form, setForm] = useState({
    bar_council_number: profile?.bar_council_number || "",
    specialization: profile?.specialization || "Civil",
    court_level: profile?.court_level || "High",
    experience_years: profile?.experience_years || 5,
    consultation_fee: profile?.consultation_fee || 1500,
    city: profile?.city || "",
    state: profile?.state || "",
    bio: profile?.bio || "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.bar_council_number.trim()) {
      toast.error("Bar Council Enrollment ID is mandatory.")
      return
    }
    setSubmitting(true)
    try {
      const res = await applyForLawyerListing(form)
      toast.success("Application submitted successfully! Your profile is now under review.")
      onApplied(res.data.profile)
      onClose()
    } catch (err) {
      toast.error(
        err.response?.data?.bar_council_number?.[0] ||
        err.response?.data?.detail ||
        "Failed to submit application. Please check fields."
      )
    }
    setSubmitting(false)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 17, 40, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card law-card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "560px", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="p-4 border-bottom d-flex justify-content-between align-items-center"
          style={{ background: "linear-gradient(135deg, #0A1128 0%, #152246 100%)", color: "#FFFFFF" }}
        >
          <div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "20px" }}>📜</span>
              <h5 className="mb-0 fw-bold">Apply for Advocate Directory Listing</h5>
            </div>
            <small className="text-white-50" style={{ fontSize: "12px" }}>
              Submit your credentials for genuine Bar Council verification
            </small>
          </div>
          <button onClick={onClose} className="btn-close btn-close-white" />
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-3 p-3 rounded-3" style={{ background: "rgba(197, 168, 128, 0.12)", border: "1px solid var(--color-gold)" }}>
            <label className="form-label fw-bold text-dark small mb-1">
              Bar Council Enrollment ID <span className="text-danger">*</span>
            </label>
            <input
              name="bar_council_number"
              className="form-control"
              placeholder="e.g. K/1234/2020 or MH/5678/2019"
              value={form.bar_council_number}
              onChange={handleChange}
              required
            />
            <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
              Must match your official State Bar Council license certificate.
            </small>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Specialization</label>
              <select name="specialization" className="form-select form-select-sm" value={form.specialization} onChange={handleChange}>
                <option value="Criminal">Criminal Law</option>
                <option value="Civil">Civil Law</option>
                <option value="Family">Family Law</option>
                <option value="Property">Property Law</option>
                <option value="Corporate">Corporate Law</option>
                <option value="Labour">Labour Law</option>
                <option value="Tax">Tax Law</option>
                <option value="Constitutional">Constitutional Law</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Primary Court Level</label>
              <select name="court_level" className="form-select form-select-sm" value={form.court_level} onChange={handleChange}>
                <option value="District">District Court</option>
                <option value="High">High Court</option>
                <option value="Supreme">Supreme Court</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                min="0"
                max="60"
                className="form-control form-control-sm"
                value={form.experience_years}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Consultation Fee (₹)</label>
              <input
                type="number"
                name="consultation_fee"
                min="0"
                step="100"
                className="form-control form-control-sm"
                value={form.consultation_fee}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">City</label>
              <input
                name="city"
                className="form-control form-control-sm"
                placeholder="e.g. Mumbai, New Delhi"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">State</label>
              <input
                name="state"
                className="form-control form-control-sm"
                placeholder="e.g. Maharashtra, Kerala"
                value={form.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Professional Bio & Practice Summary</label>
            <textarea
              name="bio"
              rows="3"
              className="form-control form-control-sm"
              placeholder="Highlight your case experience, courts practiced in, and legal specialties..."
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-sm btn-outline-secondary px-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-sm btn-primary px-4 fw-bold"
              style={{ background: "var(--color-primary)" }}
            >
              {submitting ? "Submitting Application..." : "Submit for Verification 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Admin Pending Lawyers Quick Review Modal ────────────────────────────────
function AdminReviewLawyersModal({ lawyers, onClose, onVerified }) {
  const [actionLoading, setActionLoading] = useState(null)

  const handleAction = async (userId, action) => {
    setActionLoading(userId)
    try {
      await verifyLawyer(userId, { action })
      toast.success(`Lawyer ${action === "approve" ? "approved & listed" : "rejected"}.`)
      onVerified()
    } catch (err) {
      toast.error("Failed to update lawyer status.")
    }
    setActionLoading(null)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 17, 40, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card law-card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "700px", maxHeight: "85vh", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-bottom bg-dark text-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">Pending Bar Council Verifications</h5>
            <small className="text-white-50">Review and verify genuine advocate license applications</small>
          </div>
          <button onClick={onClose} className="btn-close btn-close-white" />
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {lawyers.length === 0 ? (
            <div className="text-center py-4 text-muted">No pending lawyer applications right now.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {lawyers.map(l => (
                <div key={l.user_id} className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <div className="fw-bold text-dark fs-6">Adv. {l.username}</div>
                    <div className="text-muted small">
                      📜 Bar ID: <strong className="text-dark">{l.bar_council_number || "Not provided"}</strong> · {l.specialization || "General"} Law
                    </div>
                    <div className="text-secondary small">
                      📍 {[l.city, l.state].filter(Boolean).join(", ") || "City not set"} · {l.experience_years} years exp
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success fw-bold px-3"
                      disabled={actionLoading === l.user_id}
                      onClick={() => handleAction(l.user_id, "approve")}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-3"
                      disabled={actionLoading === l.user_id}
                      onClick={() => handleAction(l.user_id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Component ───────────────────────────────────────────────
function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextAppointment, setNextAppointment] = useState(null)
  const [loadingAppt, setLoadingAppt] = useState(true)

  // Lawyer Profile Verification Status
  const [lawyerProfile, setLawyerProfile] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Admin Pending Lawyers
  const [pendingLawyers, setPendingLawyers] = useState([])
  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [user?.role])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const res = await getDashboard()
      setStats(res.data)
    } catch (err) {
      setError("Failed to load dashboard data.")
    }
    setLoading(false)

    // Load next upcoming appointment
    setLoadingAppt(true)
    try {
      const apptRes = await getAppointments()
      const all = Array.isArray(apptRes.data) ? apptRes.data : apptRes.data.results || []
      const upcoming = all
        .filter(a => a.status === "Approved" && new Date(a.appointment_date) > new Date())
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
      setNextAppointment(upcoming[0] || null)
    } catch (err) {
      console.error(err)
    }
    setLoadingAppt(false)

    // Role-specific data
    if (user?.role === "LAWYER") {
      try {
        const profRes = await getMyLawyerProfile()
        setLawyerProfile(profRes.data)
      } catch (err) {
        console.error(err)
      }
    } else if (user?.role === "ADMIN") {
      try {
        const lawyersRes = await getLawyers({ verified: "pending" })
        const pending = Array.isArray(lawyersRes.data) ? lawyersRes.data : lawyersRes.data.results || []
        setPendingLawyers(pending)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const timeUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date()
    if (diff < 0) return "Now"
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `in ${hours} hr${hours > 1 ? "s" : ""}`
    return `in ${mins} min`
  }

  const statCards = () => {
    if (!stats) return []
    if (user?.role === "ADMIN") {
      return [
        { title: "Total Cases", value: stats.total_cases, icon: "📁", accent: "#185FA5", onClick: () => navigate("/cases") },
        { title: "Active Hearings / Ongoing", value: stats.ongoing_cases, icon: "⚡", accent: "#F59E0B", onClick: () => navigate("/cases") },
        { title: "Resolved Cases", value: stats.closed_cases, icon: "✅", accent: "#10B981", onClick: () => navigate("/cases") },
        { title: "Total Consultations", value: stats.total_appointments, icon: "📅", accent: "#0EA5E9", onClick: () => navigate("/appointments") },
        { title: "Total Billing Amount", value: stats.total_invoices, subtitle: "Invoices", icon: "💰", accent: "#8B5CF6", onClick: () => navigate("/billing") },
        { title: "Pending Invoices", value: stats.pending_invoices, icon: "⏳", accent: "#64748B", onClick: () => navigate("/billing") },
        { title: "Overdue Invoices", value: stats.overdue_invoices, icon: "🔴", accent: "#EF4444", onClick: () => navigate("/billing") },
        { title: "Notifications", value: stats.unread_notifications, subtitle: "Unread", icon: "🔔", accent: "#1E293B", onClick: () => navigate("/notifications") },
      ]
    }
    if (user?.role === "LAWYER") {
      return [
        { title: "My Assigned Cases", value: stats.total_cases, icon: "📁", accent: "#185FA5", onClick: () => navigate("/cases") },
        { title: "Ongoing Proceedings", value: stats.ongoing_cases, icon: "⚡", accent: "#F59E0B", onClick: () => navigate("/cases") },
        { title: "Closed / Won", value: stats.closed_cases, icon: "🏆", accent: "#10B981", onClick: () => navigate("/cases") },
        { title: "Consultation Requests", value: stats.total_appointments, icon: "📅", accent: "#0EA5E9", onClick: () => navigate("/appointments") },
        { title: "Pending Consultations", value: stats.pending_appointments, icon: "🕐", accent: "#F59E0B", onClick: () => navigate("/appointments") },
        { title: "Invoices Created", value: stats.total_invoices || 0, icon: "💰", accent: "#8B5CF6", onClick: () => navigate("/billing") },
        { title: "Pending Payments", value: stats.pending_invoices, icon: "⏳", accent: "#EF4444", onClick: () => navigate("/billing") },
        { title: "Unread Alerts", value: stats.unread_notifications, icon: "🔔", accent: "#1E293B", onClick: () => navigate("/notifications") },
      ]
    }
    // CLIENT
    return [
      { title: "My Active Cases", value: stats.total_cases, icon: "📁", accent: "#185FA5", onClick: () => navigate("/cases") },
      { title: "Ongoing Proceedings", value: stats.ongoing_cases, icon: "⚡", accent: "#F59E0B", onClick: () => navigate("/cases") },
      { title: "Resolved Matters", value: stats.closed_cases, icon: "✅", accent: "#10B981", onClick: () => navigate("/cases") },
      { title: "Booked Consultations", value: stats.total_appointments, icon: "📅", accent: "#0EA5E9", onClick: () => navigate("/appointments") },
      { title: "Pending Approvals", value: stats.pending_appointments, icon: "🕐", accent: "#F59E0B", onClick: () => navigate("/appointments") },
      { title: "Pending Payments", value: stats.pending_invoices, icon: "⏳", accent: "#EF4444", onClick: () => navigate("/billing") },
      { title: "Unread Notifications", value: stats.unread_notifications, icon: "🔔", accent: "#1E293B", onClick: () => navigate("/notifications") },
    ]
  }

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── Welcome Hero Banner ────────────────────────────────────────── */}
      <div
        className="rounded-4 p-4 mb-4 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0A1128 0%, #152246 60%, #185FA5 100%)",
        }}
      >
        <div className="position-relative z-1 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge px-2.5 py-1 rounded-pill" style={{ background: "rgba(197, 168, 128, 0.25)", color: "#C5A880", border: "1px solid rgba(197, 168, 128, 0.4)", fontSize: "11px" }}>
                ⚖️ Legal Intelligence Hub
              </span>
              <small className="text-white-50">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </small>
            </div>
            <h3 className="fw-bold mb-1" style={{ letterSpacing: "-0.02em" }}>
              Welcome back, {user?.role === "LAWYER" ? `Adv. ${user?.username}` : user?.username}!
            </h3>
            <p className="text-white-50 mb-0 small" style={{ maxWidth: "600px" }}>
              {user?.role === "LAWYER"
                ? "Manage your caseload, client consultations, hearings, and verified directory credentials."
                : user?.role === "ADMIN"
                ? "Oversee advocate license verifications, case assignments, dispute workflows, and billing."
                : "Track your legal proceedings, discover verified bar advocates, and schedule confidential consultations."}
            </p>
          </div>

          <div className="d-flex gap-2">
            {user?.role === "CLIENT" && (
              <button onClick={() => navigate("/lawyers")} className="btn btn-law-gold text-white fw-bold d-flex align-items-center gap-2">
                <span>👨‍⚖️ Find Advocates</span>
              </button>
            )}
            {user?.role === "LAWYER" && (
              <button onClick={() => setShowApplyModal(true)} className="btn btn-law-gold text-white fw-bold d-flex align-items-center gap-2">
                <span>📜 Directory Listing</span>
              </button>
            )}
            {user?.role === "ADMIN" && pendingLawyers.length > 0 && (
              <button onClick={() => setShowAdminReviewModal(true)} className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2">
                <span>📋 Verify Advocates ({pendingLawyers.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LAWYER VERIFICATION STATUS BANNER (CRITICAL) ───────────────── */}
      {user?.role === "LAWYER" && lawyerProfile && (
        <div className="mb-4">
          {lawyerProfile.verification_status === "APPROVED" || lawyerProfile.is_verified ? (
            <div
              className="p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(24, 95, 165, 0.08) 100%)",
                border: "1.5px solid #10B981",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 44, height: 44, background: "#10B981", fontSize: 20 }}>
                  🛡️
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark">Bar Council Verified Advocate</h6>
                    <span className="badge bg-success" style={{ fontSize: "10px" }}>Active on Directory</span>
                  </div>
                  <small className="text-secondary">
                    Enrollment ID: <strong>{lawyerProfile.bar_council_number || "Verified"}</strong> · Practicing at {lawyerProfile.court_level || "High"} Court
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Link to={`/lawyers/${user.id}`} className="btn btn-sm btn-outline-success fw-semibold">
                  View Public Profile →
                </Link>
                <Link to="/profile/edit" className="btn btn-sm btn-light border fw-semibold">
                  Update Credentials
                </Link>
              </div>
            </div>
          ) : lawyerProfile.verification_status === "PENDING" ? (
            <div
              className="p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(24, 95, 165, 0.08) 100%)",
                border: "1.5px solid #F59E0B",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-dark" style={{ width: 44, height: 44, background: "#FEF3C7", fontSize: 20 }}>
                  ⏳
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark">Bar Council Verification Under Review</h6>
                    <span className="badge bg-warning text-dark" style={{ fontSize: "10px" }}>Pending Review</span>
                  </div>
                  <small className="text-secondary">
                    Enrollment ID: <strong>{lawyerProfile.bar_council_number}</strong>. Submitted on{" "}
                    {lawyerProfile.applied_at ? new Date(lawyerProfile.applied_at).toLocaleDateString() : "recently"}. The Bar Administrator is currently validating your credentials.
                  </small>
                </div>
              </div>
              <Link to="/profile/edit" className="btn btn-sm btn-warning text-dark fw-bold">
                Review Application Details
              </Link>
            </div>
          ) : lawyerProfile.verification_status === "REJECTED" ? (
            <div
              className="p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(24, 95, 165, 0.08) 100%)",
                border: "1.5px solid #EF4444",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 44, height: 44, background: "#EF4444", fontSize: 20 }}>
                  ⚠️
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-danger">Directory Listing Application Rejected</h6>
                  <small className="text-secondary">
                    Reason: {lawyerProfile.verification_notes || "Bar Council ID could not be authenticated. Please re-check your license details."}
                  </small>
                </div>
              </div>
              <button onClick={() => setShowApplyModal(true)} className="btn btn-sm btn-danger fw-bold">
                Re-apply for Directory Listing
              </button>
            </div>
          ) : (
            /* NOT APPLIED YET */
            <div
              className="p-3 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(197, 168, 128, 0.2) 0%, rgba(24, 95, 165, 0.1) 100%)",
                border: "1.5px solid var(--color-gold)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-dark" style={{ width: 44, height: 44, background: "#FAF6F0", fontSize: 20 }}>
                  📜
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="fw-bold mb-0 text-dark">Apply for Lawyer Directory Listing</h6>
                    <span className="badge bg-secondary" style={{ fontSize: "10px" }}>Action Required</span>
                  </div>
                  <small className="text-secondary">
                    You registered with Bar Council ID: <strong>{lawyerProfile.bar_council_number || "Pending"}</strong>. Apply now to get verified and become visible to citizens seeking counsel.
                  </small>
                </div>
              </div>
              <button onClick={() => setShowApplyModal(true)} className="btn btn-sm btn-law-gold text-white fw-bold">
                Apply for Lawyers List →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN: PENDING LAWYERS BANNER ──────────────────────────────── */}
      {user?.role === "ADMIN" && pendingLawyers.length > 0 && (
        <div
          className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center"
          style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D" }}
        >
          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: "24px" }}>📋</span>
            <div>
              <div className="fw-bold text-dark">
                {pendingLawyers.length} Advocate{pendingLawyers.length > 1 ? "s" : ""} Awaiting Bar Verification
              </div>
              <small className="text-secondary">
                Review license credentials before admitting them to the public directory.
              </small>
            </div>
          </div>
          <button onClick={() => setShowAdminReviewModal(true)} className="btn btn-sm btn-warning text-dark fw-bold">
            Review Applications ({pendingLawyers.length})
          </button>
        </div>
      )}

      {/* ── Upcoming Appointment Spotlight ─────────────────────────────── */}
      {!loadingAppt && nextAppointment && (
        <div
          className="rounded-3 p-3 mb-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
          style={{
            background: "linear-gradient(135deg, #070D1A 0%, #101B39 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)", fontSize: 20 }}
            >
              📅
            </div>
            <div>
              <div className="text-white-50 text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "1px" }}>
                Next Upcoming Consultation
              </div>
              <div className="fw-bold text-white fs-6">
                {nextAppointment.category_name || "Legal Consultation"}
                <span className="text-white-50 fw-normal ms-2 small">
                  with {user?.role === "CLIENT" ? `Adv. ${nextAppointment.lawyer_username}` : nextAppointment.client_username}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div>
              <small className="text-white-50 d-block" style={{ fontSize: "10px" }}>SCHEDULE</small>
              <span className="fw-semibold small">
                {new Date(nextAppointment.appointment_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div>
              <small className="text-white-50 d-block" style={{ fontSize: "10px" }}>TIME REMAINING</small>
              <span className="badge bg-info text-dark fw-bold">
                {timeUntil(nextAppointment.appointment_date)}
              </span>
            </div>
            <button onClick={() => navigate("/appointments")} className="btn btn-sm btn-outline-light">
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="row g-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-md-3">
              <div className="law-card p-4">
                <div className="spinner-border spinner-border-sm text-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {statCards().map((card, i) => (
            <ModernStatCard key={i} {...card} />
          ))}
        </div>
      )}

      {/* ── Quick Actions Grid ─────────────────────────────────────────── */}
      <div className="law-card p-4 mb-4">
        <h6 className="fw-bold text-dark mb-3">Quick Legal Actions</h6>
        <div className="row g-3">
          {user?.role === "CLIENT" && (
            <>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/lawyers")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>👨‍⚖️</span>
                  <div>
                    <div className="fw-bold text-dark small">Search Verified Advocates</div>
                    <small className="text-muted">Filter by specialization, court & fees</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/cases")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>📁</span>
                  <div>
                    <div className="fw-bold text-dark small">Track Legal Cases</div>
                    <small className="text-muted">Upload evidence & view case timeline</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/billing")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>💳</span>
                  <div>
                    <div className="fw-bold text-dark small">Pay Invoices Online</div>
                    <small className="text-muted">Instant Razorpay & PDF receipts</small>
                  </div>
                </button>
              </div>
            </>
          )}

          {user?.role === "LAWYER" && (
            <>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/cases")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>📁</span>
                  <div>
                    <div className="fw-bold text-dark small">My Active Cases</div>
                    <small className="text-muted">Manage filings, client documents & logs</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/appointments")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>📅</span>
                  <div>
                    <div className="fw-bold text-dark small">Consultation Calendar</div>
                    <small className="text-muted">Approve or reschedule client bookings</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>📜</span>
                  <div>
                    <div className="fw-bold text-dark small">Bar Verification Profile</div>
                    <small className="text-muted">Enrollment ID, fees & practice areas</small>
                  </div>
                </button>
              </div>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/lawyers")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>👨‍⚖️</span>
                  <div>
                    <div className="fw-bold text-dark small">Advocates Directory</div>
                    <small className="text-muted">Verify license authenticity & listings</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/cases")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>📁</span>
                  <div>
                    <div className="fw-bold text-dark small">All System Cases</div>
                    <small className="text-muted">Assign counsel & manage disputes</small>
                  </div>
                </button>
              </div>
              <div className="col-md-4">
                <button
                  onClick={() => navigate("/billing")}
                  className="btn btn-light w-100 p-3 text-start border d-flex align-items-center gap-3 law-card"
                >
                  <span style={{ fontSize: "24px" }}>💰</span>
                  <div>
                    <div className="fw-bold text-dark small">Invoicing & Revenue</div>
                    <small className="text-muted">Track payments, refunds & statements</small>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {showApplyModal && (
        <ApplyListingModal
          profile={lawyerProfile}
          onClose={() => setShowApplyModal(false)}
          onApplied={(updated) => setLawyerProfile(updated)}
        />
      )}

      {showAdminReviewModal && (
        <AdminReviewLawyersModal
          lawyers={pendingLawyers}
          onClose={() => setShowAdminReviewModal(false)}
          onVerified={() => loadAllData()}
        />
      )}
    </DashboardLayout>
  )
}

export default Dashboard
