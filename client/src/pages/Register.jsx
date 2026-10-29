import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import { registerUser } from "../api/fetchApi"

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "CLIENT",
    bar_council_number: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match.")
      return
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    // ✅ Mandatory Bar Council ID validation for lawyer
    if (formData.role === "LAWYER") {
      const barId = formData.bar_council_number.trim()
      if (!barId) {
        toast.error("Bar Council Enrollment ID (*) is strictly required for lawyers.")
        return
      }
      if (barId.length < 4) {
        toast.error("Please enter a valid Bar Council Enrollment ID (e.g. K/1234/2020).")
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
        ...(formData.role === "LAWYER" ? { bar_council_number: formData.bar_council_number.trim() } : {}),
      }

      await registerUser(payload)

      if (formData.role === "LAWYER") {
        toast.success("Advocate registered! Please log in to apply for your directory listing.", {
          autoClose: 3500,
        })
      } else {
        toast.success("Account created successfully! Welcome to LawSystem.")
      }

      setTimeout(() => navigate("/login"), 1800)
    } catch (error) {
      const message =
        error.response?.data?.bar_council_number?.[0] ||
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        "Registration failed. Please try again."
      toast.error(message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="auth-box">
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
            style={{ width: 56, height: 56, background: "rgba(24, 95, 165, 0.1)", fontSize: 28 }}
          >
            ⚖️
          </div>
          <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.02em" }}>Create an Account</h3>
          <p className="text-muted small mb-0">Join our verified legal network and access counsel or cases</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Role selector pills */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">I am registering as</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`flex-fill py-2 rounded-3 border fw-semibold small transition-all ${
                  formData.role === "CLIENT"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-light text-secondary border-light-subtle"
                }`}
                onClick={() => setFormData(p => ({ ...p, role: "CLIENT" }))}
              >
                👤 Client / Citizen
              </button>
              <button
                type="button"
                className={`flex-fill py-2 rounded-3 border fw-semibold small transition-all ${
                  formData.role === "LAWYER"
                    ? "bg-dark text-white border-dark shadow-sm"
                    : "bg-light text-secondary border-light-subtle"
                }`}
                onClick={() => setFormData(p => ({ ...p, role: "LAWYER" }))}
              >
                👨‍⚖️ Advocate / Lawyer
              </button>
            </div>
          </div>

          {/* Bar Council ID (*) — Required for Lawyers */}
          {formData.role === "LAWYER" && (
            <div
              className="mb-3 p-3 rounded-3"
              style={{
                background: "linear-gradient(135deg, rgba(197, 168, 128, 0.15) 0%, rgba(24, 95, 165, 0.08) 100%)",
                border: "1.5px solid var(--color-gold)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label fw-bold mb-0 text-dark small d-flex align-items-center gap-1">
                  <span>📜 Bar Council Enrollment ID</span>
                  <span className="text-danger fw-bold">*</span>
                </label>
                <span className="badge bg-warning text-dark" style={{ fontSize: "10px" }}>Mandatory</span>
              </div>
              <p className="text-muted small mb-2" style={{ fontSize: "11px", lineHeight: "1.4" }}>
                Enter your official State Bar Council enrollment number (e.g., <strong>K/1234/2020</strong> or <strong>MH/5678/2019</strong>).
                Required for advocate authenticity and directory listing.
              </p>
              <input
                name="bar_council_number"
                className="form-control form-control-sm bg-white"
                placeholder="e.g. K/1234/2020"
                value={formData.bar_council_number}
                onChange={handleChange}
                required={formData.role === "LAWYER"}
                style={{ fontWeight: 500, letterSpacing: "0.5px" }}
              />
            </div>
          )}

          {/* Username */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Username</label>
            <input
              name="username"
              className="form-control"
              placeholder="e.g. adv_johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. advocate@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              className="form-control"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Passwords grid */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Password</label>
              <input
                name="password"
                type="password"
                className="form-control"
                placeholder="Min 8 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary mb-1">Confirm</label>
              <input
                name="confirm_password"
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            style={{ borderRadius: "10px", background: "var(--color-primary)", borderColor: "var(--color-primary)" }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>

          <p className="text-center mt-3 mb-0 text-muted small">
            Already registered?{" "}
            <Link to="/login" className="text-primary fw-bold text-decoration-none">
              Sign In
            </Link>
          </p>
          <div className="text-center mt-2">
            <Link to="/" className="text-secondary small text-decoration-none">
              ← Return to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
