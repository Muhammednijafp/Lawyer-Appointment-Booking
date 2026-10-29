import { useEffect, useState, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import {
  getAppointments,
  approveAppointment,
  rejectAppointment,
  createAppointment,
  getCaseCategories,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"
import { toast, ToastContainer } from "react-toastify"

function StatusBadge({ status }) {
  const map = {
    Pending:  { bg: "#FAEEDA", color: "#633806" },
    Approved: { bg: "#EAF3DE", color: "#27500A" },
    Rejected: { bg: "#FCEBEB", color: "#791F1F" },
  }
  const s = map[status] || { bg: "#F1EFE8", color: "#444441" }
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
      {status}
    </span>
  )
}

// ── Book Appointment Modal — styled like Register page ─────────────────────
function BookModal({ onClose, onBooked, prefilledLawyer }) {
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [form, setForm] = useState({
    lawyer: prefilledLawyer?.id || "",
    category: "",
    description: "",
    appointment_date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingCats(true)
      try {
        const res = await getCaseCategories()
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || [])
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
      setLoadingCats(false)
    }
    load()
  }, [])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.lawyer || !form.category || !form.appointment_date) {
      toast.error("Please fill in all required fields.")
      return
    }
    setLoading(true)
    try {
      const res = await createAppointment(form)
      toast.success("Appointment booked successfully!")
      onBooked(res.data)
      onClose()
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to book appointment."
      toast.error(message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: 16,
    }}
      onClick={onClose}
    >
      {/* ✅ Card styled exactly like Register page */}
      <div
        onClick={e => e.stopPropagation()}
        className="card shadow-lg p-4"
        style={{ width: "460px", borderRadius: "16px", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header — same as Register */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">📅</h2>
          <h4 className="fw-bold mb-1">Book Appointment</h4>
          <small className="text-muted">
            {prefilledLawyer
              ? `Request consultation with Adv. ${prefilledLawyer.name}`
              : "Request a consultation with a lawyer"}
          </small>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Lawyer ID */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Lawyer ID <span className="text-danger">*</span>
            </label>
            <input
              name="lawyer"
              type="number"
              className="form-control"
              placeholder="Enter the lawyer's user ID"
              value={form.lawyer}
              onChange={handleChange}
              required
              readOnly={!!prefilledLawyer?.id}
              style={prefilledLawyer?.id ? { background: "#f8f9fa" } : {}}
            />
            {prefilledLawyer && (
              <div className="form-text">
                Adv. {prefilledLawyer.name} — ID {prefilledLawyer.id}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Case Category <span className="text-danger">*</span>
            </label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              required
              disabled={loadingCats}
            >
              <option value="">
                {loadingCats ? "Loading categories..." : "Select a category"}
              </option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {categories.length === 0 && !loadingCats && (
              <div className="form-text text-danger">
                No categories found. Ask your admin to add case categories.
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Preferred Date & Time <span className="text-danger">*</span>
            </label>
            <input
              name="appointment_date"
              type="datetime-local"
              className="form-control"
              value={form.appointment_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Briefly describe your legal issue so the lawyer can prepare..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Submit — same style as Register */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading || loadingCats}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Booking...</>
            ) : "Book Appointment"}
          </button>

          {/* Cancel link — same style as Register's login link */}
          <p className="text-center mt-3 mb-0 text-muted">
            Changed your mind?{" "}
            <span
              onClick={onClose}
              className="text-primary fw-semibold"
              style={{ cursor: "pointer" }}
            >
              Cancel
            </span>
          </p>

        </form>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
function AppointmentsPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [appointments, setAppointments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  // ✅ Read prefilled lawyer from URL params
  const urlParams = new URLSearchParams(location.search)
  const prefilledLawyer = urlParams.get("lawyer")
    ? { id: urlParams.get("lawyer"), name: urlParams.get("name") || "" }
    : null

  useEffect(() => {
    if (prefilledLawyer) setShowModal(true)
  }, [])

  useEffect(() => { loadAppointments() }, [])

  useEffect(() => {
    setFiltered(
      statusFilter === "All"
        ? appointments
        : appointments.filter(a => a.status === statusFilter)
    )
  }, [statusFilter, appointments])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await getAppointments()
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setAppointments(data)
    } catch (err) {
      setError("Failed to load appointments.")
    }
    setLoading(false)
  }

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve")
    try {
      const res = await approveAppointment(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Approved" } : a))
      toast.success("Appointment approved! Case created.")
      if (res.data?.case_id) navigate(`/cases/${res.data.case_id}`)
    } catch (err) {
      toast.error("Failed to approve appointment.")
    }
    setActionLoading(null)
  }

  const handleReject = async (id) => {
    setActionLoading(id + "_reject")
    try {
      await rejectAppointment(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Rejected" } : a))
      toast.success("Appointment rejected.")
    } catch (err) {
      toast.error("Failed to reject appointment.")
    }
    setActionLoading(null)
  }

  const statuses = ["All", "Pending", "Approved", "Rejected"]
  const pendingCount = appointments.filter(a => a.status === "Pending").length

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {showModal && (
        <BookModal
          onClose={() => setShowModal(false)}
          onBooked={(newAppt) => setAppointments(prev => [newAppt, ...prev])}
          prefilledLawyer={prefilledLawyer}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 500, margin: "0 0 4px" }}>Appointments</h4>
          <small style={{ color: "var(--color-text-secondary)" }}>
            {user?.role === "LAWYER" && pendingCount > 0
              ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""} waiting`
              : `${appointments.length} total appointment${appointments.length !== 1 ? "s" : ""}`}
          </small>
        </div>
        {user?.role === "CLIENT" && (
          <button onClick={() => setShowModal(true)} style={{
            padding: "9px 20px", borderRadius: 8, fontSize: 13,
            background: "#185FA5", color: "#fff", border: "none",
            cursor: "pointer", fontWeight: 500,
          }}>
            + Book Appointment
          </button>
        )}
      </div>

      {/* Status filter */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        padding: "4px", background: "var(--color-background-secondary)",
        borderRadius: 10, width: "fit-content",
      }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 16px", borderRadius: 7, fontSize: 12,
            cursor: "pointer", border: "none", fontWeight: 500,
            background: statusFilter === s ? "var(--color-background-primary)" : "transparent",
            color: statusFilter === s ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            boxShadow: statusFilter === s ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>
            {s}
            {s === "Pending" && pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: "#185FA5", color: "#fff", borderRadius: 20, padding: "1px 6px", fontSize: 10 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-secondary)" }}>
          <div className="spinner-border spinner-border-sm" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13 }}>Loading appointments...</div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
            {statusFilter !== "All" ? `No ${statusFilter} appointments` : "No appointments yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 20 }}>
            {user?.role === "CLIENT" ? "Browse lawyers and book a consultation." : "No requests yet."}
          </div>
          {user?.role === "CLIENT" && statusFilter === "All" && (
            <button onClick={() => navigate("/lawyers")} style={{
              padding: "9px 24px", borderRadius: 8, fontSize: 13,
              background: "#185FA5", color: "#fff", border: "none",
              cursor: "pointer", fontWeight: 500,
            }}>
              Browse Lawyers
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(appt => (
            <div key={appt.id} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 12, padding: "18px 20px",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: { Pending: "#FAEEDA", Approved: "#EAF3DE", Rejected: "#FCEBEB" }[appt.status] || "#F1EFE8",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>
                      {appt.status === "Approved" ? "✅" : appt.status === "Rejected" ? "❌" : "🕐"}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {appt.category_name || "Legal Consultation"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 1 }}>
                        Appointment #{appt.id}
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px 20px", padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>
                        {user?.role === "CLIENT" ? "LAWYER" : "CLIENT"}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {user?.role === "CLIENT" ? appt.lawyer_username || "—" : appt.client_username || "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>DATE</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {new Date(appt.appointment_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>REQUESTED</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
                        {new Date(appt.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {appt.description && (
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 10, lineHeight: 1.6, padding: "0 2px" }}>
                      {appt.description}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 130 }}>
                  {user?.role === "LAWYER" && appt.status === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(appt.id)} disabled={actionLoading === appt.id + "_approve"}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, background: "#EAF3DE", color: "#27500A", border: "0.5px solid #97C459", cursor: "pointer", fontWeight: 500, width: "100%" }}>
                        {actionLoading === appt.id + "_approve" ? "Approving..." : "✓ Approve"}
                      </button>
                      <button onClick={() => handleReject(appt.id)} disabled={actionLoading === appt.id + "_reject"}
                        style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", cursor: "pointer", fontWeight: 500, width: "100%" }}>
                        {actionLoading === appt.id + "_reject" ? "Rejecting..." : "✕ Reject"}
                      </button>
                    </>
                  )}
                  {appt.status === "Approved" && (
                    <button onClick={() => navigate("/cases")}
                      style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, background: "#E6F1FB", color: "#0C447C", border: "0.5px solid #85B7EB", cursor: "pointer", width: "100%" }}>
                      View Case →
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default AppointmentsPage