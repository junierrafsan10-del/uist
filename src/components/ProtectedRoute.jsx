import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  const stored = JSON.parse(sessionStorage.getItem('authUser') || 'null')
  const isAuthenticated = !!(user || stored)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    const role = profile?.role || stored?.role
    if (allowedRoles && !allowedRoles.includes(role)) {
      navigate('/unauthorized', { replace: true })
    }
  }, [loading, isAuthenticated, profile, allowedRoles, navigate, stored?.role])

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return null
  const role = profile?.role || stored?.role
  if (allowedRoles && !allowedRoles.includes(role)) return null

  return children
}
