import axios from "axios"

const BASE_URL = "http://127.0.0.1:8000/api/"

const commonApi = async (reqUrl, reqMethod, reqData = null, customConfig = {}) => {

    const token = localStorage.getItem("access_token")
    const { responseType, ...customHeaders } = customConfig

    // ✅ If data is FormData, let axios set Content-Type automatically
    // (axios adds the correct multipart boundary automatically)
    const isFormData = reqData instanceof FormData

    const config = {
        url: `${BASE_URL}${reqUrl}`,
        method: reqMethod,
        data: reqData,
        headers: {
            // ✅ Only set Content-Type for non-FormData requests
            ...(!isFormData && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            // ✅ Only apply custom headers for non-FormData (avoid overriding multipart)
            ...(!isFormData && customHeaders),
        },
        ...(responseType && { responseType }),
    }

    try {
        return await axios(config)

    } catch (error) {

        // ✅ Auto refresh token on 401
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem("refresh_token")

            if (refreshToken) {
                try {
                    const res = await axios.post(`${BASE_URL}token/refresh/`, {
                        refresh: refreshToken,
                    })

                    const newAccess = res.data.access
                    localStorage.setItem("access_token", newAccess)

                    config.headers.Authorization = `Bearer ${newAccess}`
                    return await axios(config)

                } catch (refreshError) {
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("refresh_token")
                    localStorage.removeItem("user")
                    window.location.href = "/"
                }
            } else {
                localStorage.removeItem("access_token")
                localStorage.removeItem("user")
                window.location.href = "/"
            }
        }

        throw error
    }
}

export default commonApi