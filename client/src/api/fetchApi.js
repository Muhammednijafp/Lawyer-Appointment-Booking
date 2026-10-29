import commonApi from "./commonApi"

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser = (data) =>
    commonApi("token/", "POST", data)

export const refreshToken = (data) =>
    commonApi("token/refresh/", "POST", data)

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────
export const registerUser = (data) =>
    commonApi("accounts/register/", "POST", data)

export const getCurrentUser = () =>
    commonApi("accounts/me/", "GET")

export const updateCurrentUser = (data) =>
    commonApi("accounts/me/", "PATCH", data)

// ─── LAWYER DIRECTORY ─────────────────────────────────────────────────────
export const getLawyers = (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return commonApi(`accounts/lawyers/${query ? "?" + query : ""}`, "GET")
}

export const getLawyerById = (userId) =>
    commonApi(`accounts/lawyers/${userId}/`, "GET")

export const getMyLawyerProfile = () =>
    commonApi("accounts/lawyers/profile/", "GET")

export const updateMyLawyerProfile = (data) =>
    commonApi("accounts/lawyers/profile/", "PATCH", data)

export const submitReview = (userId, data) =>
    commonApi(`accounts/lawyers/${userId}/review/`, "POST", data)

// ─── DASHBOARD ────────────────────────────────────────────────────────────
export const getDashboard = () =>
    commonApi("dashboard/", "GET")

// ─── CASES ────────────────────────────────────────────────────────────────
export const getCases = () =>
    commonApi("cases/", "GET")

export const getCaseById = (id) =>
    commonApi(`cases/${id}/`, "GET")

export const createCase = (data) =>
    commonApi("cases/", "POST", data)

export const updateCase = (id, data) =>
    commonApi(`cases/${id}/`, "PATCH", data)

export const deleteCase = (id) =>
    commonApi(`cases/${id}/`, "DELETE")

export const getCaseCategories = () =>
    commonApi("cases/categories/", "GET")

export const uploadCaseDocument = (id, formData) =>
    commonApi(`cases/${id}/upload_document/`, "POST", formData)

export const getCaseActivityLog = (id) =>
    commonApi(`cases/${id}/activity_log/`, "GET")

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────
export const getAppointments = () =>
    commonApi("appointments/", "GET")

export const getAppointmentById = (id) =>
    commonApi(`appointments/${id}/`, "GET")

export const createAppointment = (data) =>
    commonApi("appointments/", "POST", data)

export const approveAppointment = (id) =>
    commonApi(`appointments/${id}/approve/`, "POST")

export const rejectAppointment = (id) =>
    commonApi(`appointments/${id}/reject/`, "POST")

// ─── BILLING ──────────────────────────────────────────────────────────────
export const getInvoices = () =>
    commonApi("billing/invoices/", "GET")

export const getInvoiceById = (id) =>
    commonApi(`billing/invoices/${id}/`, "GET")

export const createInvoice = (data) =>
    commonApi("billing/invoices/", "POST", data)

export const markInvoicePaid = (id) =>
    commonApi(`billing/invoices/${id}/mark_as_paid/`, "POST")

export const cancelInvoice = (id) =>
    commonApi(`billing/invoices/${id}/cancel/`, "POST")

export const downloadInvoicePDF = (id) =>
    commonApi(`billing/invoices/${id}/download_invoice/`, "GET", null, {
        responseType: "blob",
    })

// ✅ Razorpay — Step 1: create order
export const createPaymentOrder = (invoiceId) =>
    commonApi(`billing/invoices/${invoiceId}/create_payment_order/`, "POST")

// ✅ Razorpay — Step 2: verify payment after popup closes
export const verifyPayment = (invoiceId, data) =>
    commonApi(`billing/invoices/${invoiceId}/verify_payment/`, "POST", data)

// ─── CHAT ─────────────────────────────────────────────────────────────────
export const getChatHistory = (caseId) =>
    commonApi(`chat/case/${caseId}/history/`, "GET")

export const getChatMessages = (caseId, page = 1) =>
    commonApi(`chat/case/${caseId}/messages/?page=${page}`, "GET")

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
export const getNotifications = () =>
    commonApi("notifications/", "GET")

export const getUnreadCount = () =>
    commonApi("notifications/unread_count/", "GET")

export const markNotificationRead = (id) =>
    commonApi(`notifications/${id}/mark_as_read/`, "POST")

export const markAllNotificationsRead = () =>
    commonApi("notifications/mark_all_as_read/", "POST")