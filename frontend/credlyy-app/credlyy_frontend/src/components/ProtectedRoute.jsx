import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}
