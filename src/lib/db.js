/*
 * Temporary local "database" for development.
 *
 * - Student names come from the hardcoded list in students.js (the fake registrar).
 * - Registered accounts (ID + PIN) are saved in localStorage when PERSIST = true,
 *   so they survive page refreshes. Set PERSIST = false to keep them in memory only.
 *
 * DEMO ONLY: PINs are stored in plain text here. In the real app, the server must store a
 * salted hash (bcrypt/argon2) and do all verification and lockout checks.
 *
 * Every function is a thin wrapper, so later you can replace the bodies with fetch() calls
 * to your real API without touching the screens.
 */
import { DEFAULT_WALLET_BALANCE } from './config.js'
import { STUDENTS } from './students.js'

const PERSIST = true
const STORAGE_KEY = 'abc-kiosk-db'

// { '7230494': { id, name, course }, ... }
const REGISTRAR = Object.fromEntries(STUDENTS.map((s) => [s.id, s]))

function load() {
  if (!PERSIST) return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function save() {
  if (!PERSIST) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    /* storage unavailable: ignore */
  }
}

const ORDERS_KEY = 'abc-kiosk-orders'
function loadOrders() {
  if (!PERSIST) return []
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []
  } catch {
    return []
  }
}
let orders = loadOrders() // [{ number, studentId, lines: [{ id, name, price, qty }], total, readyMinutes, placedAt }]

/* Campus ID Wallet balances: { [studentId]: pesos }. Students without a record start at DEFAULT_WALLET_BALANCE. */
const WALLET_KEY = 'abc-kiosk-wallet'
function loadWallets() {
  if (!PERSIST) return {}
  try {
    return JSON.parse(localStorage.getItem(WALLET_KEY)) || {}
  } catch {
    return {}
  }
}
let wallets = loadWallets()
function saveWallets() {
  if (!PERSIST) return
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallets))
  } catch {
    /* storage unavailable: ignore */
  }
}

let accounts = load() // { [studentId]: { pin } }  (names are always read from the registrar)

export const db = {
  /** Full name from the registrar, or null if the ID doesn't exist. */
  lookupRegistrar: (id) => REGISTRAR[id]?.name ?? null,

  /** Full registrar record { id, name, course }, or null. */
  getStudent: (id) => REGISTRAR[id] ?? null,

  isRegistered: (id) => id in accounts,

  /** -> { ok: true, name } | { ok: false, reason: 'not-found' | 'already-registered' } */
  register(id, pin) {
    const student = REGISTRAR[id]
    if (!student) return { ok: false, reason: 'not-found' }
    if (accounts[id]) return { ok: false, reason: 'already-registered' }
    accounts[id] = { pin }
    save()
    return { ok: true, name: student.name }
  },

  /** -> { ok: true, name } | { ok: false, reason: 'not-registered' | 'wrong-pin' } */
  verifyLogin(id, pin) {
    const account = accounts[id]
    const student = REGISTRAR[id]
    if (!account || !student) return { ok: false, reason: 'not-registered' }
    if (account.pin !== pin) return { ok: false, reason: 'wrong-pin' }
    return { ok: true, name: student.name }
  },

  /** Current Campus ID Wallet balance in pesos. */
  getWalletBalance: (studentId) => wallets[studentId] ?? DEFAULT_WALLET_BALANCE,

  /**
   * Deducts from the wallet. -> { ok: true, balance } | { ok: false, reason: 'insufficient', balance }
   * DEMO ONLY: the real server must do this atomically and verify the RFID tap / PIN.
   */
  chargeWallet(studentId, amount) {
    const balance = db.getWalletBalance(studentId)
    if (amount > balance) return { ok: false, reason: 'insufficient', balance }
    wallets = { ...wallets, [studentId]: balance - amount }
    saveWallets()
    return { ok: true, balance: balance - amount }
  },

  /** Demo helper (cashier top-up). Returns the new balance. */
  topUpWallet(studentId, amount) {
    wallets = { ...wallets, [studentId]: db.getWalletBalance(studentId) + amount }
    saveWallets()
    return wallets[studentId]
  },

  /**
   * Saves a new order and returns it. Numbers run ABC-001, ABC-002, ...
   * `extra` carries { subtotal, ecoFee, serviceFee, serviceType, paymentMethod, paymentStatus, authCode, balanceAfter }.
   * DEMO ONLY: the real server must recompute prices itself and take payment (Wallet / GCash QR Ph / cash).
   */
  placeOrder(studentId, lines, total, readyMinutes, extra = {}) {
    const number = `ABC-${String(1 + orders.length).padStart(3, '0')}`
    const order = {
      number,
      studentId,
      lines: lines.map(({ item, qty }) => ({ id: item.id, name: item.name, price: item.price, qty })),
      total,
      readyMinutes,
      ...extra,
      placedAt: new Date().toISOString(),
    }
    orders = [...orders, order]
    if (PERSIST) {
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
      } catch {
        /* storage unavailable: ignore */
      }
    }
    return order
  },

  orderHistory: (studentId) => orders.filter((o) => o.studentId === studentId),
}