const express = require('express')
const { loanApplications } = require('../db')

const router = express.Router()

// ── POST /api/compliance/purge ────────────────────────────────────────────────
// Called by the AI Agent when it detects a burn_consent event on-chain.
// Finds the application by assetId and wipes all sensitive PII fields.
router.post('/purge', (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== (process.env.COMPLIANCE_API_KEY || 'algoburn-compliance-key')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { assetId } = req.body
  if (!assetId) return res.status(400).json({ message: 'assetId is required' })

  const app = loanApplications.find(a => a.assetId === assetId)
  if (!app) return res.status(404).json({ message: `No application found for assetId: ${assetId}` })

  // Wipe all sensitive fields
  app.panCard       = '[AI-PURGED]'
  app.aadhaar       = '[AI-PURGED]'
  app.fullName      = '[REDACTED]'
  app.email         = '[REDACTED]'
  app.phone         = '[REDACTED]'
  app.consentStatus = 'AI Purged'

  console.log(`[AlgoBurn Compliance] 🔥 AI Agent purged data for assetId: ${assetId} at ${new Date().toISOString()}`)

  res.json({
    status:    'success',
    message:   `Data purged for assetId: ${assetId}`,
    timestamp: new Date().toISOString(),
  })
})

// ── GET /api/compliance/status ────────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({
    service:         'AlgoBurn Compliance Engine',
    algoBurnEnabled: process.env.IS_ALGOBURN_ENABLED === 'true',
    totalApps:       loanApplications.length,
    purgedApps:      loanApplications.filter(a => a.consentStatus === 'AI Purged').length,
  })
})

module.exports = router
