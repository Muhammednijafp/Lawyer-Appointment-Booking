import { useEffect, useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import {
  getInvoices, createInvoice, markInvoicePaid,
  cancelInvoice, downloadInvoicePDF,
  createPaymentOrder, verifyPayment, getCases,
} from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

// ✅ Your Razorpay Key ID
const RAZORPAY_KEY_ID = "rzp_test_RifDitkcb9Q5gl"

function StatusBadge({ status }) {
  const map = {
    PENDING:   { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" },
    PAID:      { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
    OVERDUE:   { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" },
    CANCELLED: { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" },
  }
  const s = map[status] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1" }
  return (
    <span
      className="badge rounded-pill fw-semibold"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: "4px 10px",
        fontSize: "11px",
      }}
    >
      {status}
    </span>
  )
}

// ── Create Invoice Modal with Case Selector ────────────────────────────────
function CreateInvoiceModal({ onClose, onCreated }) {
  const [cases, setCases] = useState([])
  const [loadingCases, setLoadingCases] = useState(true)
  const [form, setForm] = useState({
    case: "",
    client: "",
    amount: "",
    description: "",
    due_date: "",
  })
  const [selectedCaseTitle, setSelectedCaseTitle] = useState("")
  const [selectedClientName, setSelectedClientName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCases = async () => {
      setLoadingCases(true)
      try {
        const res = await getCases()
        const list = Array.isArray(res.data) ? res.data : res.data.results || []
        setCases(list)
      } catch (err) {
        console.error("Failed to load cases for invoice:", err)
      }
      setLoadingCases(false)
    }
    fetchCases()
  }, [])

  const handleCaseSelect = (e) => {
    const caseId = e.target.value
    if (!caseId) {
      setForm(p => ({ ...p, case: "", client: "" }))
      setSelectedCaseTitle("")
      setSelectedClientName("")
      return
    }
    const c = cases.find(item => String(item.id) === String(caseId))
    if (c) {
      setForm(p => ({
        ...p,
        case: c.id,
        client: c.client,
        description: `Legal consultation & representation for: ${c.title}`,
      }))
      setSelectedCaseTitle(c.title)
      setSelectedClientName(c.client_username || `Client #${c.client}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.case || !form.client || !form.amount) {
      setError("Please select a Case and specify the fee amount.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await createInvoice(form)
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to create invoice."
      )
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 17, 40, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card law-card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "520px", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-bottom bg-dark text-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">Issue Legal Invoice</h5>
            <small className="text-white-50">Generate professional fee invoice for case representation</small>
          </div>
          <button onClick={onClose} className="btn-close btn-close-white" />
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          {/* Case Dropdown Picker */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-dark mb-1">
              Select Legal Matter / Case <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={form.case}
              onChange={handleCaseSelect}
              required
              disabled={loadingCases}
            >
              <option value="">
                {loadingCases ? "Loading your active cases..." : "-- Choose Case --"}
              </option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.title} (Client: {c.client_username || c.client})
                </option>
              ))}
            </select>
            {selectedClientName && (
              <small className="text-success fw-semibold d-block mt-1">
                ✓ Invoicing to Client: <strong>{selectedClientName}</strong>
              </small>
            )}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label small fw-bold text-secondary mb-1">
                Fee Amount (₹) <span className="text-danger">*</span>
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className="form-control"
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label small fw-bold text-secondary mb-1">Due Date</label>
              <input
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary mb-1">Description / Bill Line Items</label>
            <textarea
              name="description"
              rows="3"
              placeholder="e.g. Court filing charges, drafting petition, and appearance fee..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="form-control"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-sm btn-outline-secondary px-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-primary px-4 fw-bold"
              style={{ background: "var(--color-primary)" }}
            >
              {loading ? "Issuing..." : "Create & Send Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Billing Page ──────────────────────────────────────────────────────
function BillingPage() {
  const { user } = useContext(AuthContext)

  const [invoices, setInvoices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState({})

  useEffect(() => {
    loadInvoices()
  }, [])

  useEffect(() => {
    setFiltered(statusFilter === "All" ? invoices : invoices.filter(inv => inv.status === statusFilter))
  }, [statusFilter, invoices])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await getInvoices()
      setInvoices(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch (err) {
      setError("Failed to load invoices.")
    }
    setLoading(false)
  }

  const handleMarkPaid = async (id) => {
    setActionLoading(id + "_pay")
    try {
      await markInvoicePaid(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "PAID" } : inv))
    } catch (err) {
      console.error(err)
    }
    setActionLoading(null)
  }

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this invoice?")) return
    setActionLoading(id + "_cancel")
    try {
      await cancelInvoice(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "CANCELLED" } : inv))
    } catch (err) {
      console.error(err)
    }
    setActionLoading(null)
  }

  const handleDownloadPDF = async (id, invoiceNumber) => {
    setActionLoading(id + "_pdf")
    try {
      const res = await downloadInvoicePDF(id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `invoice_${invoiceNumber || id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("PDF download failed:", err)
    }
    setActionLoading(null)
  }

  // ✅ Razorpay Payment Flow
  const handlePayNow = async (invoice) => {
    setActionLoading(invoice.id + "_paynow")
    try {
      const orderRes = await createPaymentOrder(invoice.id)
      const { razorpay_order_id, amount, currency } = orderRes.data

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Law Management System",
        description: `Invoice #${invoice.invoice_number} - Case #${invoice.case}`,
        order_id: razorpay_order_id,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: {
          color: "#185FA5",
        },
        handler: async function (response) {
          try {
            await verifyPayment(invoice.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setPaymentStatus(prev => ({ ...prev, [invoice.id]: "success" }))
            setInvoices(prev => prev.map(inv =>
              inv.id === invoice.id ? { ...inv, status: "PAID" } : inv
            ))
          } catch (err) {
            setPaymentStatus(prev => ({ ...prev, [invoice.id]: "failed" }))
          }
        },
        modal: {
          ondismiss: function () {
            setActionLoading(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response) {
        setPaymentStatus(prev => ({ ...prev, [invoice.id]: "failed" }))
        setActionLoading(null)
      })
      rzp.open()
    } catch (err) {
      console.error("Payment initiation failed:", err)
      setActionLoading(null)
    }
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const paidAmount = invoices.filter(i => i.status === "PAID").reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const pendingAmount = invoices.filter(i => i.status === "PENDING").reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: "-0.02em" }}>
            Financials & Invoicing
          </h4>
          <small className="text-muted">
            {user?.role === "CLIENT"
              ? "View case fee bills, pay securely with Razorpay, and download PDF receipts."
              : "Generate invoices, monitor client payments, and track receivables."}
          </small>
        </div>

        {user?.role !== "CLIENT" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-2"
            style={{ background: "var(--color-primary)" }}
          >
            <span>+</span>
            <span>Issue New Invoice</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="law-stat-card">
            <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 44, height: 44, background: "#185FA5", fontSize: 20 }}>
              💰
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: "11px" }}>TOTAL INVOICED</small>
              <h4 className="fw-bold text-dark mb-0">₹{totalAmount.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="law-stat-card" style={{ "--stat-accent": "#10B981" }}>
            <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 44, height: 44, background: "#10B981", fontSize: 20 }}>
              ✓
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: "11px" }}>SETTLED AMOUNT</small>
              <h4 className="fw-bold text-success mb-0">₹{paidAmount.toLocaleString()}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="law-stat-card" style={{ "--stat-accent": "#F59E0B" }}>
            <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 44, height: 44, background: "#F59E0B", fontSize: 20 }}>
              ⏳
            </div>
            <div>
              <small className="text-muted d-block fw-semibold" style={{ fontSize: "11px" }}>OUTSTANDING</small>
              <h4 className="fw-bold text-warning mb-0">₹{pendingAmount.toLocaleString()}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-3">
        {["All", "PENDING", "PAID", "OVERDUE", "CANCELLED"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold ${
              statusFilter === s ? "btn-primary" : "btn-light border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="law-card overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
            <h6>No invoices found</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Invoice #</th>
                  <th>Case Title</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td className="ps-4 fw-bold text-dark">
                      #{inv.invoice_number || inv.id}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{inv.case_title || `Case #${inv.case}`}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: 200 }}>
                        {inv.description}
                      </small>
                    </td>
                    <td>{inv.client_username || inv.client}</td>
                    <td className="fw-bold fs-6">
                      ₹{parseFloat(inv.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        {/* Client Pay Now */}
                        {user?.role === "CLIENT" && inv.status === "PENDING" && (
                          <button
                            onClick={() => handlePayNow(inv)}
                            disabled={actionLoading === inv.id + "_paynow"}
                            className="btn btn-sm btn-success fw-bold px-3"
                          >
                            {actionLoading === inv.id + "_paynow" ? "Processing..." : "Pay Now 💳"}
                          </button>
                        )}

                        {/* Lawyer / Admin Mark Paid */}
                        {user?.role !== "CLIENT" && inv.status === "PENDING" && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={actionLoading === inv.id + "_pay"}
                            className="btn btn-sm btn-outline-success"
                          >
                            Mark Paid
                          </button>
                        )}

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(inv.id, inv.invoice_number)}
                          disabled={actionLoading === inv.id + "_pdf"}
                          className="btn btn-sm btn-outline-secondary"
                          title="Download Receipt PDF"
                        >
                          📄 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onCreated={(newInv) => setInvoices(p => [newInv, ...p])}
        />
      )}
    </DashboardLayout>
  )
}

export default BillingPage
