import { useState } from 'react'

export default function LoginCard({ onLogin }) {
  const [email, setEmail] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim()) onLogin(email.trim())
  }

  return (
    <div className="animate-slide-up w-full max-w-md">
      {/* Logo / brand mark */}
      <div className="flex items-center justify-center mb-8 gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">🔥</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          AlgoBurn
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Secure Identity Verification
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Your data stays private. Powered by Zero-Knowledge Proofs on Algorand.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700
                       text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Login Securely
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-gray-400">
          No wallet required · Transactions signed server-side
        </p>
      </div>
    </div>
  )
}
