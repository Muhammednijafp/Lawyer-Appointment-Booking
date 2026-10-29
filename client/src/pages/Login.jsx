import { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"

function Login() {
  const { loginUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Read redirect param from URL
  const params = new URLSearchParams(location.search)
  const redirectTo = params.get("redirect") || "/dashboard"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password.")
      return
    }
    setLoading(true)
    const { success, error } = await loginUser(username.trim(), password)
    setLoading(false)

    if (success) {
      navigate(redirectTo)
    } else {
      toast.error(error || "Invalid username or password.")
    }
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
          <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.02em" }}>Welcome Back</h3>
          <p className="text-muted small mb-0">Sign in to manage your legal matters, consultations & cases</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary mb-1">Username</label>
            <input
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>

          <p className="text-center mt-3 mb-0 text-muted small">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary fw-bold text-decoration-none">
              Register now
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

export default Login
