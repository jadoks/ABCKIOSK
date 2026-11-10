/*
 * Wallet balance + meal points for the logged-in student.
 * The server owns the numbers; this is a small shared copy so every screen shows the same values.
 *   setWallet()      - after login / after the server returns new numbers
 *   refreshWallet()  - re-read from GET /api/wallet (after a payment, top-up or redemption)
 *   useWallet()      - { balance, points } in a component; re-renders when they change
 */
import { useSyncExternalStore } from 'react'
import { api } from './api.js'

let state = { balance: 0, points: 0 }
const listeners = new Set()

export const setWallet = (w) => {
  state = { balance: Number(w?.balance ?? 0), points: Number(w?.points ?? 0) }
  listeners.forEach((l) => l())
}
export const clearWallet = () => setWallet({ balance: 0, points: 0 })

export async function refreshWallet() {
  const w = await api.get('/api/wallet')
  setWallet(w)
  return w
}

export const useWallet = () =>
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
