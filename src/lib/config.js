export const ID_LENGTH = 7 // CTU student ID, e.g. 7230494 (digits only)
export const PIN_LENGTH = 6
export const MAX_ATTEMPTS = 5
export const AUTO_LOCK_SECONDS = 60 // idle time (no touch) before the "Are you still ordering?" warning appears
export const IDLE_WARNING_SECONDS = 15 // how long the warning shows before the kiosk logs out and clears the cart
export const DEFAULT_WALLET_BALANCE = 850 // demo starting Campus ID Wallet balance (pesos) for every student
export const CASH_HOLD_MINUTES = 10 // unpaid "Pay Cash" orders are held this long at the Express Counter
export const SERVICE_TYPES = {
  'dine-in': 'Dine In',
  'take-out': 'Take Out',
}
/* ---------- Wallet, rewards & payment hardware (new designs) ---------- */
export const DEFAULT_POINTS = 1250 // demo starting Meal Points for every student
export const POINTS_PER_PESO = 1 // meal points earned per peso on every paid order
export const TIERS = [
  { id: 'silver', label: 'Silver', min: 0, level: 1 },
  { id: 'gold', label: 'Gold', min: 1000, level: 3 },
  { id: 'platinum', label: 'Platinum', min: 2000, level: 5 },
]
export const TOPUP_AMOUNTS = [100, 200, 500, 1000] // quick-pick buttons on the Top Up screen
export const TOPUP_DEFAULT = 500
export const TOPUP_MIN = 20
export const TOPUP_MAX = 5000
export const QR_EXPIRY_SECONDS = 300 // QR Ph code lifetime (04:58 -> 00:00)
export const ACCEPTED_BILLS = [20, 50, 100, 500, 1000]
export const ACCEPTED_COINS = [1, 5, 10, 20]
export const SEMESTER_LABEL = 'Semester 1'
export const TRANSACTIONS_PAGE_SIZE = 5
export const TERMINAL_ID = 'Express-04'

/*
 * DEMO SWITCHES. Set both to false on the real kiosk.
 * SIMULATE_PAYMENTS: a QR payment is "received" automatically after SIMULATED_QR_SECONDS.
 *   In production the server confirms it (webhook / polling the payment provider).
 * SIMULATE_HARDWARE: shows on-screen bill/coin buttons that fake the cash validator.
 *   In production, feed real events from the bill acceptor / coin hopper into lib/cashAcceptor.js.
 */
export const SIMULATE_PAYMENTS = true
export const SIMULATED_QR_SECONDS = 8
export const SIMULATE_HARDWARE = true
