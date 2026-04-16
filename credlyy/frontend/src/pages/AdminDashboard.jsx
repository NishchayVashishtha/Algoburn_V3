import { useState, useEffect } from 'react'
import {
  Building2, LogOut, Users, FileText,
  RefreshCw, ShieldAlert, ShieldCheck, ExternalLink
} from 'lucide-react'
import PrivacyBadge from '../components/PrivacyBadge'
import { allApplications, updateStatus, allUsers } from '../api'

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected']
const STATUS_STYLE = {
  Pending:  'bg-yellow-950/60 text-yellow-400 border-yellow-700',
  Approved: 'bg-green-950/60  text-green-400  border-green-700',
  Rejected: 'bg-red-950/60    text-red-400    border-red-700',
}

export default function AdminDashboard({ user, onLogout, algoBurnEnabled }) {
  const [view, setView]         = useState('applications')
  const [applications, setApps] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [updating, setUpdating] = useState(null)

  async function fetchApps() {
    setLoading(true)
    try { const r = await allApplications(); setApps(r.applications) }
    catch {} finally { setLoading(false) }
  }

  async function fetchUsers() {
    setLoading(true)
    try { const r = await allUsers(); setUsers(r.users) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    if (view === 'applications') fetchApps()
    if (view === 'users') fetchUsers()
  }, [view])

  async function handleStatusChange(id, status) {
    setUpdating(id)
    try {
      await updateStatus(id, status)
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch {}
    finally { setUpdating(null) }
  }

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'Pending').length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  // Table headers change based on phase
  const appHeaders = algoBurnEnabled
    ? ['App ID','Name','Email','Phone','PAN Card','Aadhaar','Income','Loan Amt','Tenure','Consent Status','SBT Asset','Submitted','Status','Action']
    : ['App ID','Name','Email','Phone','PAN Card ⚠️','Aadhaar ⚠️','Income','Loan Amt','Tenure','Submitted','Status','Action']

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">CREDLYY<span className="text-blue-400">$</span></span>
          <span className="text-xs bg-red-900/60 text-red-400 border border-red-700 px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
        </div>
        <PrivacyBadge enabled={algoBurnEnabled} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user.name}</span>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'applications', label: 'Loan Applications', icon: FileText },
            { id: 'users',        label: 'All Users',         icon: Users    },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                view === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
          <button onClick={() => view === 'applications' ? fetchApps() : fetchUsers()}
            className="ml-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Applications */}
        {view === 'applications' && (
          <div className="animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total',    value: stats.total,    color: 'text-white'      },
                { label: 'Pending',  value: stats.pending,  color: 'text-yellow-400' },
                { label: 'Approved', value: stats.approved, color: 'text-green-400'  },
                { label: 'Rejected', value: stats.rejected, color: 'text-red-400'    },
              ].map(s => (
                <div key={s.label} className="bg-slate-900 border border-slate-700 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Phase banner */}
            {algoBurnEnabled ? (
              <div className="flex items-start gap-3 bg-emerald-950/30 border border-emerald-700/50 rounded-xl p-4 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">Phase 2 — AlgoBurn Privacy Active</p>
                  <p className="text-emerald-300/60 text-xs mt-0.5">
                    PAN and Aadhaar are masked. Consent is verified on Algorand blockchain.
                    Raw PII is never stored — only ZKP proofs and SBT asset IDs.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-red-950/30 border border-red-700/50 rounded-xl p-4 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold text-sm">Phase 1 — Raw PII Exposure</p>
                  <p className="text-red-300/60 text-xs mt-0.5">
                    PAN Card and Aadhaar are in plain text. This demonstrates the Web2 privacy risk.
                    Enable AlgoBurn (IS_ALGOBURN_ENABLED=true) to activate Phase 2.
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : applications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No applications yet.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {appHeaders.map(h => (
                          <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                            h.includes('⚠️') ? 'text-red-400' :
                            h === 'Consent Status' || h === 'SBT Asset' ? 'text-emerald-400' :
                            'text-slate-400'
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app, i) => (
                        <tr key={app.id} className={`border-b border-slate-800 hover:bg-slate-800/50 transition ${i % 2 ? 'bg-slate-800/20' : ''}`}>
                          <td className="px-4 py-3 font-mono text-blue-400 text-xs whitespace-nowrap">{app.id}</td>
                          <td className="px-4 py-3 text-white whitespace-nowrap">{app.fullName}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{app.email}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{app.phone}</td>

                          {/* PAN — masked in Phase 2 */}
                          <td className={`px-4 py-3 font-mono whitespace-nowrap ${
                            algoBurnEnabled ? 'text-emerald-300' : 'text-red-300 bg-red-950/20'
                          }`}>{app.panCard}</td>

                          {/* Aadhaar — masked in Phase 2 */}
                          <td className={`px-4 py-3 font-mono whitespace-nowrap ${
                            algoBurnEnabled ? 'text-emerald-300' : 'text-red-300 bg-red-950/20'
                          }`}>{app.aadhaar}</td>

                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">₹{app.monthlyIncome?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">₹{app.loanAmount?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{app.tenure}m</td>

                          {/* Consent Status column (Phase 2 only) */}
                          {algoBurnEnabled && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                app.consentStatus === 'Blockchain Verified'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700'
                                  : app.consentStatus === 'Revoked' || app.consentStatus === 'AI Purged'
                                  ? 'bg-slate-800 text-slate-400 border-slate-600'
                                  : 'bg-red-950/60 text-red-400 border-red-700'
                              }`}>
                                {app.consentStatus === 'Blockchain Verified' ? '✅ ' : ''}{app.consentStatus}
                              </span>
                            </td>
                          )}

                          {/* SBT Asset ID (Phase 2 only) */}
                          {algoBurnEnabled && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              {app.assetId ? (
                                <a href={app.explorerUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono">
                                  {app.assetId} <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : <span className="text-slate-600 text-xs">—</span>}
                            </td>
                          )}

                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[app.status]}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select value={app.status} disabled={updating === app.id}
                              onChange={e => handleStatusChange(app.id, e.target.value)}
                              className="text-xs py-1 px-2 w-28">
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {view === 'users' && (
          <div className="animate-fade-in">
            {loading ? <p className="text-slate-500 text-sm">Loading...</p> : (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {['User ID','Name','Email','Role'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 font-mono text-blue-400 text-xs">{u.id}</td>
                        <td className="px-4 py-3 text-white">{u.name}</td>
                        <td className="px-4 py-3 text-slate-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            u.role === 'ADMIN'
                              ? 'bg-red-950/60 text-red-400 border-red-700'
                              : 'bg-blue-950/60 text-blue-400 border-blue-700'
                          }`}>{u.role}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
