import { useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import NotificationDropdown from "./NotificationDropdown"

function Navbar() {
  const { user, logoutUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logoutUser()
    navigate("/")
  }

  // Determine current section title
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith("/dashboard")) return "Dashboard Overview"
    if (path.startsWith("/cases")) return "Case Management"
    if (path.startsWith("/appointments")) return "Consultations & Schedule"
    if (path.startsWith("/billing")) return "Financials & Invoicing"
    if (path.startsWith("/lawyers")) return "Advocate Directory"
    if (path.startsWith("/profile/edit")) return "Bar Verification & Profile"
    if (path.startsWith("/notifications")) return "Activity Notifications"
    if (path.startsWith("/chat")) return "Case Consultation Chat"
    return "Legal Workspace"
  }

  const roleBadgeStyle = () => {
    switch (user?.role) {
      case "ADMIN":
        return { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D", label: "Admin" }
      case "LAWYER":
        return { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD", label: "Advocate" }
      default:
        return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0", label: "Client" }
    }
  }

  const badge = roleBadgeStyle()

  return (
    <nav
      className="navbar px-4 d-flex justify-content-between align-items-center"
      style={{
        height: "68px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border-primary)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Left: Section Context Title */}
      <div className="d-flex align-items-center gap-3">
        <div>
          <h5 className="mb-0 fw-bold text-dark" style={{ letterSpacing: "-0.02em" }}>
            {getPageTitle()}
          </h5>
          <small className="text-muted" style={{ fontSize: "11px" }}>
            Legal Practice & Management Suite
          </small>
        </div>
      </div>

      {/* Right: Quick actions + Notifications + Profile pill */}
      <div className="d-flex align-items-center gap-3">
        {/* Quick Context Action Button */}
        {user?.role === "CLIENT" && (
          <button
            onClick={() => navigate("/lawyers")}
            className="btn btn-sm btn-outline-primary fw-semibold d-none d-md-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
          >
            <span>👨‍⚖️</span>
            <span>Find Advocates</span>
          </button>
        )}

        {user?.role === "LAWYER" && (
          <button
            onClick={() => navigate("/profile/edit")}
            className="btn btn-sm fw-semibold d-none d-md-flex align-items-center gap-2 px-3 py-1.5 rounded-pill"
            style={{
              background: "rgba(197, 168, 128, 0.15)",
              color: "#8B6914",
              border: "1px solid rgba(197, 168, 128, 0.4)",
            }}
          >
            <span>📜</span>
            <span>Bar Profile</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        <div className="vr d-none d-sm-block my-1 text-secondary opacity-25" />

        {/* User Card Pill */}
        <div className="d-flex align-items-center gap-2 bg-light p-1 pe-3 rounded-pill border">
          <div
            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
            style={{
              width: 32,
              height: 32,
              fontSize: 13,
              background: "linear-gradient(135deg, #185FA5 0%, #0F4377 100%)",
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>

          <div className="d-flex flex-column" style={{ lineHeight: 1.1 }}>
            <span className="fw-bold text-dark small" style={{ fontSize: "12.5px" }}>
              {user?.username}
            </span>
            <span
              className="badge px-1.5 py-0 rounded"
              style={{
                fontSize: "9px",
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                width: "fit-content",
              }}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          className="btn btn-sm btn-outline-danger px-3 py-1.5 rounded-pill fw-semibold"
          onClick={handleLogout}
          title="Sign out of your account"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
