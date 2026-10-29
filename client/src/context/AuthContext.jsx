import { createContext, useState } from "react"
import { loginUser as loginUserApi, getCurrentUser } from "../api/fetchApi"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  )

  const loginUser = async (username, password) => {
    try {
      const tokenRes = await loginUserApi({ username, password })
      localStorage.setItem("access_token", tokenRes.data.access)
      localStorage.setItem("refresh_token", tokenRes.data.refresh)

      const userRes = await getCurrentUser()
      const userData = userRes.data
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      return { success: true, error: null }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Invalid username or password."
      return { success: false, error: message }
    }
  }

  const logoutUser = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    // ✅ Redirect to landing page on logout
    window.location.href = "/"
  }

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem("user", JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}