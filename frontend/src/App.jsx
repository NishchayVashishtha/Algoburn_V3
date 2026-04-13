import { useState } from 'react'
import LoginCard from './components/LoginCard'
import ZKPVault from './components/ZKPVault'
import DPDPDashboard from './components/DPDPDashboard'
import Toast from './components/Toast'

// Maps mock emails → enterprise userId (mirrors the enterprise-api in-memory DB)
const EMAIL_TO_USER_ID = {
  'amit@test.com':  'user_001',
  'priya@test.com': 'user_002',
  'rahul@test.com': 'user_003',
  'sneha@test.com': 'user_004',
  'karan@test.com': 'user_005',
  'divya@test.com': 'user_006',
  'arjun@test.com': 'user_007',
  'meera@test.com': 'user_008',
}

const STATE = { LOGIN: 'login', VAULT: 'vault', DASHBOARD: 'dashboard' }

export default function App() {
  const [appState, setAppState] = useState(STATE.LOGIN)
  const [email, setEmail]       = useState('')
  const [userId, setUserId]     = useState(null)
  const [mintTxId, setMintTxId] = useState(null)
  const [error, setError]       = useState(null)

  function handleLogin(userEmail) {
    setEmail(userEmail)
    // Resolve enterprise userId from email (null if not in mock DB)
    setUserId(EMAIL_TO_USER_ID[userEmail.toLowerCase()] ?? null)
    setAppState(STATE.VAULT)
  }

  function handleMintSuccess(txId) {
    setMintTxId(txId)
    setAppState(STATE.DASHBOARD)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100
                    flex flex-col items-center justify-center px-4 py-12">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {appState === STATE.LOGIN && <LoginCard onLogin={handleLogin} />}

      {appState === STATE.VAULT && (
        <ZKPVault email={email} onSuccess={handleMintSuccess} onError={setError} />
      )}

      {appState === STATE.DASHBOARD && (
        <DPDPDashboard
          email={email}
          mintTxId={mintTxId}
          userId={userId}
          onError={setError}
        />
      )}

      <p className="mt-8 text-xs text-gray-400 text-center">
        Powered by{' '}
        <a
          href="https://algorand.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-600 underline"
        >
          Algorand
        </a>{' '}
        · Zero-Knowledge Proofs · DPDP Act Compliant
      </p>

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </div>
  )
}
