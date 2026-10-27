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