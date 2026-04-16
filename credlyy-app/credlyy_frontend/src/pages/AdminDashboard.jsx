import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import ComplianceLog from '../components/ComplianceLog'
import { Users, IndianRupee, Trash2, ShieldAlert } from 'lucide-react'

const statusColor = {
  Approved: 'text-emerald-400 bg-emerald-400/10',
  Pending: 'text-yellow-400 bg-yellow-400/10',
  Rejected: 'text-red-400 bg-red-400/10',
}

export default function AdminDashboard() {
  const { users, purgeUserData, fetchBorrowers, fetchComplianceLogs } = useApp()

  useEffect(() => {
    fetchBorrowers()
    fetchComplianceLogs()
  }, [])
  const borrowers = users // already filtered to ROLE_USER by API
  const totalDisbursed = borrowers
    .filter(u => u.loan?.status === 'Approved')
    .reduce((sum, u) => sum + (Number(u.loan?.amount) || 0), 0)
  const activeLoans = borrowers.filter(u => u.loan?.status === 'Approved').length

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-emerald-500" size={26} />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Borrower management & compliance controls</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl"><Users className="text-blue-400" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500">Total Borrowers</p>
              <p className="text-2xl font-bold text-white">{borrowers.length}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl"><IndianRupee className="text-emerald-500" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500">Total Disbursed</p>
              <p className="text-2xl font-bold text-white">₹{totalDisbursed.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl"><ShieldAlert className="text-purple-400" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500">Active Loans</p>
              <p className="text-2xl font-bold text-white">{activeLoans}</p>
            </div>
          </div>
        </div>

        {/* Borrowers Table */}
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="font-semibold text-slate-200">All Borrowers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">PAN</th>
                  <th className="text-left px-6 py-3">Loan Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Consent</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowers.map(user => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {user.purged ? <span className="text-red-400 text-xs">PURGED</span> : (user.pan || '—')}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.loan ? `₹${Number(user.loan.amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {user.loan ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[user.loan.status] || 'text-slate-400'}`}>
                          {user.loan.status}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.consentStatus === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {user.consentStatus || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!user.purged ? (
                        <button
                          onClick={async () => { await purgeUserData(user.id); fetchComplianceLogs() }}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={12} /> Purge Data
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">Data Purged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Log */}
        <ComplianceLog />
      </div>
    </div>
  )
}
