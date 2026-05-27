import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing          from './pages/Landing'
import { Login }        from './pages/Login'
import { Register }     from './pages/Login'
import Dashboard        from './pages/Dashboard'
import Builder          from './pages/Builder'
import AdminPage        from './pages/Admin'
import NotFound         from './pages/NotFound'
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword'
import PortfolioStatus  from './pages/PortfolioStatus'

function Spinner() {
  return (
    <div className="min-h-screen bg-[#F7F3ED] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#D4922A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="grain-overlay">
        <Routes>
          <Route path="/"                         element={<Landing />} />
          <Route path="/login"                    element={<Login />} />
          <Route path="/register"                 element={<Register />} />
          <Route path="/forgot-password"          element={<ForgotPassword />} />
          <Route path="/reset-password"           element={<ResetPassword />} />
          <Route path="/dashboard"                element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/builder"                  element={<PrivateRoute><Builder /></PrivateRoute>} />
          <Route path="/portfolio/:id/status"     element={<PrivateRoute><PortfolioStatus /></PrivateRoute>} />
          <Route path="/admin"                    element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*"                         element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
