/*
 * Tiny client for the ABC Kiosk API.
 *
 * - Base URL comes from VITE_API_URL (see .env.development), default http://localhost:5080
 * - The login token lives in memory only (never localStorage): a page refresh or Log Out clears it.
 * - Failed calls throw ApiError { status, code, body }.
 *     status 0 = the server could not be reached.
 *     code    = the API's "error" field, e.g. 'wrong-pin', 'locked', 'not-registered', 'already-registered'.
 */
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'

let token = null
let onUnauthorized = null

export const setToken = (t) => { token = t }
export const getToken = () => token

/** A fresh random key for Idempotency-Key (the server returns the SAME order if a request with this key is repeated). */
export const newKey = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
/** Called when a logged-in request gets 401 (token expired). App uses it to log the student out. */
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`)
    this.status = status
    this.code = body?.error ?? null
    this.body = body
  }
}

// opts.token: use this token instead of the current one (needed when the student has just been logged out)
// opts.headers: extra headers, e.g. Idempotency-Key
async function request(method, path, body, opts = {}) {
  const auth = opts.token ?? token
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...(opts.headers ?? {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, { error: 'network' })
  }
  const data = await res.json().catch(() => null)
  if (res.status === 401 && auth) onUnauthorized?.() // logged in, but the token was rejected/expired
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, opts) => request('POST', path, body ?? {}, opts),

  /* Auth */
  lookupRegistrar: (id) => request('GET', `/api/auth/registrar/${id}`), // { id, name, course, registered } or 404
  register: (studentId, pin) => request('POST', '/api/auth/register', { studentId, pin }),
  login: (studentId, pin) => request('POST', '/api/auth/login', { studentId, pin }),
  me: () => request('GET', '/api/me'),

  /* Orders & wallet */
  placeOrder: (lines, serviceType, paymentMethod, key) =>
    request('POST', '/api/orders',
      { lines: lines.map((l) => ({ itemId: l.item.id, qty: l.qty })), serviceType, paymentMethod },
      { headers: { 'Idempotency-Key': key } }),
  confirmPayment: (orderNumber) => request('POST', `/api/orders/${orderNumber}/simulate-payment`, {}), // dev/simulation only
  topUp: (amount, method, note, opts) => request('POST', '/api/wallet/topups', { amount, method, note }, opts), // dev/simulation only
  redeem: (rewardId) => request('POST', `/api/rewards/${rewardId}/redeem`, {}),
  transactions: (take = 100) => request('GET', `/api/wallet/transactions?take=${take}`),
}
