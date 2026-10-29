import { useEffect, useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import {
  getInvoices, createInvoice, markInvoicePaid,
  cancelInvoice, downloadInvoicePDF,
  createPaymentOrder, verifyPayment,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

// ✅ Your Razorpay Key ID — replace with your actual key
const RAZORPAY_KEY_ID = "rzp_test_RifDitkcb9Q5gl"  // e.g. rzp_test_XXXXXXXXXX

function StatusBadge({ status }) {
  const map = {
    PENDING:   { bg: "#FAEEDA", color: "#633806" },
    PAID:      { bg: "#EAF3DE", color: "#27500A" },
    OVERDUE:   { bg: "#FCEBEB", color: "#791F1F" },
    CANCELLED: { bg: "#F1EFE8", color: "#444441" },
  }
  const s = map[status] || { bg: "#F1EFE8", color: "#444441" }
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
      {status}
    </span>
  )
}

// ── Create Invoice Modal ───────────────────────────────────────────────────
function CreateInvoiceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ case: "", client: "", amount: "", description: "", due_date: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.case || !form.client || !form.amount) { setError("Case ID, Client ID and Amount are required."); return }
    setLoading(true)
    setError(null)
    try {
      const res = await createInvoice(form)
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {})?.[0]?.[0] || "Failed to create invoice.")
    }
    setLoading(false)
  }

  const inp = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 13, boxSizing: "border-box" }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Create Invoice</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--color-text-secondary)" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {error && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Case ID *</label><input name="case" type="number" placeholder="e.g. 1" value={form.case} onChange={e => setForm(p => ({ ...p, case: e.target.value }))} required style={inp} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Client ID *</label><input name="client" type="number" placeholder="e.g. 3" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} required style={inp} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Amount (₹) *</label><input name="amount" type="number" step="0.01" placeholder="e.g. 5000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required style={inp} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Due Date</label><input name="due_date" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} style={inp} /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Description</label>
              <textarea placeholder="Invoice description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>{loading ? "Creating..." : "Create Invoice"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
function BillingPage() {
  const { user } = useContext(AuthContext)

  const [invoices, setInvoices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState({}) // { invoiceId: "success" | "failed" }

  useEffect(() => { loadInvoices() }, [])

  useEffect(() => {
    setFiltered(statusFilter === "All" ? invoices : invoices.filter(inv => inv.status === statusFilter))
  }, [statusFilter, invoices])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await getInvoices()
      setInvoices(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch (err) { setError("Failed to load invoices.") }
    setLoading(false)
  }

  const handleMarkPaid = async (id) => {
    setActionLoading(id + "_pay")
    try {
      await markInvoicePaid(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "PAID" } : inv))
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const handleCancel = async (id) => {
    setActionLoading(id + "_cancel")
    try {
      await cancelInvoice(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "CANCELLED" } : inv))
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const handleDownload = async (id) => {
    setActionLoading(id + "_download")
    try {
      const res = await downloadInvoicePDF(id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `invoice_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) { console.error(err) }
    setActionLoading(null)
  }

  // ✅ Razorpay Payment Handler
  const handlePayNow = async (inv) => {
    setActionLoading(inv.id + "_razorpay")

    try {
      // Step 1 — Create order on backend
      const orderRes = await createPaymentOrder(inv.id)
      const orderData = orderRes.data

      // Step 2 — Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://checkout.razorpay.com/v1/checkout.js"
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      // Step 3 — Open Razorpay checkout popup
      const options = {
        key: orderData.key_id,   // ✅ key comes from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LawSystem",
        description: orderData.description,
        image: "",               // ✅ add your logo URL here if you have one
        order_id: orderData.order_id,
        prefill: {
          name: orderData.client_name,
          email: orderData.client_email,
          contact: orderData.client_phone,
        },
        theme: { color: "#185FA5" },

        handler: async (response) => {
          // Step 4 — Verify payment on backend
          try {
            await verifyPayment(inv.id, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })

            // ✅ Update invoice status in UI
            setInvoices(prev =>
              prev.map(i => i.id === inv.id ? { ...i, status: "PAID" } : i)
            )
            setPaymentStatus(prev => ({ ...prev, [inv.id]: "success" }))

          } catch (err) {
            setPaymentStatus(prev => ({ ...prev, [inv.id]: "failed" }))
            console.error("Payment verification failed:", err)
          }
        },

        modal: {
          ondismiss: () => {
            setActionLoading(null)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        setPaymentStatus(prev => ({ ...prev, [inv.id]: "failed" }))
        console.error("Payment failed:", response.error)
      })
      rzp.open()

    } catch (err) {
      console.error("Failed to initiate payment:", err)
      setPaymentStatus(prev => ({ ...prev, [inv.id]: "failed" }))
    }

    setActionLoading(null)
  }

  const canCreate = user?.role === "ADMIN" || user?.role === "LAWYER"

  const totalAmount = invoices.reduce((s, inv) => s + parseFloat(inv.amount || 0), 0)
  const pendingAmount = invoices.filter(i => ["PENDING","OVERDUE"].includes(i.status)).reduce((s, inv) => s + parseFloat(inv.amount || 0), 0)
  const paidAmount = invoices.filter(i => i.status === "PAID").reduce((s, inv) => s + parseFloat(inv.amount || 0), 0)

  return (
    <DashboardLayout>

      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onCreated={(inv) => setInvoices(prev => [inv, ...prev])}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h4 style={{ fontWeight: 500, margin: 0 }}>{user?.role === "CLIENT" ? "My Invoices" : "Billing"}</h4>
          <small style={{ color: "var(--color-text-secondary)" }}>{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</small>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, background: "#185FA5", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>
            + Create Invoice
          </button>
        )}
      </div>

      {/* Summary */}
      {!loading && invoices.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Invoiced", value: `₹${totalAmount.toLocaleString()}`, bg: "#E6F1FB", color: "#0C447C" },
            { label: "Pending / Overdue", value: `₹${pendingAmount.toLocaleString()}`, bg: "#FAEEDA", color: "#633806" },
            { label: "Paid", value: `₹${paidAmount.toLocaleString()}`, bg: "#EAF3DE", color: "#27500A" },
          ].map(card => (
            <div key={card.label} style={{ background: card.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 11, color: card.color, marginBottom: 4, opacity: 0.8 }}>{card.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", "PENDING", "PAID", "OVERDUE", "CANCELLED"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            border: "0.5px solid var(--color-border-secondary)",
            background: statusFilter === s ? "#185FA5" : "transparent",
            color: statusFilter === s ? "#fff" : "var(--color-text-secondary)",
            fontWeight: statusFilter === s ? 500 : 400,
          }}>{s}</button>
        ))}
      </div>

      {error && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}><div className="spinner-border spinner-border-sm me-2" />Loading invoices...</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No invoices found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{statusFilter !== "All" ? "Try a different filter." : "No invoices generated yet."}</div>
        </div>
      )}

      {/* Invoice list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(inv => (
            <div key={inv.id} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 12, padding: "16px 20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>

                {/* Left */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Invoice #{inv.id}</span>
                    <StatusBadge status={inv.status} />
                    {/* ✅ Payment success/fail feedback */}
                    {paymentStatus[inv.id] === "success" && (
                      <span style={{ fontSize: 11, color: "#27500A", background: "#EAF3DE", padding: "2px 8px", borderRadius: 20 }}>✓ Payment Successful</span>
                    )}
                    {paymentStatus[inv.id] === "failed" && (
                      <span style={{ fontSize: 11, color: "#791F1F", background: "#FCEBEB", padding: "2px 8px", borderRadius: 20 }}>✗ Payment Failed</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div><div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>CASE</div><div style={{ fontSize: 13, fontWeight: 500 }}>{inv.case_title || `Case #${inv.case}`}</div></div>
                    <div><div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>CLIENT</div><div style={{ fontSize: 13, fontWeight: 500 }}>{inv.client_username || "—"}</div></div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>AMOUNT</div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>₹{parseFloat(inv.amount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>DUE DATE</div>
                      <div style={{ fontSize: 13, color: inv.status === "OVERDUE" ? "#791F1F" : "var(--color-text-primary)" }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div><div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>CREATED</div><div style={{ fontSize: 13 }}>{new Date(inv.created_at).toLocaleDateString()}</div></div>
                  </div>

                  {inv.description && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>{inv.description}</div>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

                  {/* PDF download — all roles */}
                  <button onClick={() => handleDownload(inv.id)} disabled={actionLoading === inv.id + "_download"}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", cursor: "pointer" }}>
                    {actionLoading === inv.id + "_download" ? "..." : "⬇ PDF"}
                  </button>

                  {/* ✅ Pay Now button — CLIENT only, for PENDING/OVERDUE invoices */}
                  {user?.role === "CLIENT" && ["PENDING", "OVERDUE"].includes(inv.status) && (
                    <button
                      onClick={() => handlePayNow(inv)}
                      disabled={actionLoading === inv.id + "_razorpay"}
                      style={{
                        padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: actionLoading === inv.id + "_razorpay" ? "var(--color-background-secondary)" : "#185FA5",
                        color: actionLoading === inv.id + "_razorpay" ? "var(--color-text-tertiary)" : "#fff",
                        border: "none", cursor: actionLoading === inv.id + "_razorpay" ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {actionLoading === inv.id + "_razorpay" ? "Opening..." : "💳 Pay Now"}
                    </button>
                  )}

                  {/* Mark as paid — lawyer/admin */}
                  {canCreate && ["PENDING", "OVERDUE"].includes(inv.status) && (
                    <button onClick={() => handleMarkPaid(inv.id)} disabled={actionLoading === inv.id + "_pay"}
                      style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "#EAF3DE", color: "#27500A", border: "0.5px solid #97C459", cursor: "pointer", fontWeight: 500 }}>
                      {actionLoading === inv.id + "_pay" ? "..." : "✓ Mark Paid"}
                    </button>
                  )}

                  {/* Cancel — lawyer/admin */}
                  {canCreate && !["PAID", "CANCELLED"].includes(inv.status) && (
                    <button onClick={() => handleCancel(inv.id)} disabled={actionLoading === inv.id + "_cancel"}
                      style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F09595", cursor: "pointer" }}>
                      {actionLoading === inv.id + "_cancel" ? "..." : "✕ Cancel"}
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

export default BillingPage