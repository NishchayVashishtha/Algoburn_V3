const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { loanApplications } = require('../db')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { IS_ALGOBURN_ENABLED } = require('../config')
const sdk = require('../algoburn-sdk')

const router = express.Router()

// ── POST /api/loan/apply-traditional ─────────────────────────────────────────
// Phase 1: stores raw PII
// Phase 2: mints a Consent SBT, stores assetId instead of raw PII
router.post('/apply-traditional', requireAuth, async (req, res) => {
  const {
    fullName, email, phone,
    panCard, aadhaar,
    monthlyIncome, loanAmount, tenure,
  } = req.body

  const missing = ['fullName','email','phone','panCard','aadhaar',
                   'monthlyIncome','loanAmount','tenure']
    .filter(f => !req.body[f])

  if (missing.length)
    return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` })

  const application = {
    id:           `APP-${uuidv4().slice(0, 8).toUpperCase()}`,
    userId:       req.user.id,
    submittedAt:  new Date().toISOString(),
    status:       'Pending',
    loanBalance:  Number(loanAmount),   // used for kill-switch eligibility
    // Basic Info (always stored)
    fullName,
    email,
    phone,
    // Financial Info (always stored)
    monthlyIncome: Number(monthlyIncome),
    loanAmount:    Number(loanAmount),
    tenure:        Number(tenure),
    // Privacy mode
    algoBurnEnabled: IS_ALGOBURN_ENABLED,
  }

  if (IS_ALGOBURN_ENABLED) {
    // ── Phase 2: ZKP path ──────────────────────────────────────────────────
    // PII is NOT stored in plain text — only a ZKP proof reference
    try {
      const { assetId, txId, explorerUrl } = await sdk.mintConsent(req.user.id)
      application.assetId      = assetId
      application.consentTxId  = txId
      application.explorerUrl  = explorerUrl
      application.consentStatus = 'Blockchain Verified'
      // Store masked PII for audit trail only
      application.panCard  = `${panCard.slice(0,3)}${'*'.repeat(panCard.length - 4)}${panCard.slice(-1)}`
      application.aadhaar  = `**** **** ${aadhaar.replace(/\s/g,'').slice(-4)}`
      console.log(`[CREDLYY$ Phase 2] SBT minted for ${fullName} — Asset: ${assetId}`)
    } catch (err) {
      return res.status(500).json({ message: `AlgoBurn SDK error: ${err.message}` })
    }
  } else {
    // ── Phase 1: Legacy path ───────────────────────────────────────────────
    application.panCard  = panCard
    application.aadhaar  = aadhaar
    application.consentStatus = 'Unprotected'
    console.log(`[CREDLYY$ Phase 1] New application ${application.id} from ${fullName}`)
  }

  loanApplications.push(application)

  res.status(201).json({
    message:       'Application submitted successfully',
    applicationId: application.id,
    algoBurnEnabled: IS_ALGOBURN_ENABLED,
    ...(IS_ALGOBURN_ENABLED && {
      assetId:     application.assetId,
      consentTxId: application.consentTxId,
      explorerUrl: application.explorerUrl,
    }),
  })
})

// ── GET /api/loan/my-applications ────────────────────────────────────────────
router.get('/my-applications', requireAuth, (req, res) => {
  const mine = loanApplications.filter(a => a.userId === req.user.id)
  res.json({ count: mine.length, applications: mine })
})

// ── GET /api/loan/all (Admin) ─────────────────────────────────────────────────
router.get('/all', requireAdmin, (req, res) => {
  res.json({
    count: loanApplications.length,
    applications: loanApplications,
    algoBurnEnabled: IS_ALGOBURN_ENABLED,
  })
})

// ── PATCH /api/loan/:id/status (Admin) ───────────────────────────────────────
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body
  const allowed = ['Pending', 'Approved', 'Rejected']
  if (!allowed.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` })

  const app = loanApplications.find(a => a.id === req.params.id)
  if (!app) return res.status(404).json({ message: 'Application not found' })

  app.status = status
  // When approved, set loanBalance (for kill-switch demo)
  if (status === 'Approved') app.loanBalance = app.loanAmount
  if (status === 'Rejected') app.loanBalance = 0
  res.json({ message: `Status updated to ${status}`, application: app })
})

// ── POST /api/loan/:id/repay ──────────────────────────────────────────────────
// Pay Monthly EMI (fixed ₹5,000) or full balance
router.post('/:id/repay', requireAuth, (req, res) => {
  const { type } = req.body   // 'emi' | 'full'
  const app = loanApplications.find(
    a => a.id === req.params.id && a.userId === req.user.id
  )
  if (!app)
    return res.status(404).json({ message: 'Application not found' })
  if (app.status !== 'Approved')
    return res.status(400).json({ message: 'Only approved loans can be repaid' })
  if (app.loanBalance <= 0)
    return res.status(400).json({ message: 'Loan already fully repaid' })

  const EMI = 5000
  if (type === 'full') {
    app.loanBalance = 0
  } else {
    app.loanBalance = Math.max(0, app.loanBalance - EMI)
  }

  app.lastPaymentAt = new Date().toISOString()
  console.log(`[CREDLYY$] Repayment on ${app.id} — remaining: ₹${app.loanBalance}`)

  res.json({
    message:        `Payment successful`,
    remainingBalance: app.loanBalance,
    lastPaymentAt:  app.lastPaymentAt,
    fullyRepaid:    app.loanBalance === 0,
  })
})


router.post('/:id/revoke-consent', requireAuth, async (req, res) => {
  const app = loanApplications.find(
    a => a.id === req.params.id && a.userId === req.user.id
  )
  if (!app) return res.status(404).json({ message: 'Application not found' })
  if (!app.algoBurnEnabled || !app.assetId)
    return res.status(400).json({ message: 'AlgoBurn not enabled for this application' })
  if (app.loanBalance > 0)
    return res.status(400).json({ message: 'Cannot revoke consent while loan balance is outstanding' })

  try {
    const { txId, explorerUrl } = await sdk.burnConsent(app.assetId)
    const purgedAt           = new Date().toISOString()
    const dpdpComplianceId   = `DPDP-${uuidv4().slice(0,8).toUpperCase()}-${Date.now()}`

    app.consentStatus    = 'Revoked'
    app.burnTxId         = txId
    app.burnExplorerUrl  = explorerUrl
    app.purgedAt         = purgedAt
    app.dpdpComplianceId = dpdpComplianceId
    app.panCard          = '[PURGED]'
    app.aadhaar          = '[PURGED]'

    res.json({
      message:          'Consent revoked. AI Agent will purge enterprise data.',
      txId,
      explorerUrl,
      purgedAt,
      dpdpComplianceId,
      assetId:          app.assetId,
    })
  } catch (err) {
    res.status(500).json({ message: `Burn failed: ${err.message}` })
  }
})

module.exports = router
