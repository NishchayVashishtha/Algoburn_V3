import { useState } from 'react'
import { Building2, AlertCircle } from 'lucide-react'
import { login, signup } from '../api'

export default function LoginPage({ onLogin }) {
  const [mode, setMode]       = useState('login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await login(email, password)
        : await signup(name, email, password)
      onLogin(res.token, res.user)
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to backend. Run: cd credlyy/backend && npm start')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail, demoPass) {
    setEmail(demoEmail)
    setPass(demoPass)
    setMode('login')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            CREDLYY<span className="text-blue-400">$</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Microlending Platform — Phase 1</p>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">

          {/* Mode toggle */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                         text-white font-semibold rounded-xl transition-colors"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@credlyy.com', 'admin123')}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600
                           rounded-lg px-3 py-2.5 text-slate-300 transition text-left"
              >
                <span className="font-semibold text-red-400 block mb-0.5">👑 Admin</span>
                admin@credlyy.com
              </button>
              <button
                type="button"
                onClick={() => fillDemo('rahul@test.com', 'user123')}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600
                           rounded-lg px-3 py-2.5 text-slate-300 transition text-left"
              >
                <span className="font-semibold text-blue-400 block mb-0.5">👤 User</span>
                rahul@test.com
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
