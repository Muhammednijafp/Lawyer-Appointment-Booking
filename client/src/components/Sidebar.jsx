import { Link, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function Sidebar() {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard"
    return location.pathname.startsWith(path)
  }

  const roleBadge = () => {
    switch (user?.role) {
      case "ADMIN":
        return { label: "Admin Portal", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" }
      case "LAWYER":
        return { label: "Advocate", color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" }
      default:
        return { label: "Client", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" }
    }
  }

  const badgeInfo = roleBadge()

  return (
    <aside
      className="d-flex flex-column vh-100 position-sticky top-0"
      style={{
        width: "250px",
        minWidth: "250px",
        background: "linear-gradient(180deg, #070D1A 0%, #0B1426 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.07)",
        zIndex: 1020,
        boxShadow: "4px 0 24px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Brand Header */}
      <div className="p-4 pb-3 border-bottom" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
        <Link to="/dashboard" className="text-decoration-none d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 42,
              height: 42,
              background: "linear-gradient(135deg, #C5A880 0%, #185FA5 100%)",
              fontSize: 20,
              boxShadow: "0 4px 14px rgba(197, 168, 128, 0.3)",
            }}
          >
            ⚖️
          </div>
          <div>
            <div className="fw-bold text-white fs-5" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              LexCore
            </div>
            <span
              className="badge px-2 py-0.5 rounded-pill"
              style={{
                fontSize: "10px",
                color: badgeInfo.color,
                background: badgeInfo.bg,
                border: `1px solid ${badgeInfo.color}33`,
              }}
            >
              {badgeInfo.label}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-grow-1 overflow-y-auto px-3 py-3">
        <div className="text-uppercase fw-bold text-white-50 px-3 mb-2" style={{ fontSize: "10px", letterSpacing: "1.2px" }}>
          Main Menu
        </div>

        <ul className="nav flex-column gap-1 list-unstyled mb-4">
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${
                isActive("/dashboard")
                  ? "bg-primary text-white fw-bold shadow-sm"
                  : "text-white-50 hover-white"
              }`}
              style={{
                fontSize: "13.5px",
                backgroundColor: isActive("/dashboard") ? "#185FA5" : "transparent",
              }}
            >
              <span style={{ fontSize: "16px" }}>🏠</span>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* ADMIN Specific */}
          {user?.role === "ADMIN" && (
            <>
              <li className="nav-item">
                <Link
                  to="/cases"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/cases") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/cases") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📁</span>
                  <span>All Cases</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/appointments"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/appointments") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/appointments") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <span>Appointments</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/billing"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/billing") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/billing") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>💰</span>
                  <span>Billing & Invoices</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/lawyers"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/lawyers") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/lawyers") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>👨‍⚖️</span>
                  <span>Lawyers Directory</span>
                </Link>
              </li>
            </>
          )}

          {/* LAWYER Specific */}
          {user?.role === "LAWYER" && (
            <>
              <li className="nav-item">
                <Link
                  to="/cases"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/cases") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/cases") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📁</span>
                  <span>My Cases</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/appointments"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/appointments") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/appointments") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <span>Consultations</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/billing"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/billing") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/billing") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>💰</span>
                  <span>Invoices & Fee</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/profile/edit"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/profile/edit") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/profile/edit") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📜</span>
                  <span>Bar Verification & Profile</span>
                </Link>
              </li>
            </>
          )}

          {/* CLIENT Specific */}
          {user?.role === "CLIENT" && (
            <>
              <li className="nav-item">
                <Link
                  to="/lawyers"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/lawyers") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/lawyers") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>👨‍⚖️</span>
                  <span>Find Advocates</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/cases"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/cases") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/cases") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📁</span>
                  <span>My Legal Cases</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/appointments"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/appointments") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/appointments") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>📅</span>
                  <span>Bookings</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/billing"
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                    isActive("/billing") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
                  }`}
                  style={{ fontSize: "13.5px", backgroundColor: isActive("/billing") ? "#185FA5" : "transparent" }}
                >
                  <span style={{ fontSize: "16px" }}>💰</span>
                  <span>Payments & Bills</span>
                </Link>
              </li>
            </>
          )}

          {/* COMMON */}
          <li className="nav-item mt-2">
            <Link
              to="/notifications"
              className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none ${
                isActive("/notifications") ? "bg-primary text-white fw-bold shadow-sm" : "text-white-50"
              }`}
              style={{ fontSize: "13.5px", backgroundColor: isActive("/notifications") ? "#185FA5" : "transparent" }}
            >
              <span style={{ fontSize: "16px" }}>🔔</span>
              <span>Notifications</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* User Info footer */}
      <div
        className="p-3 border-top d-flex align-items-center gap-3"
        style={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
          style={{
            width: 38,
            height: 38,
            background: "linear-gradient(135deg, #185FA5 0%, #0F4377 100%)",
            fontSize: 14,
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-grow-1 overflow-hidden" style={{ lineHeight: 1.2 }}>
          <div className="text-white fw-semibold text-truncate small">{user?.username}</div>
          <small className="text-white-50" style={{ fontSize: "11px" }}>
            {user?.email || user?.role}
          </small>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
