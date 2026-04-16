import { useApp } from '../context/AppContext'
import { Terminal } from 'lucide-react'

export default function ComplianceLog() {
  const { complianceLogs } = useApp()

  return (
    <div className="card mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal size={18} className="text-emerald-500" />
        <h3 className="font-semibold text-slate-200">AlgoBurn Compliance Log</h3>
        <span className="ml-auto text-xs text-slate-500">{complianceLogs.length} event(s)</span>
      </div>
      <div className="bg-navy-900 rounded-xl p-4 font-mono text-xs min-h-[80px] max-h-64 overflow-y-auto space-y-2">
        {complianceLogs.length === 0 ? (
          <p className="text-slate-600">// No purge events recorded yet.</p>
        ) : (
          complianceLogs.map(log => (
            <div key={log.id} className="flex gap-3">
              <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="text-emerald-400">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
