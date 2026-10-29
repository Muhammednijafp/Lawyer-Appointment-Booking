import { Link, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

function Sidebar() {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `nav-link d-flex align-items-center gap-2 rounded px-3 py-2 mb-1 ${
      isActive(path)
        ? "bg-primary text-white fw-semibold"
        : "text-white-50"
    }`

  return (
    <div
      className="d-flex flex-column bg-dark text-white vh-100 p-3"
      style={{ width: "230px", minHeight: "100vh", position: "sticky", top: 0 }}
    >

      {/* Logo */}
      <div className="text-center mb-4 pt-2">
        <h5 className="fw-bold text-white mb-0">⚖️ LawSystem</h5>
        <small className="text-white-50">{user?.role}</small>
      </div>

      <ul className="nav flex-column flex-grow-1">

        {/* ALL ROLES */}
        <li className="nav-item">
          <Link className={linkClass("/dashboard")} to="/dashboard">🏠 Dashboard</Link>
        </li>

        {/* ADMIN */}
        {user?.role === "ADMIN" && (
          <>
            <li className="nav-item"><Link className={linkClass("/cases")} to="/cases">📁 All Cases</Link></li>
            <li className="nav-item"><Link className={linkClass("/appointments")} to="/appointments">📅 Appointments</Link></li>
            <li className="nav-item"><Link className={linkClass("/billing")} to="/billing">💰 Billing</Link></li>
            <li className="nav-item"><Link className={linkClass("/lawyers")} to="/lawyers">👨‍⚖️ Lawyers</Link></li>
            <li className="nav-item"><Link className={linkClass("/clients")} to="/clients">👥 Clients</Link></li>
          </>
        )}

        {/* LAWYER */}
        {user?.role === "LAWYER" && (
          <>
            <li className="nav-item"><Link className={linkClass("/cases")} to="/cases">📁 My Cases</Link></li>
            <li className="nav-item"><Link className={linkClass("/appointments")} to="/appointments">📅 Appointments</Link></li>
            <li className="nav-item"><Link className={linkClass("/billing")} to="/billing">💰 Invoices</Link></li>
            <li className="nav-item"><Link className={linkClass("/hearings")} to="/hearings">🏛️ Hearings</Link></li>
            {/* ✅ Edit Profile link for lawyers */}
            <li className="nav-item"><Link className={linkClass("/profile/edit")} to="/profile/edit">✏️ Edit Profile</Link></li>
          </>
        )}

        {/* CLIENT */}
        {user?.role === "CLIENT" && (
          <>
            <li className="nav-item"><Link className={linkClass("/lawyers")} to="/lawyers">👨‍⚖️ Find Lawyers</Link></li>
            <li className="nav-item"><Link className={linkClass("/cases")} to="/cases">📁 My Cases</Link></li>
            <li className="nav-item"><Link className={linkClass("/appointments")} to="/appointments">📅 Appointments</Link></li>
            <li className="nav-item"><Link className={linkClass("/billing")} to="/billing">💰 My Invoices</Link></li>
          </>
        )}

        {/* COMMON */}
        <li className="nav-item">
          <Link className={linkClass("/notifications")} to="/notifications">🔔 Notifications</Link>
        </li>

      </ul>

      {/* User info at bottom */}
      <div className="border-top border-secondary pt-3 mt-2">
        <small className="text-white-50 d-block">Logged in as</small>
        <span className="text-white fw-semibold">{user?.username}</span>
      </div>

    </div>
  )
}

export default Sidebar