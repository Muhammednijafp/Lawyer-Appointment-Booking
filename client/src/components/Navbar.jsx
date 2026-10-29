import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import NotificationDropdown from "./NotificationDropdown"
 
function Navbar() {
 
  const { user, logoutUser } = useContext(AuthContext)
  const navigate = useNavigate()
 
  const handleLogout = () => {
    logoutUser()
    navigate("/")  // ✅ redirect to login after logout
  }
 
  // ✅ Role badge color
  const roleBadge = () => {
    const map = {
      ADMIN: "bg-danger",
      LAWYER: "bg-primary",
      CLIENT: "bg-success",
    }
    return map[user?.role] || "bg-secondary"
  }
 
  return (
    <nav
      className="navbar bg-white shadow-sm px-4 d-flex justify-content-between align-items-center"
      style={{ height: "60px", position: "sticky", top: 0, zIndex: 1000 }}
    >
 
      {/* Left — Page title */}
      <h6 className="mb-0 fw-semibold text-dark">
        ⚖️ Law Management System
      </h6>
 
      {/* Right — User info + Notifications + Logout */}
      <div className="d-flex align-items-center gap-3">
 
        {/* Notification Bell */}
        <NotificationDropdown />
 
        {/* User info */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: 36, height: 36, fontSize: 14 }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
 
          <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
            <small className="fw-semibold text-dark">{user?.username}</small>
            <span className={`badge ${roleBadge()}`} style={{ fontSize: "9px" }}>
              {user?.role}
            </span>
          </div>
        </div>
 
        {/* Logout */}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
 
      </div>
 
    </nav>
  )
}
 
export default Navbar
 