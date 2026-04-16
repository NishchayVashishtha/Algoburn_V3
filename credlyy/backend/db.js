// ─── In-Memory Mock Database ─────────────────────────────────────────────────
// Phase 1: Plain-text storage — intentionally no encryption (demo of Web2 risk)

const users = [
  {
    id: 'u_001',
    name: 'Admin User',
    email: 'admin@credlyy.com',
    password: 'admin123',   // plain text — intentional for Phase 1 demo
    role: 'ADMIN',
  },
  {
    id: 'u_002',
    name: 'Rahul Sharma',
    email: 'rahul@test.com',
    password: 'user123',
    role: 'USER',
  },
]

const loanApplications = []

module.exports = { users, loanApplications }
