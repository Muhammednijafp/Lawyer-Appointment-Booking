import axios from "axios"
 
const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
        "Content-Type": "application/json",
    },
})
 
// ─── Request Interceptor ───────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)
 
// ─── Response Interceptor ──────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
 
        // ✅ Auto refresh token on 401 — retry original request once
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
 
            const refreshToken = localStorage.getItem("refresh_token")
 
            if (refreshToken) {
                try {
                    const res = await axios.post(
                        "http://127.0.0.1:8000/api/token/refresh/",
                        { refresh: refreshToken }
                    )
 
                    const newAccess = res.data.access
                    localStorage.setItem("access_token", newAccess)
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`
 
                    return axiosInstance(originalRequest)  // retry
                } catch (refreshError) {
                    // Refresh token also expired — force logout
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("refresh_token")
                    window.location.href = "/"
                    return Promise.reject(refreshError)
                }
            } else {
                localStorage.removeItem("access_token")
                window.location.href = "/"
            }
        }
 
        return Promise.reject(error)
    }
)
 
export default axiosInstance
 