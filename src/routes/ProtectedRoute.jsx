import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuth()

  // Not logged in at all → go to login
  if (!token) {
    return <Navigate to="/" replace />
  }

  // Logged in but wrong role → go to login
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
  return <Navigate to="/" replace />
}

  // All good → show the page
  return children
}

export default ProtectedRoute