const router = require('express').Router()
const pool = require('../db/pool')
const { verifyToken, requireAdmin } = require('../middleware/auth')
const { purge } = require('./users')

// GET /api/admin/borrowers
router.get('/borrowers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rows: users } = await pool.query(
      "SELECT * FROM users WHERE role = 'ROLE_USER' ORDER BY id"
    )
    const { rows: loans } = await pool.query(
      'SELECT DISTINCT ON (user_id) * FROM loans ORDER BY user_id, id DESC'
    )
    const loanMap = Object.fromEntries(loans.map(l => [l.user_id, l]))

    const borrowers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      pan: u.pan,
      monthlyIncome: u.monthly_income,
      consentStatus: u.consent_status,
      purged: u.purged,
      loan: loanMap[u.id] ? {
        id: loanMap[u.id].id,
        amount: loanMap[u.id].amount,
        status: loanMap[u.id].status,
        nextPayment: loanMap[u.id].next_payment,
        creditScore: loanMap[u.id].credit_score,
      } : null,
    }))
    res.json(borrowers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/purge/:userId
router.post('/purge/:userId', verifyToken, requireAdmin, async (req, res) => {
  try {
    await purge(req.params.userId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/algoburn/webhook
// Called by AlgoBurn SDK after user confirms purge on their platform
router.post('/algoburn/webhook', async (req, res) => {
  const algoburnSecret = process.env.ALGOBURN_WEBHOOK_SECRET
  const signature = req.headers['x-algoburn-signature']

  // Verify the request is genuinely from AlgoBurn
  if (!algoburnSecret || signature !== algoburnSecret) {
    return res.status(401).json({ error: 'Invalid webhook signature.' })
  }

  const { userId, event } = req.body

  if (!userId || event !== 'purge.confirmed') {
    return res.status(400).json({ error: 'Invalid payload.' })
  }

  try {
    await purge(userId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/logs
router.get('/logs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM compliance_logs ORDER BY created_at DESC LIMIT 50')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
