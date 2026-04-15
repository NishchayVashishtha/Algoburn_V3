import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (!result.success) return setError(result.message)
    navigate(result.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="text-emerald-500" size={32} />
            <span className="text-3xl font-bold text-white">CREDLYY<span className="text-emerald-500">$</span></span>
          </div>
          <p className="text-slate-400 text-sm">Secure Microlending Platform</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Sign In</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            No account? <Link to="/signup" className="text-emerald-400 hover:underline">Create one</Link>
          </p>
          <div className="mt-5 pt-4 border-t border-slate-700 text-xs text-slate-600 space-y-1">
            <p>Demo — User: rahul@example.com / rahul123</p>
            <p>Demo — Admin: admin@credlyy.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
