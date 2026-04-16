import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { fetchConfig } from './api'

export default function App() {
  const [user, setUser]                   = useState(null)
  const [algoBurnEnabled, setAlgoBurn]    = useState(false)
  const [configLoaded, setConfigLoaded]   = useState(false)

  // Fetch the IS_ALGOBURN_ENABLED flag from backend on mount
  useEffect(() => {
    fetchConfig()
      .then(cfg => setAlgoBurn(cfg.IS_ALGOBURN_ENABLED))
      .catch(() => setAlgoBurn(false))
      .finally(() => setConfigLoaded(true))

    const token    = localStorage.getItem('credlyy_token')
    const userData = localStorage.getItem('credlyy_user')
    if (token && userData) setUser(JSON.parse(userData))
  }, [])

  function handleLogin(token, userData) {
    localStorage.setItem('credlyy_token', token)
    localStorage.setItem('credlyy_user', JSON.stringify(userData))
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('credlyy_token')
    localStorage.removeItem('credlyy_user')
    setUser(null)
  }

  if (!configLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Connecting to CREDLYY$ backend...</p>
      </div>
    )
  }

  if (!user) return <LoginPage onLogin={handleLogin} algoBurnEnabled={algoBurnEnabled} />

  return user.role === 'ADMIN'
    ? <AdminDashboard user={user} onLogout={handleLogout} algoBurnEnabled={algoBurnEnabled} />
    : <UserDashboard  user={user} onLogout={handleLogout} algoBurnEnabled={algoBurnEnabled} />
}
