import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { CreditCard, Calendar, TrendingUp, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react'

const statusColor = {
  Approved: 'text-emerald-400 bg-emerald-400/10',
  Pending: 'text-yellow-400 bg-yellow-400/10',
  Rejected: 'text-red-400 bg-red-400/10',
}

export default function UserDashboard() {
  const { currentUser } = useApp()
  const navigate = useNavigate()
  const loan = currentUser?.loan

  const handleAlgoBurn = () => {
  // 1. Asset ID nikaalo (Jo tumne backend/context mein save ki hogi)
  const assetId = currentUser?.consentAssetId; 
  
  if (!assetId) {
    alert("Privacy Token not found! Please apply for a loan first.");
    return;
  }

  // 2. Localhost URL use karo (Jahan tera AlgoBurn Dashboard chal raha hai)
  // Maan lo AlgoBurn Dashboard 5173 par hai aur Credlyy 5174 par.
  const dashboardUrl = "http://localhost:5173"; // AlgoBurn Dashboard Port
  const returnUrl = encodeURIComponent(window.location.href);
  
  window.location.href = `${dashboardUrl}/dashboard?assetId=${assetId}&returnUrl=${returnUrl}`;
}

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {currentUser?.name.split(' ')[0]}</h1>
          <p className="text-slate-400 text-sm mt-1">Here's your financial overview.</p>
        </div>

        {/* Loan Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl"><CreditCard className="text-emerald-500" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Active Loan</p>
              {loan ? (
                <>
                  <p className="text-xl font-bold text-white">₹{Number(loan.amount).toLocaleString('en-IN')}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[loan.status] || 'text-slate-400'}`}>
                    {loan.status}
                  </span>
                </>
              ) : <p className="text-slate-500 text-sm">No active loan</p>}
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl"><Calendar className="text-blue-400" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Next Payment</p>
              <p className="text-lg font-semibold text-white">
                {loan?.nextPayment ? new Date(loan.nextPayment).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl"><TrendingUp className="text-purple-400" size={22} /></div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Credit Score</p>
              <p className="text-xl font-bold text-white">{loan?.creditScore ?? '—'}</p>
              {loan?.creditScore && <p className="text-xs text-slate-500">{loan.creditScore >= 720 ? 'Excellent' : loan.creditScore >= 680 ? 'Good' : 'Fair'}</p>}
            </div>
          </div>
        </div>

        {/* Apply for Loan */}
        {!loan && (
          <div className="card border-dashed border-emerald-500/30 text-center py-8">
            <p className="text-slate-400 mb-4">You don't have an active loan application.</p>
            <button onClick={() => navigate('/apply')} className="btn-primary">Apply for a Loan</button>
          </div>
        )}
        {loan && loan.status !== 'Approved' && (
          <div className="card flex items-center justify-between">
            <p className="text-slate-400 text-sm">Want to apply for a new loan?</p>
            <button onClick={() => navigate('/apply')} className="btn-secondary text-sm">New Application</button>
          </div>
        )}

        {/* Privacy Vault — AlgoBurn SDK Placeholder */}
        <div className="card border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-emerald-500" size={22} />
            <h2 className="font-semibold text-white">Privacy Vault</h2>
            <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
              Powered by AlgoBurn SDK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-navy-900 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Data Consent Status</p>
              <p className={`font-semibold ${currentUser?.consentStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                {currentUser?.consentStatus ?? '—'}
              </p>
            </div>
            <div className="bg-navy-900 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Sensitive Data on File</p>
              <p className="font-semibold text-slate-300">
                {currentUser?.purged ? 'Purged' : currentUser?.pan ? 'PAN, Income, Bank Statement' : 'None'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleAlgoBurn} className="btn-secondary text-sm flex items-center gap-1.5">
              <ExternalLink size={14} /> Manage Privacy via AlgoBurn
            </button>
          </div>

          {currentUser?.purged && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-xl px-4 py-3">
              <AlertTriangle size={16} />
              Your sensitive data has been purged in compliance with DPDP Act 2023.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
