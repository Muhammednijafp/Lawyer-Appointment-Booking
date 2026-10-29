import { useEffect, useState, useRef, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

function TypeBadge({ type }) {
  const map = {
    APPOINTMENT: { bg: "#E6F1FB", color: "#0C447C" },
    INVOICE:     { bg: "#EAF3DE", color: "#27500A" },
    CASE:        { bg: "#FAEEDA", color: "#633806" },
    SYSTEM:      { bg: "#F1EFE8", color: "#444441" },
  }
  const s = map[type] || { bg: "#F1EFE8", color: "#444441" }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 8px", borderRadius: 20,
      fontSize: 10, fontWeight: 500,
    }}>
      {type}
    </span>
  )
}

function NotificationsPage() {
  const { user } = useContext(AuthContext)

  const [notifications, setNotifications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState("All")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  // ── Real-time WebSocket for live notifications ─────────
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/notifications/?token=${token}`
    )
    socketRef.current = socket

    socket.onopen = () => console.log("✅ Notifications socket connected")

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === "notification") {
        // ✅ Add new notification at the top in real time
        const newNotification = {
          id: Date.now(), // temp id until refetch
          title: data.title,
          message: data.message,
          notification_type: data.notification_type,
          is_read: false,
          created_at: new Date().toISOString(),
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }

    socket.onerror = (err) => console.error("Notification socket error:", err)
    socket.onclose = () => console.log("Notification socket closed")

    return () => socket.close()
  }, [])

  // ── Filter logic ───────────────────────────────────────
  useEffect(() => {
    let result = [...notifications]

    if (typeFilter !== "All") {
      result = result.filter(n => n.notification_type === typeFilter)
    }

    if (showUnreadOnly) {
      result = result.filter(n => !n.is_read)
    }

    setFiltered(result)
  }, [typeFilter, showUnreadOnly, notifications])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setNotifications(data)
    } catch (err) {
      setError("Failed to load notifications.")
      console.error(err)
    }
    setLoading(false)
  }

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  const types = ["All", "APPOINTMENT", "INVOICE", "CASE", "SYSTEM"]

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <DashboardLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h4 style={{ fontWeight: 500, margin: 0 }}>Notifications</h4>
          <small style={{ color: "var(--color-text-secondary)" }}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "All caught up!"}
          </small>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>

        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: "0.5px solid var(--color-border-secondary)",
                background: typeFilter === t ? "#185FA5" : "transparent",
                color: typeFilter === t ? "#fff" : "var(--color-text-secondary)",
                fontWeight: typeFilter === t ? 500 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Unread toggle */}
        <button
          onClick={() => setShowUnreadOnly(prev => !prev)}
          style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "0.5px solid var(--color-border-secondary)",
            background: showUnreadOnly ? "#FAEEDA" : "transparent",
            color: showUnreadOnly ? "#633806" : "var(--color-text-secondary)",
            fontWeight: showUnreadOnly ? 500 : 400,
          }}
        >
          Unread only
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "var(--color-background-danger)", color: "var(--color-text-danger)",
          padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
          <div className="spinner-border spinner-border-sm me-2" />
          Loading notifications...
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {showUnreadOnly ? "No unread notifications" : "No notifications yet"}
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: "var(--color-text-tertiary)" }}>
            {showUnreadOnly
              ? "You're all caught up!"
              : "Notifications from cases, invoices and appointments will appear here."}
          </div>
        </div>
      )}

      {/* Notification list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                padding: "14px 16px",
                background: !n.is_read
                  ? "var(--color-background-primary)"
                  : "transparent",
                border: !n.is_read
                  ? "0.5px solid var(--color-border-tertiary)"
                  : "0.5px solid transparent",
                borderRadius: 10,
                cursor: !n.is_read ? "pointer" : "default",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => {
                if (!n.is_read) e.currentTarget.style.borderColor = "var(--color-border-secondary)"
              }}
              onMouseLeave={e => {
                if (!n.is_read) e.currentTarget.style.borderColor = "var(--color-border-tertiary)"
              }}
            >
              {/* Unread dot */}
              <div style={{ paddingTop: 6, flexShrink: 0 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: !n.is_read ? "#185FA5" : "transparent",
                  border: n.is_read ? "1px solid var(--color-border-secondary)" : "none",
                }} />
              </div>

              {/* Icon circle */}
              <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: {
                  APPOINTMENT: "#E6F1FB",
                  INVOICE: "#EAF3DE",
                  CASE: "#FAEEDA",
                  SYSTEM: "#F1EFE8",
                }[n.notification_type] || "#F1EFE8",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 16,
              }}>
                {{
                  APPOINTMENT: "📅",
                  INVOICE: "💰",
                  CASE: "📁",
                  SYSTEM: "⚙️",
                }[n.notification_type] || "🔔"}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: !n.is_read ? 500 : 400,
                      color: "var(--color-text-primary)", marginBottom: 2,
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                      {n.message}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <TypeBadge type={n.notification_type} />
                    <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default NotificationsPage