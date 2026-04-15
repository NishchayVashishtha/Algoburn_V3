import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LogOut, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-navy-800 border-b border-slate-700/60 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-emerald-500" size={24} />
        <span className="text-xl font-bold text-white tracking-tight">CREDLYY<span className="text-emerald-500">$</span></span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">
          {currentUser?.name} &nbsp;
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {currentUser?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
          </span>
        </span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  )
}
