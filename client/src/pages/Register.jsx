import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import { registerUser } from "../api/fetchApi"

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "", email: "", phone: "",
    password: "", confirm_password: "", role: "CLIENT",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirm_password) { toast.error("Passwords do not match."); return }
    if (formData.password.length < 8) { toast.error("Password must be at least 8 characters."); return }

    setLoading(true)
    try {
      await registerUser(formData)
      toast.success("Account created! Browse our lawyers.")
      setTimeout(() => navigate("/lawyers"), 1500)
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        Object.values(error.response?.data || {})?.[0]?.[0] ||
        "Something went wrong."
      toast.error(message)
    }
    setLoading(false)
  }

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="card shadow-lg p-4" style={{ width: "460px", borderRadius: "16px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">⚖️</h2>
          <h4 className="fw-bold mb-1">Create Account</h4>
          <small className="text-muted">Law Management System</small>
        </div>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input name="username" className="form-control" placeholder="Enter username"
              value={formData.username} onChange={handleChange} required autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input name="email" type="email" className="form-control" placeholder="Enter email"
              value={formData.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone</label>
            <input name="phone" type="tel" className="form-control" placeholder="Enter phone number"
              value={formData.phone} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Register as</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
              <option value="CLIENT">Client</option>
              <option value="LAWYER">Lawyer</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input name="password" type="password" className="form-control" placeholder="Min 8 characters"
              value={formData.password} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Confirm Password</label>
            <input name="confirm_password" type="password" className="form-control"
              placeholder="Repeat your password" value={formData.confirm_password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : "Register"}
          </button>
          <p className="text-center mt-3 mb-0 text-muted">
            Already have an account?{" "}
            {/* ✅ Updated to /login */}
            <Link to="/login" className="text-primary fw-semibold">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register