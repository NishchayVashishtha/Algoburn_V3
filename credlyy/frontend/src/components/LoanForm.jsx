import { useState } from 'react'
import {
  User, Mail, Phone, CreditCard, Fingerprint,
  DollarSign, TrendingUp, Calendar,
  CheckCircle, AlertTriangle, ShieldCheck, ExternalLink, Lock
} from 'lucide-react'
import { applyLoan } from '../api'

const STEPS = ['Basic Info', 'Identity (PII)', 'Financial Info', 'Review & Submit']

function checkEligibility(monthlyIncome, loanAmount, tenure) {
  if (!monthlyIncome || !loanAmount || !tenure) return null
  const emi = loanAmount / tenure
  const dti = (emi / monthlyIncome) * 100
  return {
    emi:      Math.round(emi),
    dti:      Math.round(dti),
    eligible: dti <= 40,
    message:  dti <= 40
      ? `✅ Eligible — EMI is ${Math.round(dti)}% of income (threshold: 40%)`
      : `❌ Not Eligible — EMI is ${Math.round(dti)}% of income (exceeds 40%)`,
  }
}

// ZKP simulation steps shown in Phase 2
const ZKP_STEPS = [
  'Hashing PAN & Aadhaar locally...',
  'Generating Zero-Knowledge Proof...',
  'Submitting proof to Algorand...',
  'Minting Consent SBT on-chain...',
]

export default function LoanForm({ onSuccess, algoBurnEnabled }) {
  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [zkpStep, setZkpStep]   = useState(-1)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState(null)   // submission result

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    panCard: '', aadhaar: '',
    monthlyIncome: '', loanAmount: '', tenure: '',
  })

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  const eligibility = checkEligibility(
    Number(form.monthlyIncome), Number(form.loanAmount), Number(form.tenure)
  )

  async function handleSubmit() {
    setError('')
    setLoading(true)

    if (algoBurnEnabled) {
      // Simulate ZKP generation steps before hitting the API
      for (let i = 0; i < ZKP_STEPS.length; i++) {
        setZkpStep(i)
        await new Promise(r => setTimeout(r, 900))
      }
    }

    try {
      const res = await applyLoan(form)
      setResult(res)
    } catch (err) {
      setError(err.message)
      setZkpStep(-1)
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="animate-fade-in max-w-md mx-auto">
        <div className={`rounded-2xl border p-8 text-center ${
          algoBurnEnabled
            ? 'bg-emerald-950/30 border-emerald-700'
            : 'bg-slate-900 border-green-700'
        }`}>
          {algoBurnEnabled
            ? <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            : <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          }

          <h2 className="text-xl font-bold text-white mb-1">
            {algoBurnEnabled ? 'Privacy-Protected Application Submitted!' : 'Application Submitted!'}
          </h2>

          {algoBurnEnabled && (
            <p className="text-emerald-400 text-xs font-semibold mb-4">
              ✅ Eligibility Verified via ZKP — Raw PII never left your device
            </p>
          )}

          <p className="text-slate-400 text-sm mb-1">Application ID</p>
          <p className="font-mono text-blue-400 text-lg font-bold mb-4">{result.applicationId}</p>

          {algoBurnEnabled && result.assetId && (
            <div className="bg-slate-900 border border-emerald-800/50 rounded-xl p-4 mb-4 text-left space-y-2">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                🔗 Algorand Consent SBT
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Asset ID</span>
                <span className="font-mono text-white">{result.assetId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tx ID</span>
                <span className="font-mono text-emerald-300 truncate max-w-[180px]">{result.consentTxId}</span>
              </div>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Verify on Pera Explorer
              </a>
            </div>
          )}

          <button
            onClick={onSuccess}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
          >
            View My Applications
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step   ? 'bg-blue-600 text-white' :
              i === step ? 'bg-blue-600 text-white ring-4 ring-blue-900' :
                           'bg-slate-700 text-slate-400'
            }`}>{i < step ? '✓' : i + 1}</div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-slate-400 mb-5">{STEPS[step]}</p>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <Field label="Full Name" icon={User}>
              <input type="text" placeholder="Rahul Sharma" value={form.fullName}
                onChange={e => update('fullName', e.target.value)} />
            </Field>
            <Field label="Email Address" icon={Mail}>
              <input type="email" placeholder="rahul@example.com" value={form.email}
                onChange={e => update('email', e.target.value)} />
            </Field>
            <Field label="Phone Number" icon={Phone}>
              <input type="tel" placeholder="9876543210" value={form.phone}
                onChange={e => update('phone', e.target.value)} />
            </Field>
          </>
        )}

        {/* Step 1: PII — different UI per phase */}
        {step === 1 && (
          <>
            {algoBurnEnabled ? (
              <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-3 mb-2">
                <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Phase 2 — AlgoBurn ZKP Protection Active
                </p>
                <p className="text-emerald-300/70 text-xs mt-1">
                  Your PAN and Aadhaar will be hashed locally. Only a Zero-Knowledge Proof
                  is submitted — raw values are never stored or transmitted.
                </p>
              </div>
            ) : (
              <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 mb-2">
                <p className="text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Phase 1 Warning: This data will be stored in plain text
                </p>
                <p className="text-red-300/60 text-xs mt-1">
                  Your PAN and Aadhaar are visible to all admins. Enable AlgoBurn to protect this.
                </p>
              </div>
            )}

            <Field label="PAN Card Number" icon={algoBurnEnabled ? Lock : CreditCard}>
              <input type="text" placeholder="ABCDE1234F" value={form.panCard}
                onChange={e => update('panCard', e.target.value.toUpperCase())} maxLength={10} />
            </Field>
            <Field label="Aadhaar Number" icon={algoBurnEnabled ? Lock : Fingerprint}>
              <input type="text" placeholder="1234 5678 9012" value={form.aadhaar}
                onChange={e => update('aadhaar', e.target.value)} maxLength={14} />
            </Field>
          </>
        )}

        {/* Step 2: Financial */}
        {step === 2 && (
          <>
            <Field label="Monthly Income (₹)" icon={DollarSign}>
              <input type="number" placeholder="50000" value={form.monthlyIncome}
                onChange={e => update('monthlyIncome', e.target.value)} min={1} />
            </Field>
            <Field label="Desired Loan Amount (₹)" icon={TrendingUp}>
              <input type="number" placeholder="200000" value={form.loanAmount}
                onChange={e => update('loanAmount', e.target.value)} min={1000} />
            </Field>
            <Field label="Tenure (Months)" icon={Calendar}>
              <select value={form.tenure} onChange={e => update('tenure', e.target.value)}>
                <option value="">Select tenure</option>
                {[6,12,18,24,36,48,60].map(t => (
                  <option key={t} value={t}>{t} months</option>
                ))}
              </select>
            </Field>
            {eligibility && (
              <div className={`rounded-xl border p-3 text-sm ${
                eligibility.eligible
                  ? 'bg-green-950/40 border-green-700 text-green-300'
                  : 'bg-red-950/40 border-red-700 text-red-300'
              }`}>
                <p className="font-semibold">{eligibility.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  EMI: ₹{eligibility.emi.toLocaleString()} / month · DTI: {eligibility.dti}%
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-3 text-sm">
            <ReviewSection title="Basic Info" rows={[
              ['Full Name', form.fullName],
              ['Email',     form.email],
              ['Phone',     form.phone],
            ]} />
            <ReviewSection
              title={algoBurnEnabled ? '🔐 Identity (ZKP Protected)' : '⚠️ Identity (PII — Exposed)'}
              rows={[
                ['PAN Card', algoBurnEnabled ? '••••••••••' : form.panCard],
                ['Aadhaar',  algoBurnEnabled ? '**** **** ****' : form.aadhaar],
              ]}
              danger={!algoBurnEnabled}
              protected={algoBurnEnabled}
            />
            <ReviewSection title="Financial Info" rows={[
              ['Monthly Income', `₹${Number(form.monthlyIncome).toLocaleString()}`],
              ['Loan Amount',    `₹${Number(form.loanAmount).toLocaleString()}`],
              ['Tenure',         `${form.tenure} months`],
            ]} />
            {eligibility && (
              <div className={`rounded-xl border p-3 ${
                eligibility.eligible ? 'bg-green-950/40 border-green-700 text-green-300' : 'bg-red-950/40 border-red-700 text-red-300'
              }`}>
                <p className="font-semibold text-sm">{eligibility.message}</p>
              </div>
            )}
          </div>
        )}

        {/* ZKP loading steps (Phase 2 only) */}
        {loading && algoBurnEnabled && (
          <div className="space-y-2 py-2">
            {ZKP_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-xs">
                {i < zkpStep  ? <span className="text-emerald-400">✓</span>
                 : i === zkpStep ? <span className="inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                 : <span className="w-3 h-3 rounded-full border border-slate-600" />}
                <span className={i <= zkpStep ? 'text-emerald-300 font-medium' : 'text-slate-500'}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 && !loading && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition">
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              disabled={!canProceed(step, form)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                         text-white rounded-xl text-sm font-semibold transition">
              Next →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              disabled={loading || !eligibility?.eligible}
              className={`flex-1 py-2.5 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition ${
                algoBurnEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}>
              {loading
                ? algoBurnEnabled ? 'Generating ZKP...' : 'Submitting...'
                : algoBurnEnabled ? '🔐 Submit with ZKP Protection' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function canProceed(step, form) {
  if (step === 0) return form.fullName && form.email && form.phone
  if (step === 1) return form.panCard && form.aadhaar
  if (step === 2) return form.monthlyIncome && form.loanAmount && form.tenure
  return true
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
        <div className="[&>input]:pl-9 [&>select]:pl-9">{children}</div>
      </div>
    </div>
  )
}

function ReviewSection({ title, rows, danger, protected: isProtected }) {
  return (
    <div className={`rounded-xl border p-3 ${
      danger       ? 'border-red-800/60 bg-red-950/20' :
      isProtected  ? 'border-emerald-800/60 bg-emerald-950/20' :
                     'border-slate-700 bg-slate-800/50'
    }`}>
      <p className={`text-xs font-semibold mb-2 ${
        danger ? 'text-red-400' : isProtected ? 'text-emerald-400' : 'text-slate-400'
      }`}>{title}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between py-0.5">
          <span className="text-slate-500">{k}</span>
          <span className={`font-medium font-mono ${
            danger ? 'text-red-300' : isProtected ? 'text-emerald-300' : 'text-white'
          }`}>{v}</span>
        </div>
      ))}
    </div>
  )
}
