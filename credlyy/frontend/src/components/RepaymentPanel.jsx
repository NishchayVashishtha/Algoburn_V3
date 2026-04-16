import { useState } from 'react'
import { CreditCard, Zap, CheckCircle, TrendingDown } from 'lucide-react'
import { repayLoan } from '../api'

const EMI = 5000

export default function RepaymentPanel({ app, onRepaid }) {
  const [paying, setPaying] = useState(null)   // 'emi' | 'full' | null
  const [error,  setError]  = useState('')

  const pct = Math.round(((app.loanAmount - app.loanBalance) / app.loanAmount) * 100)

  async function handlePay(type) {
    setPaying(type)
    setError('')
    try {
      const res = await repayLoan(app.id, type)
      onRepaid(app.id, res.remainingBalance)
    } catch (err) {
      setError(err.message)
    } finally {
      setPaying(null)
    }
  }

  if (app.loanBalance <= 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40
                       border border-emerald-700/50 rounded-xl px-3 py-2">
        <CheckCircle className="w-4 h-4" />
        <span className="font-semibold">Loan fully repaid — Kill Switch is now active</span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-blue-400" /> Loan Repayment
        </span>
        <span className="text-xs text-slate-500">
          EMI: ₹{EMI.toLocaleString()} / payment
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Repaid</span>
          <span className="text-white font-medium">
            ₹{(app.loanAmount - app.loanBalance).toLocaleString()} / ₹{app.loanAmount.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-slate-500">{pct}% complete</span>
          <span className="text-red-400 font-medium">
            ₹{app.loanBalance.toLocaleString()} remaining
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handlePay('emi')}
          disabled={!!paying}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold
                     bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                     text-white py-2 rounded-lg transition"
        >
          {paying === 'emi'
            ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
            : <><CreditCard className="w-3.5 h-3.5" /> Pay EMI (₹{EMI.toLocaleString()})</>
          }
        </button>
        <button
          onClick={() => handlePay('full')}
          disabled={!!paying}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold
                     bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60
                     text-white py-2 rounded-lg transition"
        >
          {paying === 'full'
            ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
            : <><Zap className="w-3.5 h-3.5" /> Pay Full Now</>
          }
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {app.lastPaymentAt && (
        <p className="text-xs text-slate-600">
          Last payment: {new Date(app.lastPaymentAt).toLocaleString()}
        </p>
      )}
    </div>
  )
}
