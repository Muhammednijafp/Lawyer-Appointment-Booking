import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import {
  getMyLawyerProfile,
  updateMyLawyerProfile,
  updateCurrentUser,
  applyForLawyerListing,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"
import { toast, ToastContainer } from "react-toastify"

function LawyerProfileEditPage() {
  const { user, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [profile, setProfile] = useState({
    bar_council_number: "",
    specialization: "",
    court_level: "",
    experience_years: "",
    consultation_fee: "",
    bio: "",
    state: "",
    city: "",
    is_available: true,
    is_verified: false,
    verification_status: "NOT_APPLIED",
    verification_notes: "",
    applied_at: null,
  })

  const [account, setAccount] = useState({
    phone: "",
    lawyer_type: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (user?.role !== "LAWYER") {
      navigate("/dashboard")
      return
    }
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await getMyLawyerProfile()
      const d = res.data
      setProfile({
        bar_council_number: d.bar_council_number || "",
        specialization: d.specialization || "Civil",
        court_level: d.court_level || "High",
        experience_years: d.experience_years || 0,
        consultation_fee: d.consultation_fee || 0,
        bio: d.bio || "",
        state: d.state || "",
        city: d.city || "",
        is_available: d.is_available ?? true,
        is_verified: d.is_verified ?? false,
        verification_status: d.verification_status || "NOT_APPLIED",
        verification_notes: d.verification_notes || "",
        applied_at: d.applied_at || null,
      })
      setAccount({ phone: d.phone || "", lawyer_type: d.lawyer_type || "" })
      if (d.profile_image) setPreviewImage(`http://127.0.0.1:8000${d.profile_image}`)
    } catch (err) {
      toast.error("Failed to load advocate profile.")
    }
    setLoading(false)
  }

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateMyLawyerProfile(profile)
      toast.success("Profile saved successfully!")
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to update profile."
      )
    }
    setSaving(false)
  }

  // ✅ Apply for directory listing workflow
  const handleApplyListing = async () => {
    if (!profile.bar_council_number?.trim()) {
      toast.error("Bar Council Enrollment ID (*) is required to apply for listing.")
      return
    }
    setApplying(true)
    try {
      const res = await applyForLawyerListing(profile)
      toast.success("Application submitted for Bar Council verification!")
      setProfile(prev => ({
        ...prev,
        verification_status: "PENDING",
        applied_at: new Date().toISOString(),
      }))
    } catch (err) {
      toast.error(
        err.response?.data?.bar_council_number?.[0] ||
        err.response?.data?.detail ||
        "Failed to submit listing application."
      )
    }
    setApplying(false)
  }

  const handleSaveAccount = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("phone", account.phone)
      formData.append("lawyer_type", account.lawyer_type)
      if (profileImage) formData.append("profile_image", profileImage)
      const res = await updateCurrentUser(formData)
      updateUser(res.data)
      toast.success("Account information updated!")
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to update account."
      )
    }
    setSaving(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.02em" }}>
            Advocate Profile & Bar Verification
          </h4>
          <small className="text-muted">
            Manage your public directory credentials, specialization, fee structure, and Bar Council verification.
          </small>
        </div>
        <button
          onClick={() => navigate(`/lawyers/${user?.id}`)}
          className="btn btn-sm btn-outline-primary fw-semibold px-3 py-1.5 rounded-pill"
        >
          View Public Profile →
        </button>
      </div>

      {/* ── BAR COUNCIL VERIFICATION STATUS CARD ───────────────────────── */}
      <div
        className="law-card p-4 mb-4"
        style={{
          borderLeft: `5px solid ${
            profile.is_verified || profile.verification_status === "APPROVED"
              ? "#10B981"
              : profile.verification_status === "PENDING"
              ? "#F59E0B"
              : profile.verification_status === "REJECTED"
              ? "#EF4444"
              : "var(--color-gold)"
          }`,
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 50,
                height: 50,
                fontSize: 24,
                background:
                  profile.is_verified
                    ? "rgba(16, 185, 129, 0.15)"
                    : profile.verification_status === "PENDING"
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(197, 168, 128, 0.2)",
              }}
            >
              {profile.is_verified ? "🛡️" : profile.verification_status === "PENDING" ? "⏳" : "📜"}
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold mb-0 text-dark">
                  Bar Council Verification:{" "}
                  <span
                    className={
                      profile.is_verified
                        ? "text-success"
                        : profile.verification_status === "PENDING"
                        ? "text-warning"
                        : profile.verification_status === "REJECTED"
                        ? "text-danger"
                        : "text-secondary"
                    }
                  >
                    {profile.is_verified || profile.verification_status === "APPROVED"
                      ? "Verified Advocate ✓"
                      : profile.verification_status === "PENDING"
                      ? "Pending Verification"
                      : profile.verification_status === "REJECTED"
                      ? "Verification Rejected"
                      : "Not Yet Applied"}
                  </span>
                </h5>
              </div>

              <div className="text-secondary small">
                Enrollment ID: <strong>{profile.bar_council_number || "Not Registered"}</strong> ·{" "}
                {profile.is_verified
                  ? "Your credentials are confirmed and your profile is actively listed in the public directory."
                  : profile.verification_status === "PENDING"
                  ? "Your application is under review by the Bar Council Admin. You will be notified once approved."
                  : profile.verification_status === "REJECTED"
                  ? `Reason: ${profile.verification_notes || "Bar Council ID could not be validated. Please check and re-apply."}`
                  : "Submit your application below to get verified and listed in the public advocate directory."}
              </div>
            </div>
          </div>

          <div>
            {!profile.is_verified && profile.verification_status !== "PENDING" ? (
              <button
                onClick={handleApplyListing}
                disabled={applying}
                className="btn btn-law-gold text-white fw-bold d-flex align-items-center gap-2"
              >
                {applying ? "Submitting..." : "Apply for Directory Listing 🚀"}
              </button>
            ) : profile.verification_status === "PENDING" ? (
              <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                ⏳ Under Admin Review
              </span>
            ) : (
              <span className="badge bg-success px-3 py-2 fs-6">
                ✓ Directory Listed & Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex gap-2 border-bottom mb-4">
        <button
          onClick={() => setActiveTab("profile")}
          className={`btn btn-sm pb-2 fw-bold rounded-0 border-0 ${
            activeTab === "profile"
              ? "text-primary border-bottom border-primary border-3"
              : "text-secondary"
          }`}
        >
          Professional Details & Bar Credentials
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`btn btn-sm pb-2 fw-bold rounded-0 border-0 ${
            activeTab === "account"
              ? "text-primary border-bottom border-primary border-3"
              : "text-secondary"
          }`}
        >
          Account, Photo & Contact
        </button>
      </div>

      {/* ── Tab 1: Professional Details ─────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="law-card p-4 mb-4">
              <h6 className="fw-bold text-dark mb-3">Official Credentials</h6>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Bar Council Enrollment ID <span className="text-danger">*</span>
                  </label>
                  <input
                    name="bar_council_number"
                    value={profile.bar_council_number}
                    onChange={handleProfileChange}
                    placeholder="e.g. K/1234/2020"
                    className="form-control"
                    required
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Registered license number with State Bar Council.
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleProfileChange}
                    className="form-select"
                  >
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
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Primary Court Level
                  </label>
                  <select
                    name="court_level"
                    value={profile.court_level}
                    onChange={handleProfileChange}
                    className="form-select"
                  >
                    <option value="District">District Court</option>
                    <option value="High">High Court</option>
                    <option value="Supreme">Supreme Court</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Experience (Years)
                  </label>
                  <input
                    name="experience_years"
                    type="number"
                    min="0"
                    max="60"
                    value={profile.experience_years}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    name="consultation_fee"
                    type="number"
                    min="0"
                    step="100"
                    value={profile.consultation_fee}
                    onChange={handleProfileChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    value={profile.city}
                    onChange={handleProfileChange}
                    placeholder="e.g. Kochi, Mumbai"
                    className="form-control"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={profile.state}
                    onChange={handleProfileChange}
                    className="form-select"
                  >
                    <option value="">Select state</option>
                    {[
                      "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra", "Delhi",
                      "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Madhya Pradesh",
                      "Bihar", "Odisha", "Punjab", "Haryana", "Telangana", "Jharkhand", "Assam",
                    ].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    Advocate Biography & Practice Overview
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    rows="4"
                    placeholder="Describe your legal background, major cases handled, and areas of expertise..."
                    className="form-control"
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Visible to citizens when browsing advocate profiles.
                  </small>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn btn-primary px-4 fw-bold"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Availability Toggle */}
            <div className="law-card p-4 mb-4">
              <h6 className="fw-bold text-dark mb-2">Consultation Availability</h6>
              <p className="text-muted small mb-3">
                Control whether clients can currently request appointments with you.
              </p>
              <div className="form-check form-switch fs-5 mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={profile.is_available}
                  onChange={e => setProfile(p => ({ ...p, is_available: e.target.checked }))}
                />
                <label className="form-check-label fs-6 fw-bold ms-2 text-dark">
                  {profile.is_available ? "Accepting Consultations" : "Currently Unavailable"}
                </label>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="law-card p-4">
              <h6 className="fw-bold text-dark mb-3">Directory Verification Steps</h6>
              <ul className="list-unstyled small text-secondary d-flex flex-column gap-2 mb-0">
                <li className="d-flex align-items-center gap-2">
                  <span className={profile.bar_council_number ? "text-success" : "text-muted"}>
                    {profile.bar_council_number ? "✓" : "○"}
                  </span>
                  <span>Provide Bar Council ID (*)</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className={profile.specialization && profile.court_level ? "text-success" : "text-muted"}>
                    {profile.specialization && profile.court_level ? "✓" : "○"}
                  </span>
                  <span>Set Specialization & Court</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className={profile.bio ? "text-success" : "text-muted"}>
                    {profile.bio ? "✓" : "○"}
                  </span>
                  <span>Add Professional Bio</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <span className={profile.is_verified ? "text-success" : "text-muted"}>
                    {profile.is_verified ? "✓" : "○"}
                  </span>
                  <span>Admin Bar Council Verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Account & Photo ──────────────────────────────────────── */}
      {activeTab === "account" && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="law-card p-4">
              <h6 className="fw-bold text-dark mb-3">Profile Photo & Contact</h6>

              <div className="d-flex align-items-center gap-4 mb-4">
                <div
                  className="rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: 80,
                    height: 80,
                    fontSize: 32,
                    background: "linear-gradient(135deg, #0A1128 0%, #185FA5 100%)",
                  }}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user?.username?.[0]?.toUpperCase()
                  )}
                </div>

                <div>
                  <label className="form-label small fw-bold text-dark mb-1">Change Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control form-control-sm"
                  />
                  <small className="text-muted d-block mt-1">Recommended: square JPG or PNG</small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Contact Phone</label>
                <input
                  value={account.phone}
                  onChange={e => setAccount(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="form-control"
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-1">Advocate Seniority</label>
                <select
                  value={account.lawyer_type}
                  onChange={e => setAccount(p => ({ ...p, lawyer_type: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Select seniority</option>
                  <option value="Junior">Junior Advocate</option>
                  <option value="Senior">Senior Advocate</option>
                </select>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="btn btn-primary px-4 fw-bold"
                >
                  {saving ? "Saving..." : "Update Account Info"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default LawyerProfileEditPage
