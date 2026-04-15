const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials.' })

    const loan = (await pool.query('SELECT * FROM loans WHERE user_id = $1 ORDER BY id DESC LIMIT 1', [user.id])).rows[0]
    res.json({ token: signToken(user), user: sanitize(user, loan) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered.' })

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, hash, 'ROLE_USER']
    )
    const user = rows[0]
    res.status(201).json({ token: signToken(user), user: sanitize(user, null) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
