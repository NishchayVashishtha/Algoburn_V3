import { useEffect } from 'react'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="animate-slide-up fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                 flex items-start gap-3 bg-red-600 text-white text-sm font-medium
                 px-5 py-3.5 rounded-xl shadow-2xl max-w-sm w-full"
    >
      <span className="text-base">⚠️</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white text-lg leading-none ml-2"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
