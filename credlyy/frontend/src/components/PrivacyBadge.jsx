import { ShieldCheck, ShieldAlert } from 'lucide-react'

export default function PrivacyBadge({ enabled }) {
  if (enabled) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold
                       bg-emerald-950/70 text-emerald-400 border border-emerald-700
                       px-3 py-1 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        Privacy Status: PROTECTED (Algorand SBT Enabled)
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold
                     bg-red-950/70 text-red-400 border border-red-700
                     px-3 py-1 rounded-full animate-pulse">
      <ShieldAlert className="w-3.5 h-3.5" />
      Privacy Status: UNSECURED (Web2 Standard)
    </span>
  )
}
