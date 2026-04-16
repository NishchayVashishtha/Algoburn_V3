import { useState } from 'react'
import { claimConsent, burnConsent } from '../algorandService'

export default function DPDPDashboard({ email, mintTxId, assetId, userId, onError }) {
  const [loading,   setLoading]   = useState(false)
  const [step,      setStep]      = useState('')   // current loading label
  const [revoked,   setRevoked]   = useState(false)
  const [burnTxId,  setBurnTxId]  = useState(null)

  async function handleRevoke() {
    setLoading(true)
    try {
      // Step 1: opt-in + claim NFT from app to relayer
      setStep('Claiming NFT to relayer wallet...')
      await claimConsent(assetId)

      // Step 2: burn NFT on-chain → emits ConsentRevoked → AI agent purges DB
      setStep('Burning NFT & revoking consent...')
      const txId = await burnConsent(assetId)

      setBurnTxId(txId)
      setRevoked(true)
    } catch (err) {
      console.error(err)
      onError(err.message || 'Revocation failed. Please try again.')
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const explorerUrl = (txId) => `https://testnet.explorer.perawallet.app/tx/${txId}`

  return (
    <div className="animate-slide-up w-full max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🔥</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">AlgoBurn</span>
        <span className="ml-auto text-xs text-gray-500">{email}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">

        {/* Consent status banner */}
        <div className={`rounded-xl border p-4 transition-colors ${
          revoked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm font-semibold ${revoked ? 'text-red-700' : 'text-green-700'}`}>
            {revoked
              ? '🚫 Consent Revoked. Enterprise Data Purged.'
              : '✅ Medical Data Consent: ACTIVE (Backed by Algorand ZKP)'}
          </p>
          <p className={`text-xs mt-1 ${revoked ? 'text-red-500' : 'text-green-600'}`}>
            {revoked
              ? 'Your data has been cryptographically purged from all enterprise systems.'
              : 'FinTech-X has verified your age and income via ZKP. No raw data was shared.'}
          </p>
        </div>

        {/* Mint tx + asset info */}
        {mintTxId && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1">
            <p className="text-xs text-gray-500">Consent NFT minted</p>
            <a href={explorerUrl(mintTxId)} target="_blank" rel="noopener noreferrer"
               className="text-xs text-indigo-600 hover:text-indigo-800 font-mono break-all underline block">
              🔗 {mintTxId}
            </a>
            {assetId && (
              <p className="text-xs text-gray-400">Asset ID: <span className="font-mono">{assetId}</span></p>
            )}
          </div>
        )}

        {/* Revoke button */}
        {!revoked && (
          <button
            onClick={handleRevoke}
            disabled={loading || !assetId}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700
                       disabled:opacity-60 disabled:cursor-not-allowed
                       text-white text-base font-bold transition-colors shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {step || 'Executing Smart Contract...'}
              </span>
            ) : (
              '🚨 Revoke Consent & Purge Data'
            )}
          </button>
        )}

        {/* Post-revoke success panel */}
        {revoked && burnTxId && (
          <div className="animate-fade-in rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700">Revocation confirmed on-chain</p>

            <a href={explorerUrl(burnTxId)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800
                          font-medium underline underline-offset-2">
              🔗 Verify Mathematical Proof on Algorand
            </a>
            <p className="text-xs text-gray-400 font-mono break-all">{burnTxId}</p>

            {/* Agent notification */}
            <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50
                            border border-indigo-200 rounded-lg px-3 py-2">
              <span className="mt-0.5">🤖</span>
              <span>
                AI Agent has detected the <code className="font-mono">ConsentRevoked</code> event
                on-chain and is purging{' '}
                <span className="font-semibold">{userId ?? 'your record'}</span> from the
                enterprise database. Check the Admin Dashboard to confirm.
              </span>
            </div>
          </div>
        )}

        {/* Data rights footer */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: '🔐', label: 'ZKP Protected' },
            { icon: '⛓️', label: 'On-Chain Proof' },
            { icon: '🗑️', label: 'Right to Purge' },
          ].map(({ icon, label }) => (
            <div key={label}
                 className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 border border-gray-100 py-3">
              <span className="text-xl">{icon}</span>
              <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
