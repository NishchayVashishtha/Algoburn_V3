import { ShieldCheck, Download, ExternalLink } from 'lucide-react'

export default function ErasureCertificate({ data, onClose }) {
  const { txId, explorerUrl, purgedAt, dpdpComplianceId, assetId } = data

  function downloadReceipt() {
    const content = [
      '╔══════════════════════════════════════════════════════════╗',
      '║         CERTIFICATE OF DATA ERASURE — CREDLYY$           ║',
      '║              Powered by AlgoBurn Protocol                 ║',
      '╚══════════════════════════════════════════════════════════╝',
      '',
      `DPDP Compliance ID : ${dpdpComplianceId}`,
      `Timestamp          : ${new Date(purgedAt).toLocaleString()}`,
      `Algorand Burn TxID : ${txId}`,
      `Consent SBT Asset  : ${assetId}`,
      `Explorer Proof     : ${explorerUrl}`,
      '',
      '─────────────────────────────────────────────────────────────',
      'This certificate confirms that all Personally Identifiable',
      'Information (PII) associated with the above Consent SBT has',
      'been permanently purged from all enterprise systems in',
      'compliance with the Digital Personal Data Protection (DPDP)',
      'Act, 2023.',
      '',
      'The cryptographic proof of destruction is recorded immutably',
      'on the Algorand blockchain and cannot be altered or deleted.',
      '─────────────────────────────────────────────────────────────',
      `Generated: ${new Date().toISOString()}`,
      'CREDLYY$ | AlgoBurn Privacy Protocol | Algorand TestNet',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `DPDP-Erasure-Certificate-${dpdpComplianceId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-700/60 rounded-2xl shadow-2xl shadow-emerald-900/30 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-emerald-800/50 px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600/20 border-2 border-emerald-500 mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Certificate of Data Erasure</h2>
          <p className="text-emerald-400 text-xs mt-1 font-semibold uppercase tracking-wider">
            DPDP Act 2023 Compliant
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">

          <Row label="DPDP Compliance ID" value={dpdpComplianceId} mono highlight />
          <Row label="Timestamp" value={new Date(purgedAt).toLocaleString()} />
          <Row label="Algorand Burn TxID" value={txId} mono />
          <Row label="Consent SBT Asset ID" value={String(assetId)} mono />

          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Blockchain Proof</span>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              <ExternalLink className="w-3.5 h-3.5" /> View on Pera Explorer
            </a>
          </div>

          {/* Legal notice */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              This certificate confirms that all Personally Identifiable Information (PII)
              associated with the above Consent SBT has been permanently purged from all
              enterprise systems. The cryptographic proof is recorded immutably on the
              Algorand blockchain and cannot be altered or deleted.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-700
                             text-emerald-400 text-sm font-bold px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              DATA PURGED / CONSENT REVOKED
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={downloadReceipt}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700
                       text-white font-semibold py-2.5 rounded-xl transition text-sm">
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <button onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold
                       py-2.5 rounded-xl transition text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono, highlight }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-700/50 gap-4">
      <span className="text-xs text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-xs text-right break-all ${
        mono      ? 'font-mono' : ''} ${
        highlight ? 'text-emerald-400 font-bold' : 'text-slate-200'
      }`}>{value}</span>
    </div>
  )
}
