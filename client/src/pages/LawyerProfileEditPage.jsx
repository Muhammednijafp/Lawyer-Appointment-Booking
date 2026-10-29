import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { getMyLawyerProfile, updateMyLawyerProfile, updateCurrentUser } from "../api/fetchApi"
import DashboardLayout from "../layouts/DashboardLayout"
import { toast, ToastContainer } from "react-toastify"

function LawyerProfileEditPage() {
  const { user, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const [profile, setProfile] = useState({
    bar_council_number: "",
    specialization: "",
    court_level: "",
    experience_years: "",
    consultation_fee: "",
    bio: "",
    state: "",
    city: "",
    is_available: true,
  })

  const [account, setAccount] = useState({
    phone: "",
    lawyer_type: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (user?.role !== "LAWYER") { navigate("/dashboard"); return }
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await getMyLawyerProfile()
      const d = res.data
      setProfile({
        bar_council_number: d.bar_council_number || "",
        specialization: d.specialization || "",
        court_level: d.court_level || "",
        experience_years: d.experience_years || "",
        consultation_fee: d.consultation_fee || "",
        bio: d.bio || "",
        state: d.state || "",
        city: d.city || "",
        is_available: d.is_available ?? true,
      })
      setAccount({ phone: d.phone || "", lawyer_type: d.lawyer_type || "" })
      if (d.profile_image) setPreviewImage(`http://127.0.0.1:8000${d.profile_image}`)
    } catch (err) {
      toast.error("Failed to load profile.")
    }
    setLoading(false)
  }

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateMyLawyerProfile(profile)
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to update profile."
      )
    }
    setSaving(false)
  }

  const handleSaveAccount = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("phone", account.phone)
      formData.append("lawyer_type", account.lawyer_type)
      if (profileImage) formData.append("profile_image", profileImage)
      const res = await updateCurrentUser(formData)
      updateUser(res.data)
      toast.success("Account updated successfully!")
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})?.[0]?.[0] ||
        "Failed to update account."
      )
    }
    setSaving(false)
  }

  const inp = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box",
  }
  const lbl = {
    fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)",
    display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
  }
  const sec = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: 12, padding: "20px 24px", marginBottom: 20,
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="spinner-border spinner-border-sm" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 500, margin: "0 0 4px" }}>Edit Profile</h4>
          <small style={{ color: "var(--color-text-secondary)" }}>
            Your profile is visible to all clients browsing lawyers
          </small>
        </div>
        <button onClick={() => navigate(`/lawyers/${user?.id}`)} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 13,
          border: "0.5px solid var(--color-border-secondary)",
          background: "transparent", color: "var(--color-text-primary)", cursor: "pointer",
        }}>
          View Public Profile →
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 24 }}>
        {[{ key: "profile", label: "Professional Info" }, { key: "account", label: "Account & Photo" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: "8px 20px", fontSize: 13, cursor: "pointer",
            background: "transparent", border: "none",
            borderBottom: activeTab === tab.key ? "2px solid #185FA5" : "2px solid transparent",
            color: activeTab === tab.key ? "#185FA5" : "var(--color-text-secondary)",
            fontWeight: activeTab === tab.key ? 500 : 400,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Professional Info ─────────────────────────── */}
      {activeTab === "profile" && (
        <>
          {/* Availability toggle */}
          <div style={sec}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Availability Status</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  Toggle whether you are accepting new clients
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => setProfile(prev => ({ ...prev, is_available: !prev.is_available }))}
                  style={{
                    width: 48, height: 26, borderRadius: 13, cursor: "pointer",
                    background: profile.is_available ? "#1D9E75" : "#ccc",
                    position: "relative", transition: "background 0.2s",
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, left: profile.is_available ? 24 : 4,
                    transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: profile.is_available ? "#0F6E56" : "var(--color-text-secondary)" }}>
                  {profile.is_available ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </div>

          {/* Professional details */}
          <div style={sec}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Professional Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              <div>
                <label style={lbl}>Bar Council Number</label>
                <input name="bar_council_number" value={profile.bar_council_number}
                  onChange={handleProfileChange} placeholder="e.g. KL/1234/2010" style={inp} />
              </div>

              <div>
                <label style={lbl}>Specialization</label>
                <select name="specialization" value={profile.specialization}
                  onChange={handleProfileChange} style={inp}>
                  <option value="">Select specialization</option>
                  {["Criminal","Civil","Family","Property","Corporate","Labour","Tax","Constitutional"].map(s => (
                    <option key={s} value={s}>{s} Law</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Court Level</label>
                <select name="court_level" value={profile.court_level}
                  onChange={handleProfileChange} style={inp}>
                  <option value="">Select court level</option>
                  <option value="District">District Court</option>
                  <option value="High">High Court</option>
                  <option value="Supreme">Supreme Court</option>
                </select>
              </div>

              <div>
                <label style={lbl}>Years of Experience</label>
                <input name="experience_years" type="number" min="0" max="60"
                  value={profile.experience_years} onChange={handleProfileChange}
                  placeholder="e.g. 5" style={inp} />
              </div>

              <div>
                <label style={lbl}>Consultation Fee (₹)</label>
                <input name="consultation_fee" type="number" min="0"
                  value={profile.consultation_fee} onChange={handleProfileChange}
                  placeholder="e.g. 2000" style={inp} />
              </div>

              <div>
                <label style={lbl}>City</label>
                <input name="city" value={profile.city}
                  onChange={handleProfileChange} placeholder="e.g. Kochi" style={inp} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>State</label>
                <select name="state" value={profile.state} onChange={handleProfileChange} style={inp}>
                  <option value="">Select state</option>
                  {["Kerala","Tamil Nadu","Karnataka","Andhra Pradesh","Maharashtra","Delhi","Gujarat",
                    "Rajasthan","Uttar Pradesh","West Bengal","Madhya Pradesh","Bihar","Odisha",
                    "Punjab","Haryana","Telangana","Jharkhand","Assam","Himachal Pradesh","Goa"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Bio / About You</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange}
                  placeholder="Tell clients about your experience, expertise and approach..."
                  rows={4} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} />
                <small style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}>
                  {profile.bio.length}/500 characters
                </small>
              </div>

            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={loadProfile} style={{
              padding: "10px 20px", borderRadius: 8, fontSize: 13,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer",
            }}>Reset</button>
            <button onClick={handleSaveProfile} disabled={saving} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 13,
              background: "#185FA5", color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer", fontWeight: 500,
            }}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </>
      )}

      {/* ── Account & Photo ───────────────────────────── */}
      {activeTab === "account" && (
        <>
          {/* Photo */}
          <div style={sec}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Profile Photo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%", flexShrink: 0,
                background: "#E6F1FB", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 500, color: "#0C447C",
                border: "3px solid var(--color-border-secondary)",
              }}>
                {previewImage
                  ? <img src={previewImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <label style={{
                  padding: "9px 18px", borderRadius: 8, fontSize: 13,
                  background: "#185FA5", color: "#fff", cursor: "pointer",
                  display: "inline-block", fontWeight: 500,
                }}>
                  Choose Photo
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files[0]
                    if (f) { setProfileImage(f); setPreviewImage(URL.createObjectURL(f)) }
                  }} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 8 }}>JPG, PNG. Max 2MB.</div>
                {profileImage && <div style={{ fontSize: 12, color: "#0F6E56", marginTop: 4 }}>✓ {profileImage.name}</div>}
              </div>
            </div>
          </div>

          {/* Account details */}
          <div style={sec}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Account Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              <div>
                <label style={lbl}>Username</label>
                <input value={user?.username || ""} disabled style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} />
                <small style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Cannot be changed</small>
              </div>

              <div>
                <label style={lbl}>Email</label>
                <input value={user?.email || ""} disabled style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} />
                <small style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Contact support to change</small>
              </div>

              <div>
                <label style={lbl}>Phone Number</label>
                <input name="phone" type="tel" value={account.phone}
                  onChange={e => setAccount(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210" style={inp} />
              </div>

              <div>
                <label style={lbl}>Lawyer Type</label>
                <select name="lawyer_type" value={account.lawyer_type}
                  onChange={e => setAccount(prev => ({ ...prev, lawyer_type: e.target.value }))}
                  style={inp}>
                  <option value="">Select type</option>
                  <option value="Junior">Junior Lawyer</option>
                  <option value="Senior">Senior Lawyer</option>
                </select>
              </div>

            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSaveAccount} disabled={saving} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 13,
              background: "#185FA5", color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer", fontWeight: 500,
            }}>
              {saving ? "Saving..." : "Save Account"}
            </button>
          </div>
        </>
      )}

    </DashboardLayout>
  )
}

export default LawyerProfileEditPage