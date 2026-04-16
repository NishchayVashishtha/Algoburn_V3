const express = require('express')
const { users } = require('../db')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/users — Admin only: list all users
router.get('/', requireAdmin, (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u)
  res.json({ count: safeUsers.length, users: safeUsers })
})

module.exports = router
