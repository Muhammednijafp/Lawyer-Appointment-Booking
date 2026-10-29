import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getCases, updateCase } from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

function StatusBadge({ status }) {
  const map = {
    Pending:  { bg: "#FAEEDA", color: "#633806" },
    Ongoing:  { bg: "#E6F1FB", color: "#0C447C" },
    Closed:   { bg: "#EAF3DE", color: "#27500A" },
  }
  const s = map[status] || { bg: "#F1EFE8", color: "#444441" }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 500,
    }}>
      {status}
    </span>
  )
}

function CaseCard({ caseItem, onView, onStatusChange, role }) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await updateCase(caseItem.id, { status: newStatus })
      onStatusChange(caseItem.id, newStatus)
    } catch (err) {
      console.error("Failed to update status:", err)
    }
    setUpdating(false)
  }

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: 12, padding: 16, cursor: "pointer",
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", paddingRight: 8 }}>
          {caseItem.title}
        </div>
        <StatusBadge status={caseItem.status} />
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12, color: "var(--color-text-secondary)",
        marginBottom: 12, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {caseItem.description || "No description provided."}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>CATEGORY</div>
          <div style={{ fontSize: 12, color: "var(--color-text-primary)" }}>
            {caseItem.category_name || "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
            {role === "CLIENT" ? "LAWYER" : "CLIENT"}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-primary)" }}>
            {role === "CLIENT" ? caseItem.lawyer_username || "Unassigned" : caseItem.client_username || "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>OPENED</div>
          <div style={{ fontSize: 12, color: "var(--color-text-primary)" }}>
            {new Date(caseItem.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10,
      }}>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
          {caseItem.documents?.length || 0} docs · {caseItem.activities?.length || 0} activities
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {/* Lawyer/Admin status update */}
          {(role === "LAWYER" || role === "ADMIN") && caseItem.status !== "Closed" && (
            <select
              value={caseItem.status}
              disabled={updating}
              onClick={e => e.stopPropagation()}
              onChange={e => handleStatusChange(e.target.value)}
              style={{
                fontSize: 11, padding: "3px 8px",
                borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          )}

          <button
            onClick={() => onView(caseItem.id)}
            style={{
              fontSize: 12, padding: "4px 12px",
              borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            View →
          </button>
        </div>
      </div>
    </div>
  )
}

function CasesPage() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [cases, setCases] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true)
      try {
        const res = await getCases()
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setCases(data)
        setFiltered(data)
      } catch (err) {
        setError("Failed to load cases.")
        console.error(err)
      }
      setLoading(false)
    }
    loadCases()
  }, [])

  // ── Filter logic ──────────────────────────────────────────
  useEffect(() => {
    let result = [...cases]

    if (search.trim()) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter)
    }

    if (categoryFilter !== "All") {
      result = result.filter(c => c.category_name === categoryFilter)
    }

    setFiltered(result)
  }, [search, statusFilter, categoryFilter, cases])

  const handleStatusChange = (id, newStatus) => {
    setCases(prev =>
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    )
  }

  const categories = ["All", ...new Set(cases.map(c => c.category_name).filter(Boolean))]
  const statuses = ["All", "Pending", "Ongoing", "Closed"]

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h4 style={{ fontWeight: 500, margin: 0 }}>
            {user?.role === "ADMIN" ? "All Cases" : "My Cases"}
          </h4>
          <small style={{ color: "var(--color-text-secondary)" }}>
            {filtered.length} case{filtered.length !== 1 ? "s" : ""} found
          </small>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        {/* Search */}
        <input
          placeholder="Search cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "7px 12px", borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontSize: 13, width: 220,
          }}
        />

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            padding: "7px 12px", borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontSize: 13,
          }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 6 }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                border: "0.5px solid var(--color-border-secondary)",
                background: statusFilter === s ? "#185FA5" : "transparent",
                color: statusFilter === s ? "#fff" : "var(--color-text-secondary)",
                fontWeight: statusFilter === s ? 500 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 12, padding: 16, height: 160,
            }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No cases found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {search || statusFilter !== "All" || categoryFilter !== "All"
              ? "Try adjusting your filters."
              : "No cases have been assigned to you yet."}
          </div>
        </div>
      )}

      {/* Cases Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(c => (
            <CaseCard
              key={c.id}
              caseItem={c}
              role={user?.role}
              onView={(id) => navigate(`/cases/${id}`)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default CasesPage