import { useCallback, useEffect, useRef, useState } from 'react'
import { cashAcceptor } from '../lib/cashAcceptor.js'
import { api, getToken } from '../lib/api.js'
import { refreshWallet } from '../lib/wallet.js'

/*
 * Tracks cash inserted during one screen visit.
 * If the student leaves (Cancel, Back, auto-logout) before the payment finishes, whatever was already
 * inserted is credited to their Campus Wallet, because bills can't be pushed back out.
 */
export default function useCashSession(studentId, active) {
  const [inserted, setInserted] = useState(0)
  const insertedRef = useRef(0)
  const settled = useRef(false)
  const tokenRef = useRef(getToken()) // remembered so the credit still works if the session ends (auto log-out) at the same moment

  useEffect(() => {
    if (!active) return undefined
    return cashAcceptor.subscribe((amount) => {
      if (settled.current) return
      insertedRef.current += amount
      setInserted(insertedRef.current)
    })
  }, [active])

  /** Credits unused cash to the wallet (no-op when nothing was inserted or the payment already finished). */
  const creditLeftover = useCallback(() => {
    if (!settled.current && insertedRef.current > 0) {
      api.topUp(insertedRef.current, 'cash', 'Unfinished payment, credited to wallet', { token: tokenRef.current })
        .then(() => refreshWallet())
        .catch(() => {})
    }
    insertedRef.current = 0
    setInserted(0)
  }, [studentId])

  useEffect(() => creditLeftover, [creditLeftover]) // also runs when the screen closes

  /** Call once the inserted cash has been fully used (payment or top-up completed). */
  const settle = useCallback(() => { settled.current = true }, [])
  return { inserted, settle, creditLeftover }
}
