// ─── API Service ─────────────────────────────────────────────────────────────
const BASE = 'http://localhost:4000'

function getToken() { return localStorage.getItem('credlyy_token') }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
}

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login  = (email, password) =>
  fetch(`${BASE}/api/auth/login`,  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handleResponse)

export const signup = (name, email, password) =>
  fetch(`${BASE}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) }).then(handleResponse)

// ── Config ────────────────────────────────────────────────────────────────────
export const fetchConfig = () =>
  fetch(`${BASE}/api/config`).then(handleResponse)

// ── Loan ──────────────────────────────────────────────────────────────────────
export const applyLoan = (data) =>
  fetch(`${BASE}/api/loan/apply-traditional`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handleResponse)

export const myApplications = () =>
  fetch(`${BASE}/api/loan/my-applications`, { headers: authHeaders() }).then(handleResponse)

export const revokeConsent = (appId) =>
  fetch(`${BASE}/api/loan/${appId}/revoke-consent`, { method: 'POST', headers: authHeaders() }).then(handleResponse)

export const repayLoan = (appId, type) =>
  fetch(`${BASE}/api/loan/${appId}/repay`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type }) }).then(handleResponse)

// ── Admin ─────────────────────────────────────────────────────────────────────
export const allApplications = () =>
  fetch(`${BASE}/api/loan/all`, { headers: authHeaders() }).then(handleResponse)

export const updateStatus = (id, status) =>
  fetch(`${BASE}/api/loan/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleResponse)

export const allUsers = () =>
  fetch(`${BASE}/api/users`, { headers: authHeaders() }).then(handleResponse)
