import { useEffect, useState, useRef } from "react"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/fetchApi"

function NotificationDropdown() {

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // ✅ fetchApi returns axios response directly — use res.data
      const res = await getNotifications()
      const list = Array.isArray(res.data) ? res.data : res.data.results || []
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.is_read).length)
    } catch (err) {
      console.error("Failed to load notifications:", err)
    }
    setLoading(false)
  }

  const handleMarkRead = async (id) => {
    try {
      // ✅ correct function name from fetchApi
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      // ✅ correct function name from fetchApi
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
  }

  // Badge color by notification type
  const typeBadge = (type) => {
    const map = {
      APPOINTMENT: "bg-primary",
      INVOICE: "bg-success",
      CASE: "bg-warning text-dark",
      SYSTEM: "bg-secondary",
    }
    return map[type] || "bg-secondary"
  }

  return (
    <div className="position-relative" ref={dropdownRef}>

      {/* Bell button with unread badge */}
      <button
        className="btn btn-light position-relative"
        onClick={() => setIsOpen(prev => !prev)}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "10px" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="position-absolute end-0 bg-white shadow rounded border"
          style={{ width: "340px", zIndex: 1050, top: "110%" }}
        >

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-decoration-none p-0"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>

            {loading && (
              <div className="text-center py-4 text-muted">
                <small>Loading...</small>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-4 text-muted">
                <small>No notifications</small>
              </div>
            )}

            {!loading && notifications.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-2 border-bottom d-flex gap-2 align-items-start ${
                  !n.is_read ? "bg-light" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                {/* Unread dot */}
                <div className="pt-1">
                  {!n.is_read
                    ? <span className="bg-primary rounded-circle d-inline-block" style={{ width: 8, height: 8 }} />
                    : <span style={{ width: 8, height: 8, display: "inline-block" }} />
                  }
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="fw-semibold">{n.title}</small>
                    <span className={`badge ${typeBadge(n.notification_type)}`} style={{ fontSize: "9px" }}>
                      {n.notification_type}
                    </span>
                  </div>
                  <small className="text-muted d-block">{n.message}</small>
                  <small className="text-muted" style={{ fontSize: "10px" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>

              </div>
            ))}

          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="text-center py-2 border-top">
              <small
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </small>
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default NotificationDropdown