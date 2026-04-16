import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)
const API = 'http://localhost:4000/api'

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('credlyy_token'))
  const [complianceLogs, setComplianceLogs] = useState([])
  const [users, setUsers] = useState([]) // admin: list of borrowers

  const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

  // --- Auth ---
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.error }
    localStorage.setItem('credlyy_token', data.token)
    setToken(data.token)
    setCurrentUser(data.user)
    return { success: true, role: data.user.role }
  }

  const signup = async (name, email, password) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.error }
    localStorage.setItem('credlyy_token', data.token)
    setToken(data.token)
    setCurrentUser(data.user)
    return { success: true, role: data.user.role }
  }

  const logout = () => {
    localStorage.removeItem('credlyy_token')
    setToken(null)
    setCurrentUser(null)
    setUsers([])
    setComplianceLogs([])
  }

  // --- Loan Application ---
  const submitLoanApplication = async (userId, formData) => {
    const res = await fetch(`${API}/users/apply`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (res.ok) setCurrentUser(data)
    return data
  }

  // --- AlgoBurn AI Purge Controller ---
  const purgeUserData = async (userId) => {
    const isAdmin = currentUser?.role === 'ROLE_ADMIN'
    const url = isAdmin ? `${API}/admin/purge/${userId}` : `${API}/users/purge`
    const res = await fetch(url, { method: 'POST', headers: authHeaders() })
    if (!res.ok) return

    const timestamp = new Date().toISOString()
    const logEntry = {
      id: Date.now(),
      timestamp,
      message: `DPDP COMPLIANCE TRIGGER: User [${userId}] data wiped via AlgoBurn AI Agent.`,
    }
    setComplianceLogs(prev => [logEntry, ...prev])

    if (isAdmin) {
      // Refresh borrowers list
      setUsers(prev => prev.map(u =>
        u.id === Number(userId)
          ? { ...u, pan: null, monthlyIncome: null, bankStatement: null, consentStatus: 'REVOKED', purged: true }
          : u
      ))
    } else {
      // Self-purge: update currentUser
      const updated = await res.json()
      setCurrentUser(updated)
    }
  }

  // --- Admin: fetch borrowers ---
  const fetchBorrowers = useCallback(async () => {
    const res = await fetch(`${API}/admin/borrowers`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }, [token])

  // --- Admin: fetch compliance logs from DB ---
  const fetchComplianceLogs = useCallback(async () => {
    const res = await fetch(`${API}/admin/logs`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setComplianceLogs(data.map(l => ({
        id: l.id,
        timestamp: l.created_at,
        message: l.message,
      })))
    }
  }, [token])

  return (
    <AppContext.Provider value={{
      users, currentUser, complianceLogs, token,
      login, signup, logout,
      submitLoanApplication, purgeUserData,
      fetchBorrowers, fetchComplianceLogs,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
