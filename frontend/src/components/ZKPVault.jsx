import { useState } from 'react'
import { mintConsent } from '../algorandService'

const STEPS = [
  'Encrypting local data...',
  'Generating Zero-Knowledge Proof...',
  'Minting Consent NFT on Algorand...',
]

export default function ZKPVault({ email, onSuccess, onError }) {
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(-1)

  async function handleConsent() {
    setLoading(true)

    // Simulate multi-step progress (1.5 s each)
    for (let i = 0; i < STEPS.length; i++) {
      setStepIndex(i)
      await new Promise((r) => setTimeout(r, 1500))
    }

    try {
      const txId = await mintConsent()
      onSuccess(txId)
    } catch (err) {
      console.error(err)
      onError(err.message || 'Transaction failed. Check your .env configuration.')
      setLoading(false)
      setStepIndex(-1)
    }
  }

  return (
    <div className="animate-slide-up w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🔥</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">AlgoBurn</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Welcome */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {email[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-medium text-gray-900">{email}</span>
          </span>
        </div>

        {/* Request card */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-800 mb-1">
            🏦 FinTech-X is requesting access
          </p>
          <p className="text-sm text-indigo-700">
            Verification of your <strong>age</strong> and <strong>income</strong>.
            Protect your raw data using Zero-Knowledge Proofs (ZKP) — only a
            cryptographic proof is shared, never your actual data.
          </p>
        </div>

        {/* ZKP attributes */}
        <div className="space-y-2 mb-6">
          {['Age ≥ 18', 'Annual income ≥ $30,000'].map((attr) => (
            <div
              key={attr}
              className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-green-500">✓</span>
              <span>{attr}</span>
              <span className="ml-auto text-xs text-gray-400">ZKP-protected</span>
            </div>
          ))}
        </div>

        {/* Loading steps */}
        {loading && (
          <div className="mb-5 space-y-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-sm">
                {i < stepIndex ? (
                  <span className="text-green-500">✓</span>
                ) : i === stepIndex ? (
                  <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-gray-300" />
                )}
                <span className={i <= stepIndex ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleConsent}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                     disabled:opacity-60 disabled:cursor-not-allowed
                     text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {loading ? 'Processing...' : 'Generate Proof & Grant Consent'}
        </button>
      </div>
    </div>
  )
}
