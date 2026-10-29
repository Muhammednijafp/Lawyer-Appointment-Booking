import { useEffect, useState, useRef, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getChatHistory, getCaseById } from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"

function ChatPage() {
  const { caseId } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState(null)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  // ✅ Load case details to get opponent info
  useEffect(() => {
    const loadCase = async () => {
      try {
        const res = await getCaseById(caseId)
        setCaseData(res.data)
      } catch (err) {
        console.error("Failed to load case:", err)
      }
    }
    if (caseId) loadCase()
  }, [caseId])

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        const res = await getChatHistory(caseId)
        const history = Array.isArray(res.data) ? res.data : res.data.results || []
        setMessages(history.map(msg => ({
          id: msg.id,
          message: msg.content,
          username: msg.sender_username,
          status: msg.status,
          timestamp: msg.timestamp,
          isTemp: false,
        })))
      } catch (err) {
        console.error("Failed to load history:", err)
      }
      setLoading(false)
    }
    if (caseId) loadHistory()
  }, [caseId])

  // WebSocket
  useEffect(() => {
    if (!caseId) return
    const token = localStorage.getItem("access_token")
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${caseId}/?token=${token}`)
    socketRef.current = socket

    socket.onopen = () => { setConnected(true) }

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === "seen_update") {
        setMessages(prev => prev.map(msg => msg.id === data.message_id ? { ...msg, status: "seen" } : msg))
        return
      }
      if (!data.message) return
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => !(msg.isTemp && msg.id === data.temp_id))
        return [...withoutTemp, {
          id: data.message_id, message: data.message,
          username: data.username, status: data.status || "sent",
          timestamp: new Date().toISOString(), isTemp: false,
        }]
      })
    }

    socket.onerror = () => setConnected(false)
    socket.onclose = () => setConnected(false)
    return () => socket.close()
  }, [caseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return
    const tempId = Date.now()
    setMessages(prev => [...prev, {
      id: tempId, message: input, username: user?.username,
      status: "sending", timestamp: new Date().toISOString(), isTemp: true,
    }])
    socketRef.current.send(JSON.stringify({ message: input, temp_id: tempId }))
    setInput("")
  }

  const sendSeen = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "seen", message_id: messageId }))
    }
  }

  const statusIcon = (msg) => {
    if (msg.isTemp) return "🕐"
    if (msg.status === "seen") return "✅"
    if (msg.status === "delivered") return "☑️"
    return "✓"
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // ✅ Determine opponent from case data
  const opponent = caseData
    ? user?.username === caseData.client_username
      ? { name: caseData.lawyer_username || "Lawyer", role: "LAWYER", initial: (caseData.lawyer_username || "L")?.[0]?.toUpperCase() }
      : { name: caseData.client_username || "Client", role: "CLIENT", initial: (caseData.client_username || "C")?.[0]?.toUpperCase() }
    : null

  return (
    <DashboardLayout>
      <div className="d-flex" style={{ height: "calc(100vh - 100px)" }}>

        {/* LEFT SIDEBAR — opponent profile */}
        <div className="border-end bg-white" style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column" }}>

          {/* Back button */}
          <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <button onClick={() => navigate(`/cases/${caseId}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13, padding: 0 }}>
              ← Back to case
            </button>
          </div>

          {/* Opponent profile card */}
          <div style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
              Chatting with
            </div>

            {opponent ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: opponent.role === "LAWYER" ? "#E6F1FB" : "#EAF3DE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, fontWeight: 500,
                  color: opponent.role === "LAWYER" ? "#0C447C" : "#27500A",
                  border: `3px solid ${connected ? "#1D9E75" : "#888780"}`,
                }}>
                  {opponent.initial}
                </div>

                {/* Name */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {opponent.role === "LAWYER" ? `Adv. ${opponent.name}` : opponent.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    {opponent.role === "LAWYER" ? "Your Lawyer" : "Client"}
                  </div>
                </div>

                {/* Role badge */}
                <span style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500,
                  background: opponent.role === "LAWYER" ? "#E6F1FB" : "#EAF3DE",
                  color: opponent.role === "LAWYER" ? "#0C447C" : "#27500A",
                }}>
                  {opponent.role}
                </span>

                {/* Case info */}
                <div style={{ width: "100%", padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 4 }}>CASE</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {caseData?.title || `Case #${caseId}`}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    {caseData?.category_name} · {caseData?.status}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: 13 }}>
                Loading...
              </div>
            )}

            {/* Connection status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, justifyContent: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#1D9E75" : "#DC3545", display: "inline-block" }} />
              <small style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
                {connected ? "Connected" : "Disconnected"}
              </small>
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-grow-1 d-flex flex-column">

          {/* Chat header */}
          <div style={{
            padding: "12px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-primary)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {opponent && (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: opponent.role === "LAWYER" ? "#E6F1FB" : "#EAF3DE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 500,
                  color: opponent.role === "LAWYER" ? "#0C447C" : "#27500A",
                }}>
                  {opponent.initial}
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {opponent ? (opponent.role === "LAWYER" ? `Adv. ${opponent.name}` : opponent.name) : `Case #${caseId}`}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  {caseData?.title || "Loading case..."}
                </div>
              </div>
            </div>
            <small style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>
              {messages.length} messages
            </small>
          </div>

          {/* Messages */}
          <div className="flex-grow-1 p-3 overflow-auto" style={{ background: "#f5f7fb" }}>

            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
                <div className="spinner-border spinner-border-sm me-2" />
                Loading messages...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {!loading && messages.map((msg) => {
              const isMe = msg.username === user?.username
              if (!isMe && msg.status !== "seen") sendSeen(msg.id)

              return (
                <div key={msg.id} className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                  {!isMe && (
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: opponent?.role === "LAWYER" ? "#E6F1FB" : "#EAF3DE",
                      color: opponent?.role === "LAWYER" ? "#0C447C" : "#27500A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      me: 8, fontSize: 12, fontWeight: 500, flexShrink: 0, alignSelf: "flex-end",
                      marginRight: 8,
                    }}>
                      {opponent?.initial || msg.username?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div style={{ maxWidth: "60%" }}>
                    {!isMe && <small style={{ color: "var(--color-text-tertiary)", display: "block", marginBottom: 2, marginLeft: 2 }}>{msg.username}</small>}
                    <div className={`p-2 px-3 rounded-3 shadow-sm ${isMe ? "bg-primary text-white" : "bg-white text-dark border"} ${msg.isTemp ? "opacity-75" : ""}`}>
                      <div>{msg.message}</div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 2, fontSize: 10, opacity: 0.7 }}>
                        <span>{formatTime(msg.timestamp)}</span>
                        {isMe && <span>{statusIcon(msg)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-top bg-white d-flex gap-2">
            <input
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connected ? "Type a message..." : "Connecting..."}
              disabled={!connected}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            />
            <button className="btn btn-primary px-4" onClick={sendMessage} disabled={!connected || !input.trim()}>
              Send
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

export default ChatPage