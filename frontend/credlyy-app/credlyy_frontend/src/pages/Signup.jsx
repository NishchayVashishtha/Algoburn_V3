import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ShieldCheck } from 'lucide-react'

export default function Signup() {
  const { signup } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = signup(form.name, form.email, form.password)
    if (!result.success) return setError(result.message)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="text-emerald-500" size={32} />
            <span className="text-3xl font-bold text-white">CREDLYY<span className="text-emerald-500">$</span></span>
          </div>
          <p className="text-slate-400 text-sm">Create your borrower account</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">New Account</h2>
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" type="text" placeholder="Your full name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} minLength={6} required />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Create Account</button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
