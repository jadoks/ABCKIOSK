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
import { DEFAULT_POINTS, DEFAULT_WALLET_BALANCE, POINTS_PER_PESO } from './config.js'
import { REWARDS } from './rewards.js'
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

/* Meal Points: { [studentId]: points }. Students without a record start at DEFAULT_POINTS. */
const POINTS_KEY = 'abc-kiosk-points'
/* Wallet statement: [{ id, studentId, kind: 'topup' | 'order' | 'reward', method, amount (pesos, +/-), points (+/-), title, place, ref, at }] */
const LEDGER_KEY = 'abc-kiosk-ledger'
function loadJson(key, fallback) {
  if (!PERSIST) return fallback
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
function saveJson(key, value) {
  if (!PERSIST) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: ignore */
  }
}
let points = loadJson(POINTS_KEY, {})
let ledger = loadJson(LEDGER_KEY, [])

function addLedger(entry) {
  const row = { id: `L${Date.now()}${ledger.length}`, at: new Date().toISOString(), ...entry }
  ledger = [row, ...ledger]
  saveJson(LEDGER_KEY, ledger)
  return row
}
const randomRef = (prefix) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`

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

  /**
   * Adds money to the wallet and records it in the statement. Returns the new balance.
   * `info` = { kind: 'topup', method: 'gcash' | 'cash', note?, ref? }
   * DEMO ONLY: the real server credits the wallet only after the payment provider / cash validator confirms.
   */
  creditWallet(studentId, amount, info = {}) {
    const { method = 'cash', note, ref } = info
    wallets = { ...wallets, [studentId]: db.getWalletBalance(studentId) + amount }
    saveWallets()
    addLedger({
      studentId, kind: 'topup', method, amount,
      title: method === 'gcash' ? 'Wallet Top Up - GCash' : 'Wallet Top Up - Cash Kiosk',
      place: note ?? (method === 'gcash' ? null : 'Terminal Cash Depository #02'),
      ref: ref ?? (method === 'gcash' ? randomRef('#GC') : null),
    })
    return wallets[studentId]
  },

  /** Kept for older callers: plain top-up without a statement note. */
  topUpWallet: (studentId, amount) => db.creditWallet(studentId, amount, { method: 'cash' }),

  /** Current Meal Points. */
  getPoints: (studentId) => points[studentId] ?? DEFAULT_POINTS,

  /**
   * Spends points on a perk. -> { ok: true, points, code, reward } | { ok: false, reason: 'unknown' | 'insufficient', points }
   * DEMO ONLY: the real server validates and issues the voucher code.
   */
  redeemReward(studentId, rewardId) {
    const reward = REWARDS.find((r) => r.id === rewardId)
    const have = db.getPoints(studentId)
    if (!reward) return { ok: false, reason: 'unknown', points: have }
    if (reward.cost > have) return { ok: false, reason: 'insufficient', points: have }
    points = { ...points, [studentId]: have - reward.cost }
    saveJson(POINTS_KEY, points)
    const code = randomRef('RW')
    addLedger({ studentId, kind: 'reward', method: 'points', amount: 0, points: -reward.cost, title: `Reward Redeemed: ${reward.title}`, place: 'Show this code at the counter', ref: code })
    return { ok: true, points: have - reward.cost, code, reward }
  },

  /** Wallet statement for one student, newest first. */
  transactions: (studentId) => ledger.filter((t) => t.studentId === studentId),

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
    if (extra.paymentStatus === 'paid') {
      const earned = Math.floor(total * POINTS_PER_PESO)
      points = { ...points, [studentId]: db.getPoints(studentId) + earned }
      saveJson(POINTS_KEY, points)
      order.pointsEarned = earned
    }
    if (extra.paymentMethod === 'wallet') {
      const names = lines.slice(0, 2).map(({ item }) => item.name.split(/\s+/).slice(0, 2).join(' '))
      addLedger({
        studentId, kind: 'order', method: 'wallet', amount: -total, points: order.pointsEarned ?? 0,
        title: `Pre-Order: ${names.join(' & ')}${lines.length > 2 ? ` +${lines.length - 2} more` : ''}`,
        place: `${number} • ${extra.serviceType === 'take-out' ? 'Kiosk Pickup' : 'Dine In'}`,
        ref: number,
      })
    }
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