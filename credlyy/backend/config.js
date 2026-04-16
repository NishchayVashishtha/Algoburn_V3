// ─── Global Feature Flags ────────────────────────────────────────────────────
// Flip IS_ALGOBURN_ENABLED in .env to toggle between Phase 1 and Phase 2

const IS_ALGOBURN_ENABLED = process.env.IS_ALGOBURN_ENABLED === 'true'

module.exports = { IS_ALGOBURN_ENABLED }
