/*
 * Cash validator bridge (bill acceptor + coin hopper).
 *
 * The screens only call `onCash(amount)` with whatever the hardware reports.
 * - Demo: `SIMULATE_HARDWARE` in config.js shows on-screen buttons that call the simulator below.
 * - Production: replace `connect()` with your serial / WebSocket / Electron-IPC listener and call
 *   `emit(amountInPesos)` for each accepted bill or coin.
 */
const listeners = new Set()

export const cashAcceptor = {
  /** Subscribe to accepted cash. Returns an unsubscribe function. */
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  /** Called by the hardware driver (or the demo simulator) for every accepted bill / coin. */
  emit(amount) {
    listeners.forEach((fn) => fn(amount))
  },
}
