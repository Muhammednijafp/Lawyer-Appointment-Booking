import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  if (!user) {
    // ✅ Redirect to /login with current path as redirect param
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute