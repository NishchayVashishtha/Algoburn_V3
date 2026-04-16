const { users } = require('../db')

// Simple session token: base64(userId:role) — no JWT for Phase 1 simplicity
function generateToken(user) {
  return Buffer.from(`${user.id}:${user.role}`).toString('base64')
}

function parseToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [id, role] = decoded.split(':')
    return { id, role }
  } catch {
    return null
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.replace('Bearer ', '')
  const parsed = parseToken(token)
  if (!parsed) return res.status(401).json({ message: 'Invalid token' })

  const user = users.find(u => u.id === parsed.id && u.role === parsed.role)
  if (!user) return res.status(401).json({ message: 'User not found' })

  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  })
}

module.exports = { generateToken, requireAuth, requireAdmin }
