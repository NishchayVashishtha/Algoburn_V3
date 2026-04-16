import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

const STEPS = ['Personal Info', 'Financial Details', 'Review & Submit']

export default function LoanApplication() {
  const { currentUser, submitLoanApplication } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: currentUser?.name || '',
    pan: '',
    monthlyIncome: '',
    loanAmount: '',
    bankStatement: null,
  })

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = () => {
    submitLoanApplication(currentUser.id, form)
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-lg mx-auto mt-24 text-center px-4">
        <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
        <p className="text-slate-400 mb-6">Your loan application is under review. We'll notify you within 2 business days.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Loan Application</h1>
        <p className="text-slate-400 text-sm mb-8">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

        {/* Step indicator */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          ))}
        </div>

        <div className="card space-y-5">
          {step === 0 && (
            <>
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="As per government ID" />
              </div>
              <div>
                <label className="label">PAN / SSN</label>
                <input className="input-field" value={form.pan} onChange={e => update('pan', e.target.value)} placeholder="ABCDE1234F" />
                <p className="text-xs text-slate-600 mt-1">Your data is encrypted and protected under DPDP Act.</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="label">Monthly Income (₹)</label>
                <input className="input-field" type="number" value={form.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} placeholder="e.g. 75000" />
              </div>
              <div>
                <label className="label">Loan Amount Requested (₹)</label>
                <input className="input-field" type="number" value={form.loanAmount} onChange={e => update('loanAmount', e.target.value)} placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="label">Bank Statement (PDF)</label>
                <div className="input-field cursor-pointer text-slate-500 flex items-center gap-2">
                  <input type="file" accept=".pdf" className="hidden" id="bankFile"
                    onChange={e => update('bankStatement', e.target.files[0]?.name)} />
                  <label htmlFor="bankFile" className="cursor-pointer w-full">
                    {form.bankStatement ? <span className="text-slate-300">{form.bankStatement}</span> : 'Click to upload statement'}
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              <h3 className="font-semibold text-slate-200 mb-2">Review your application</h3>
              {[
                ['Full Name', form.fullName],
                ['PAN / SSN', form.pan || '—'],
                ['Monthly Income', form.monthlyIncome ? `₹${Number(form.monthlyIncome).toLocaleString('en-IN')}` : '—'],
                ['Loan Amount', form.loanAmount ? `₹${Number(form.loanAmount).toLocaleString('en-IN')}` : '—'],
                ['Bank Statement', form.bankStatement || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 font-medium">{v}</span>
                </div>
              ))}
              <p className="text-xs text-slate-600 pt-2">By submitting, you consent to data processing under DPDP Act 2023. You may revoke consent anytime via Privacy Vault.</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => step === 0 ? navigate('/dashboard') : setStep(p => p - 1)} className="btn-secondary flex items-center gap-1">
              <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1
              ? <button onClick={() => setStep(p => p + 1)} className="btn-primary flex items-center gap-1">Next <ChevronRight size={16} /></button>
              : <button onClick={handleSubmit} className="btn-primary">Submit Application</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
