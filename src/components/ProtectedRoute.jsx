import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [waited, setWaited] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading && !waited) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '1.2rem',
        color: '#888'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}