import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { RecordProvider } from '@/context/RecordContext'
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import PublicRequest from '@/pages/PublicRequest'
import MyRequests from '@/pages/patient/MyRequests'
import NewRequest from '@/pages/patient/NewRequest'
import MyHistory from '@/pages/patient/MyHistory'
import AdminDashboard from '@/pages/admin/Dashboard'
import AllRequests from '@/pages/admin/AllRequests'
import PendingApproval from '@/pages/admin/PendingApproval'
import Patients from '@/pages/admin/Patients'
import TransactionLogs from '@/pages/admin/TransactionLogs'
import Reports from '@/pages/admin/Reports'
import Settings from '@/pages/Settings'

function PatientRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<MyRequests />} />
        <Route path="new-request" element={<NewRequest />} />
        <Route path="my-history" element={<MyHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="requests" element={<AllRequests />} />
        <Route path="pending" element={<PendingApproval />} />
        <Route path="patients" element={<Patients />} />
        <Route path="transactions" element={<TransactionLogs />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/request" element={<PublicRequest />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (user.role === 'Admin') {
    return <AdminRoutes />
  }

  return <PatientRoutes />
}

export default function App() {
  return (
    <BrowserRouter basename="/PatientRecord">
      <AuthProvider>
        <RecordProvider>
          <AppRoutes />
        </RecordProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
