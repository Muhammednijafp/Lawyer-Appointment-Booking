import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getCaseById, updateCase, uploadCaseDocument, getCaseActivityLog } from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

function StatusBadge({ status }) {
  const map = {
    Pending: { bg: "#FAEEDA", color: "#633806" },
    Ongoing: { bg: "#E6F1FB", color: "#0C447C" },
    Closed:  { bg: "#EAF3DE", color: "#27500A" },
  }
  const s = map[status] || { bg: "#F1EFE8", color: "#444441" }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 500,
    }}>
      {status}
    </span>
  )
}

function CaseDetailPage() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  useEffect(() => {
    const loadCase = async () => {
      setLoading(true)
      try {
        const res = await getCaseById(id)
        setCaseData(res.data)

        const logRes = await getCaseActivityLog(id)
        setActivityLog(Array.isArray(logRes.data) ? logRes.data : logRes.data.results || [])
      } catch (err) {
        setError("Failed to load case details.")
        console.error(err)
      }
      setLoading(false)
    }
    loadCase()
  }, [id])

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      const res = await updateCase(id, { status: newStatus })
      setCaseData(prev => ({ ...prev, status: res.data.status }))
    } catch (err) {
      console.error("Failed to update status:", err)
    }
    setUpdating(false)
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("document", uploadFile)
      const res = await uploadCaseDocument(id, formData)
      setCaseData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), res.data],
      }))
      setUploadFile(null)
    } catch (err) {
      console.error("Upload failed:", err)
    }
    setUploading(false)
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "LAWYER"

  const tabs = ["overview", "documents", "activity"]

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-text-secondary)" }}>
        <div className="spinner-border spinner-border-sm me-2" />
        Loading case...
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout>
      <div style={{
        background: "var(--color-background-danger)", color: "var(--color-text-danger)",
        padding: "12px 16px", borderRadius: 8, fontSize: 13,
      }}>
        {error}
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>

      {/* Back button */}
      <button
        onClick={() => navigate("/cases")}
        style={{
          background: "transparent", border: "none",
          color: "var(--color-text-secondary)", fontSize: 13,
          cursor: "pointer", marginBottom: 16, padding: 0,
        }}
      >
        ← Back to cases
      </button>

      {/* Header card */}
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h4 style={{ fontWeight: 500, margin: "0 0 6px" }}>{caseData?.title}</h4>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <StatusBadge status={caseData?.status} />
              <span style={{
                background: "#EAF3DE", color: "#27500A",
                padding: "3px 10px", borderRadius: 20, fontSize: 11,
              }}>
                {caseData?.category_name}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Chat button */}
            <button
              onClick={() => navigate(`/chat/${id}`)}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 13,
                border: "0.5px solid var(--color-border-secondary)",
                background: "transparent", color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              💬 Chat
            </button>

            {/* Status update for lawyer/admin */}
            {canEdit && caseData?.status !== "Closed" && (
              <select
                value={caseData?.status}
                disabled={updating}
                onChange={e => handleStatusUpdate(e.target.value)}
                style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 13,
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)", cursor: "pointer",
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Closed">Closed</option>
              </select>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex", gap: 32, marginTop: 20,
          paddingTop: 16, borderTop: "0.5px solid var(--color-border-tertiary)",
          flexWrap: "wrap",
        }}>
          {[
            { label: "CLIENT", value: caseData?.client_username },
            { label: "LAWYER", value: caseData?.lawyer_username || "Unassigned" },
            { label: "OPENED", value: new Date(caseData?.created_at).toLocaleDateString() },
            { label: "DOCUMENTS", value: caseData?.documents?.length || 0 },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4,
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        marginBottom: 20,
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px", fontSize: 13, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "2px solid #185FA5" : "2px solid transparent",
              color: activeTab === tab ? "#185FA5" : "var(--color-text-secondary)",
              fontWeight: activeTab === tab ? 500 : 400,
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────── */}
      {activeTab === "overview" && (
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-secondary)" }}>
            DESCRIPTION
          </div>
          <p style={{ fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.7, margin: 0 }}>
            {caseData?.description || "No description provided."}
          </p>
        </div>
      )}

      {/* ── Documents Tab ─────────────────────────────────── */}
      {activeTab === "documents" && (
        <div>
          {/* Upload section */}
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Upload document</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="file"
                onChange={e => setUploadFile(e.target.files[0])}
                style={{
                  fontSize: 13, padding: "6px 10px",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: 8, color: "var(--color-text-primary)",
                  background: "var(--color-background-primary)",
                }}
              />
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 13,
                  background: uploadFile ? "#185FA5" : "var(--color-background-secondary)",
                  color: uploadFile ? "#fff" : "var(--color-text-tertiary)",
                  border: "none", cursor: uploadFile ? "pointer" : "not-allowed",
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {/* Document list */}
          {caseData?.documents?.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
              No documents uploaded yet.
            </div>
          )}

          {caseData?.documents?.map(doc => (
            <div
              key={doc.id}
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
                  📄 {doc.document?.split("/").pop() || `Document #${doc.id}`}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>
                  Uploaded by {doc.uploaded_by_username} · {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <a
                href={`http://127.0.0.1:8000${doc.document}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12, padding: "4px 12px",
                  borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-primary)", textDecoration: "none",
                }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity Log Tab ───────────────────────────────── */}
      {activeTab === "activity" && (
        <div>
          {activityLog.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-text-secondary)", fontSize: 13 }}>
              No activity recorded yet.
            </div>
          )}

          {activityLog.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: "flex", gap: 14, marginBottom: 16,
                paddingBottom: 16,
                borderBottom: i < activityLog.length - 1
                  ? "0.5px solid var(--color-border-tertiary)" : "none",
              }}
            >
              {/* Timeline dot */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "#E6F1FB", color: "#0C447C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 500,
              }}>
                {log.user_username?.[0]?.toUpperCase() || "?"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    background: "#EAF3DE", color: "#27500A",
                    padding: "2px 8px", borderRadius: 20,
                  }}>
                    {log.action_type}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                  {log.description}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>
                  by {log.user_username || "System"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default CaseDetailPage