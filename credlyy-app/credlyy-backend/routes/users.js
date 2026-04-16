const router = require('express').Router()
const pool = require('../db/pool')
const { verifyToken } = require('../middleware/auth')

// GET /api/users/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    const loan = (await pool.query('SELECT * FROM loans WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user.id])).rows[0]
    res.json(sanitize(user, loan))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/apply
router.post('/apply', verifyToken, async (req, res) => {
  const { fullName, pan, monthlyIncome, bankStatement, loanAmount } = req.body
  try {
    await pool.query(
      'UPDATE users SET name=$1, pan=$2, monthly_income=$3, bank_statement=$4 WHERE id=$5',
      [fullName, pan, monthlyIncome, bankStatement || 'uploaded_statement.pdf', req.user.id]
    )
    const creditScore = Math.floor(Math.random() * 150) + 620
    const { rows } = await pool.query(
      'INSERT INTO loans (user_id, amount, status, credit_score) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, loanAmount, 'Pending', creditScore]
    )
    const user = (await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])).rows[0]
    res.json(sanitize(user, rows[0]))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users/purge  (self-purge)
router.post('/purge', verifyToken, async (req, res) => {
  try {
    await purge(req.user.id)
    const user = (await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])).rows[0]
    const loan = (await pool.query('SELECT * FROM loans WHERE user_id=$1 ORDER BY id DESC LIMIT 1', [req.user.id])).rows[0]
    res.json(sanitize(user, loan))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

async function purge(userId) {
  await pool.query(
    'UPDATE users SET pan=NULL, monthly_income=NULL, bank_statement=NULL, consent_status=$1, purged=TRUE WHERE id=$2',
    ['REVOKED', userId]
  )
  const msg = `DPDP COMPLIANCE TRIGGER: User [${userId}] data wiped via AlgoBurn AI Agent.`
  await pool.query('INSERT INTO compliance_logs (user_id, message) VALUES ($1,$2)', [userId, msg])
  console.log(msg)
}

function sanitize(user, loan) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    pan: user.pan,
    monthlyIncome: user.monthly_income,
    bankStatement: user.bank_statement,
    consentStatus: user.consent_status,
    purged: user.purged,
    loan: loan ? {
      id: loan.id,
      amount: loan.amount,
      status: loan.status,
      nextPayment: loan.next_payment,
      creditScore: loan.credit_score,
    } : null,
  }
}

module.exports = router
module.exports.purge = purge
