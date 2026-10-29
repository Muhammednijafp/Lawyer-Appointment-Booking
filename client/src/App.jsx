import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ChatPage from "./pages/ChatPage"
import CasesPage from "./pages/CasesPage"
import CaseDetailPage from "./pages/CaseDetailPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import BillingPage from "./pages/BillingPage"
import NotificationsPage from "./pages/NotificationsPage"
import LawyersPage from "./pages/LawyersPage"
import LawyerDetailPage from "./pages/LawyerDetailPage"
import LawyerProfileEditPage from "./pages/LawyerProfileEditPage"   // ✅ correct filename

import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lawyers" element={<LawyersPage />} />
        <Route path="/lawyers/:userId" element={<LawyerDetailPage />} />

        {/* ── Protected ─────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/cases" element={
          <ProtectedRoute><CasesPage /></ProtectedRoute>
        } />
        <Route path="/cases/:id" element={
          <ProtectedRoute><CaseDetailPage /></ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute><BillingPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/chat/:caseId" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />

        {/* ── Lawyer only ───────────────────────────────── */}
        <Route path="/profile/edit" element={
          <ProtectedRoute allowedRoles={["LAWYER"]}>
            <LawyerProfileEditPage />           {/* ✅ correct component name */}
          </ProtectedRoute>
        } />

        {/* ── Admin only ────────────────────────────────── */}
        <Route path="/clients" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/hearings" element={
          <ProtectedRoute allowedRoles={["ADMIN", "LAWYER"]}><Dashboard /></ProtectedRoute>
        } />

        {/* ── 404 ───────────────────────────────────────── */}
        <Route path="*" element={
          <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
            <h1 className="fw-bold">404</h1>
            <p className="text-muted">Page not found</p>
            <a href="/" className="btn btn-primary">Back to Home</a>
          </div>
        } />

      </Routes>
    </Router>
  )
}

export default App