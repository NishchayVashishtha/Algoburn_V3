import { useState, useEffect } from 'react'
import {
  Building2, LogOut, FileText, PlusCircle,
  CheckCircle, Clock, XCircle, ShieldOff, ExternalLink, ShieldCheck
} from 'lucide-react'
import LoanForm from '../components/LoanForm'
import PrivacyBadge from '../components/PrivacyBadge'
import RepaymentPanel from '../components/RepaymentPanel'
import ErasureCertificate from '../components/ErasureCertificate'
import { myApplications, revokeConsent } from '../api'

const STATUS_STYLE = {
  Pending:  { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-800' },
  Approved: { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-950/50  border-green-800'  },
  Rejected: { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-950/50    border-red-800'    },
}

const CONSENT_STYLE = {
  'Blockchain Verified': 'text-emerald-400 bg-emerald-950/50 border-emerald-700',
  'Unprotected':         'text-red-400     bg-red-950/50     border-red-700',
  'Revoked':             'text-slate-400   bg-slate-800      border-slate-600',
  'AI Purged':           'text-slate-400   bg-slate-800      border-slate-600',
}

export default function UserDashboard({ user, onLogout, algoBurnEnabled }) {
  const [view, setView]           = useState('home')
  const [applications, setApps]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [revoking, setRevoking]   = useState(null)
  const [certificate, setCert]    = useState(null)   // receipt data after purge

  async function fetchApps() {
    setLoading(true)
    try { const r = await myApplications(); setApps(r.applications) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { if (view === 'applications') fetchApps() }, [view])

  // Called by RepaymentPanel after a successful payment
  function handleRepaid(appId, newBalance) {
    setApps(prev => prev.map(a =>
      a.id === appId ? { ...a, loanBalance: newBalance } : a
    ))
  }

  async function handleRevoke(appId) {
    setRevoking(appId)
    try {
      const res = await revokeConsent(appId)
      // Update local state immediately
      setApps(prev => prev.map(a =>
        a.id === appId
          ? { ...a, consentStatus: 'Revoked', panCard: '[PURGED]', aadhaar: '[PURGED]',
              burnTxId: res.txId, burnExplorerUrl: res.explorerUrl,
              purgedAt: res.purgedAt, dpdpComplianceId: res.dpdpComplianceId }
          : a
      ))
      // Show the certificate modal
      setCert({
        txId:             res.txId,
        explorerUrl:      res.explorerUrl,
        purgedAt:         res.purgedAt,
        dpdpComplianceId: res.dpdpComplianceId,
        assetId:          res.assetId,
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setRevoking(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Erasure Certificate Modal */}
      {certificate && (
        <ErasureCertificate data={certificate} onClose={() => setCert(null)} />
      )}

      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">CREDLYY<span className="text-blue-400">$</span></span>
        </div>
        <PrivacyBadge enabled={algoBurnEnabled} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Welcome, <span className="text-white font-medium">{user.name}</span>
          </span>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'home',         label: 'Overview',        icon: Building2  },
            { id: 'apply',        label: 'Apply for Loan',  icon: PlusCircle },
            { id: 'applications', label: 'My Applications', icon: FileText   },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                view === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {view === 'home' && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Max Loan Amount', value: '₹5,00,000', sub: 'Based on eligibility' },
                { label: 'Interest Rate',   value: '12% p.a.',  sub: 'Flat rate'            },
                { label: 'Max Tenure',      value: '60 Months', sub: 'Up to 5 years'        },
              ].map(s => (
                <div key={s.label} className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            {algoBurnEnabled ? (
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-2xl p-5">
                <p className="text-emerald-400 font-semibold text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Phase 2 — AlgoBurn Privacy Layer Active
                </p>
                <p className="text-emerald-200/70 text-sm">
                  Your PAN Card and Aadhaar are protected by Zero-Knowledge Proofs.
                  A Consent SoulBound Token (SBT) is minted on Algorand for every application.
                  Once your loan is fully repaid, you can activate the Kill Switch to permanently
                  purge your data and receive a DPDP Certificate of Erasure.
                </p>
              </div>
            ) : (
              <div className="bg-amber-950/30 border border-amber-700/50 rounded-2xl p-5">
                <p className="text-amber-400 font-semibold text-sm mb-1">⚠️ Phase 1 — Legacy System</p>
                <p className="text-amber-200/70 text-sm">
                  Your PAN Card and Aadhaar are stored in plain text and visible to all admins.
                </p>
              </div>
            )}

            <button onClick={() => setView('apply')}
              className={`flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg ${
                algoBurnEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/40'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40'
              }`}>
              <PlusCircle className="w-5 h-5" />
              {algoBurnEnabled ? 'Apply with ZKP Protection' : 'Apply for a Loan'}
            </button>
          </div>
        )}

        {/* ── Loan Form ────────────────────────────────────────────────────── */}
        {view === 'apply' && (
          <LoanForm onSuccess={() => setView('applications')} algoBurnEnabled={algoBurnEnabled} />
        )}

        {/* ── My Applications ──────────────────────────────────────────────── */}
        {view === 'applications' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Applications</h2>
              <button onClick={fetchApps} className="text-xs text-blue-400 hover:text-blue-300">↻ Refresh</button>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : applications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No applications yet.</p>
                <button onClick={() => setView('apply')} className="mt-3 text-blue-400 text-sm hover:underline">
                  Apply now →
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {applications.map(app => {
                  const s = STATUS_STYLE[app.status] || STATUS_STYLE.Pending
                  const isPurged   = app.consentStatus === 'Revoked' || app.consentStatus === 'AI Purged'
                  const canRevoke  = app.algoBurnEnabled && app.assetId && !isPurged && app.loanBalance === 0
                  const showRepay  = app.status === 'Approved' && app.loanBalance > 0

                  return (
                    <div key={app.id} className={`rounded-2xl border p-5 transition-all ${
                      isPurged
                        ? 'bg-slate-900/50 border-slate-700 opacity-75'
                        : 'bg-slate-900 border-slate-700'
                    }`}>
                      {/* App header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white font-mono text-sm">{app.id}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(app.submittedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPurged && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full border
                                             bg-slate-800 text-slate-400 border-slate-600">
                              DATA PURGED
                            </span>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.color}`}>
                            <s.icon className="w-3 h-3" />{app.status}
                          </span>
                        </div>
                      </div>

                      {/* Loan stats */}
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-slate-500 text-xs">Loan Amount</p>
                          <p className="text-white font-medium">₹{app.loanAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Remaining Balance</p>
                          <p className={`font-medium ${app.loanBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {app.loanBalance > 0 ? `₹${app.loanBalance.toLocaleString()}` : '✓ Fully Repaid'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Tenure</p>
                          <p className="text-white font-medium">{app.tenure}m</p>
                        </div>
                      </div>

                      {/* Repayment panel — only for approved loans with balance */}
                      {showRepay && (
                        <div className="mb-3">
                          <RepaymentPanel app={app} onRepaid={handleRepaid} />
                        </div>
                      )}

                      {/* AlgoBurn SBT info */}
                      {app.algoBurnEnabled && app.assetId && (
                        <div className={`border rounded-xl p-3 mb-3 ${
                          isPurged
                            ? 'bg-slate-800/40 border-slate-700'
                            : 'bg-emerald-950/20 border-emerald-800/40'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-400 font-semibold">🔗 Consent SBT</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              CONSENT_STYLE[app.consentStatus] || CONSENT_STYLE['Unprotected']
                            }`}>
                              {app.consentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Asset ID: <span className="font-mono text-slate-300">{app.assetId}</span>
                          </p>
                          {app.explorerUrl && (
                            <a href={app.explorerUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-1">
                              <ExternalLink className="w-3 h-3" /> View on Pera Explorer
                            </a>
                          )}
                        </div>
                      )}

                      {/* ── Kill Switch ─────────────────────────────────────── */}
                      {app.algoBurnEnabled && app.assetId && !isPurged && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleRevoke(app.id)}
                            disabled={!canRevoke || revoking === app.id}
                            title={
                              !canRevoke && app.loanBalance > 0
                                ? 'Consent cannot be revoked until the loan is fully repaid.'
                                : 'Revoke consent and permanently purge your data'
                            }
                            className={`w-full flex items-center justify-center gap-2 text-sm font-bold
                                        py-3 px-4 rounded-xl border transition-all
                                        ${canRevoke
                                          ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white animate-pulse hover:animate-none cursor-pointer'
                                          : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed opacity-60'
                                        }`}
                          >
                            {revoking === app.id ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Initiating Global Data Purge Protocol via AI Agent...
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-4 h-4" />
                                {canRevoke
                                  ? '🚨 Revoke Data Consent & Purge Records'
                                  : `🔒 Revoke Locked — ₹${app.loanBalance.toLocaleString()} outstanding`
                                }
                              </>
                            )}
                          </button>

                          {!canRevoke && app.loanBalance > 0 && (
                            <p className="text-xs text-center text-slate-500">
                              Consent cannot be revoked until the loan is fully repaid.
                              Use the repayment panel above to clear your balance.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Post-purge status */}
                      {isPurged && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400
                                          bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5">
                            <ShieldOff className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Consent revoked — AI Agent has purged all enterprise data.
                              {app.dpdpComplianceId && (
                                <span className="ml-1 font-mono text-slate-500">
                                  DPDP: {app.dpdpComplianceId}
                                </span>
                              )}
                            </span>
                            {app.burnExplorerUrl && (
                              <a href={app.burnExplorerUrl} target="_blank" rel="noopener noreferrer"
                                className="ml-auto text-blue-400 hover:text-blue-300 shrink-0">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {app.dpdpComplianceId && (
                            <button
                              onClick={() => setCert({
                                txId:             app.burnTxId,
                                explorerUrl:      app.burnExplorerUrl,
                                purgedAt:         app.purgedAt,
                                dpdpComplianceId: app.dpdpComplianceId,
                                assetId:          app.assetId,
                              })}
                              className="w-full text-xs text-emerald-400 hover:text-emerald-300
                                         border border-emerald-800/50 bg-emerald-950/20
                                         rounded-xl py-2 transition"
                            >
                              📜 View Certificate of Data Erasure
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
