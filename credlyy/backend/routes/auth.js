const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { users } = require('../db')
const { generateToken } = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' })

  const user = users.find(u => u.email === email && u.password === password)
  if (!user)
    return res.status(401).json({ message: 'Invalid credentials' })

  const token = generateToken(user)
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password required' })

  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'Email already registered' })

  const newUser = {
    id: `u_${uuidv4().slice(0, 6)}`,
    name,
    email,
    password,   // plain text — Phase 1 intentional
    role: 'USER',
  }
  users.push(newUser)

  const token = generateToken(newUser)
  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  })
})

module.exports = router
