import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
import ReceptionDashboard from './pages/ReceptionDashboard.jsx'
import ReceptionBilling from './pages/ReceptionBilling.jsx'
import LabDashboard from './pages/LabDashboard.jsx'
import ReceptionPatient from './pages/ReceptionPatient.jsx'
import DoctorPatient from './pages/DoctorPatient.jsx'

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function HomeRoute() {
  const { user, getDashboardPath } = useAuth()
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // If user is authenticated, redirect to their dashboard
  const dashboardPath = getDashboardPath(user.role)
  return <Navigate to={dashboardPath} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomeRoute />} />
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute roles={["DOCTOR","ADMIN"]}><AppLayout><DoctorDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/doctor/patient/:patientId" element={<ProtectedRoute roles={["DOCTOR","ADMIN"]}><AppLayout><DoctorPatient /></AppLayout></ProtectedRoute>} />
        <Route path="/reception" element={<ProtectedRoute roles={["RECEPTIONIST","ADMIN"]}><AppLayout><ReceptionDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/reception/patient/:patientId" element={<ProtectedRoute roles={["RECEPTIONIST","ADMIN"]}><AppLayout><ReceptionPatient /></AppLayout></ProtectedRoute>} />
        <Route path="/reception/billing" element={<ProtectedRoute roles={["RECEPTIONIST","ADMIN"]}><AppLayout><ReceptionBilling /></AppLayout></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute roles={["LAB","ADMIN"]}><AppLayout><LabDashboard /></AppLayout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}