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

  // ✅ Read redirect param from URL
  const params = new URLSearchParams(location.search)
  const redirectTo = params.get("redirect") || "/dashboard"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password.")
      return
    }
    setLoading(true)
    const { success, error } = await loginUser(username, password)
    setLoading(false)

    if (success) {
      navigate(redirectTo)
    } else {
      toast.error(error || "Invalid username or password.")
    }
  }

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="card shadow-lg p-4" style={{ width: "420px", borderRadius: "16px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold">⚖️</h2>
          <h4 className="fw-bold mb-1">Welcome Back</h4>
          <small className="text-muted">Law Management System</small>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input className="form-control" placeholder="Enter your username"
              value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Logging in...</> : "Login"}
          </button>
          <p className="text-center mt-3 mb-0 text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary fw-semibold">Register</Link>
          </p>
          <p className="text-center mt-2 mb-0">
            <Link to="/" style={{ fontSize: 13, color: "#888" }}>← Back to Home</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login