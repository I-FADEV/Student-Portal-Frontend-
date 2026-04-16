import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()

  // Not logged in at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Logged in but wrong role → go to login
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  // All good → show the page
  return children
}

export default ProtectedRoute