require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const { IS_ALGOBURN_ENABLED } = require('./config')

const authRoutes       = require('./routes/auth')
const userRoutes       = require('./routes/users')
const loanRoutes       = require('./routes/loan')
const complianceRoutes = require('./routes/compliance')

const app  = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/users',      userRoutes)
app.use('/api/loan',       loanRoutes)
app.use('/api/compliance', complianceRoutes)

// ─── Config endpoint (frontend reads this to sync the toggle) ────────────────
app.get('/api/config', (_, res) => {
  res.json({ IS_ALGOBURN_ENABLED })
})

app.get('/health', (_, res) => res.json({ status: 'ok', IS_ALGOBURN_ENABLED }))

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const phase = IS_ALGOBURN_ENABLED ? '🟢 Phase 2 — AlgoBurn ENABLED' : '🔴 Phase 1 — Legacy Mode'
  console.log(`\n💳 CREDLYY$ Backend running on http://localhost:${PORT}`)
  console.log(`🔒 Privacy Mode : ${phase}`)
  console.log(`\n📋 Routes:`)
  console.log(`   POST  /api/auth/login|signup`)
  console.log(`   POST  /api/loan/apply-traditional`)
  console.log(`   POST  /api/loan/:id/revoke-consent`)
  console.log(`   GET   /api/loan/all (Admin)`)
  console.log(`   PATCH /api/loan/:id/status (Admin)`)
  console.log(`   POST  /api/compliance/purge (AI Agent)`)
  console.log(`   GET   /api/config`)
  console.log(`\n🔑 Demo: admin@credlyy.com/admin123 · rahul@test.com/user123\n`)
})
