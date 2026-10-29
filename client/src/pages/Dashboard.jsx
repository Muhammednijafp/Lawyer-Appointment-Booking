import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getDashboard, getAppointments } from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

function StatCard({ title, value, icon, color }) {
  return (
    <div className="col-md-3 col-sm-6 mb-4">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center text-white ${color}`}
            style={{ width: 52, height: 52, fontSize: 22, flexShrink: 0 }}
          >
            {icon}
          </div>
          <div>
            <small className="text-muted d-block">{title}</small>
            <h4 className="fw-bold mb-0">
              {value ?? <span className="spinner-border spinner-border-sm" />}
            </h4>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nextAppointment, setNextAppointment] = useState(null)
  const [loadingAppt, setLoadingAppt] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const res = await getDashboard()
        setStats(res.data)
      } catch (err) {
        setError("Failed to load dashboard data.")
      }
      setLoading(false)
    }

    const loadNextAppointment = async () => {
      setLoadingAppt(true)
      try {
        const res = await getAppointments()
        const all = Array.isArray(res.data) ? res.data : res.data.results || []
        // ✅ Find next upcoming approved appointment
        const upcoming = all
          .filter(a => a.status === "Approved" && new Date(a.appointment_date) > new Date())
          .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
        setNextAppointment(upcoming[0] || null)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      }
      setLoadingAppt(false)
    }

    loadStats()
    loadNextAppointment()
  }, [])

  const getCards = () => {
    if (!stats) return []
    if (user?.role === "ADMIN") {
      return [
        { title: "Total Cases", value: stats.total_cases, icon: "📁", color: "bg-primary" },
        { title: "Ongoing Cases", value: stats.ongoing_cases, icon: "⚡", color: "bg-warning" },
        { title: "Closed Cases", value: stats.closed_cases, icon: "✅", color: "bg-success" },
        { title: "Total Invoices", value: stats.total_invoices, icon: "💰", color: "bg-info" },
        { title: "Pending Invoices", value: stats.pending_invoices, icon: "⏳", color: "bg-secondary" },
        { title: "Overdue Invoices", value: stats.overdue_invoices, icon: "🔴", color: "bg-danger" },
        { title: "Total Appointments", value: stats.total_appointments, icon: "📅", color: "bg-primary" },
        { title: "Unread Notifications", value: stats.unread_notifications, icon: "🔔", color: "bg-dark" },
      ]
    }
    if (user?.role === "LAWYER") {
      return [
        { title: "My Cases", value: stats.total_cases, icon: "📁", color: "bg-primary" },
        { title: "Ongoing Cases", value: stats.ongoing_cases, icon: "⚡", color: "bg-warning" },
        { title: "Closed Cases", value: stats.closed_cases, icon: "✅", color: "bg-success" },
        { title: "Pending Invoices", value: stats.pending_invoices, icon: "⏳", color: "bg-secondary" },
        { title: "Overdue Invoices", value: stats.overdue_invoices, icon: "🔴", color: "bg-danger" },
        { title: "Appointments", value: stats.total_appointments, icon: "📅", color: "bg-info" },
        { title: "Pending Appointments", value: stats.pending_appointments, icon: "🕐", color: "bg-warning" },
        { title: "Unread Notifications", value: stats.unread_notifications, icon: "🔔", color: "bg-dark" },
      ]
    }
    return [
      { title: "My Cases", value: stats.total_cases, icon: "📁", color: "bg-primary" },
      { title: "Ongoing Cases", value: stats.ongoing_cases, icon: "⚡", color: "bg-warning" },
      { title: "Pending Invoices", value: stats.pending_invoices, icon: "⏳", color: "bg-secondary" },
      { title: "Overdue Invoices", value: stats.overdue_invoices, icon: "🔴", color: "bg-danger" },
      { title: "Appointments", value: stats.total_appointments, icon: "📅", color: "bg-info" },
      { title: "Pending Appointments", value: stats.pending_appointments, icon: "🕐", color: "bg-warning" },
      { title: "Unread Notifications", value: stats.unread_notifications, icon: "🔔", color: "bg-dark" },
    ]
  }

  // ✅ Time until next appointment
  const timeUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date()
    if (diff < 0) return "Now"
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`
    return `in ${mins} minute${mins > 1 ? "s" : ""}`
  }

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Dashboard</h4>
          <small className="text-muted">
            Welcome back, <strong>{user?.username}</strong>
          </small>
        </div>
        <span className={`badge fs-6 ${
          user?.role === "ADMIN" ? "bg-danger" :
          user?.role === "LAWYER" ? "bg-primary" : "bg-success"
        }`}>
          {user?.role}
        </span>
      </div>

      {/* ✅ Next Appointment Banner */}
      {!loadingAppt && nextAppointment && (
        <div style={{
          background: "linear-gradient(135deg, #0C1B33, #185FA5)",
          borderRadius: 14, padding: "20px 24px",
          marginBottom: 24, display: "flex",
          justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>
              📅
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Next Appointment
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#fff", marginBottom: 2 }}>
                {nextAppointment.category_name || "Legal Consultation"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                with {user?.role === "CLIENT"
                  ? `Adv. ${nextAppointment.lawyer_username}`
                  : nextAppointment.client_username}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>DATE & TIME</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>
                {new Date(nextAppointment.appointment_date).toLocaleString([], {
                  dateStyle: "medium", timeStyle: "short"
                })}
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>TIME LEFT</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: "#9FE1CB" }}>
                {timeUntil(nextAppointment.appointment_date)}
              </div>
            </div>

            <button
              onClick={() => navigate("/appointments")}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13,
                background: "rgba(255,255,255,0.15)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer", fontWeight: 500,
              }}
            >
              View All →
            </button>
          </div>
        </div>
      )}

      {/* No upcoming appointments — small hint */}
      {!loadingAppt && !nextAppointment && user?.role === "CLIENT" && (
        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12, padding: "16px 20px",
          marginBottom: 24, display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>📅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>No upcoming appointments</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Book a consultation with a lawyer</div>
            </div>
          </div>
          <button onClick={() => navigate("/lawyers")} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 13,
            background: "#185FA5", color: "#fff", border: "none", cursor: "pointer",
          }}>
            Browse Lawyers
          </button>
        </div>
      )}

      {/* Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading skeleton */}
      {loading && (
        <div className="row">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-md-3 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="bg-secondary rounded mb-2" style={{ height: 14, width: "60%", opacity: 0.2 }} />
                  <div className="bg-secondary rounded" style={{ height: 28, width: "40%", opacity: 0.2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="row">
          {getCards().map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default Dashboard