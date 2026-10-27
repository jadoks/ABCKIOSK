import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Two-stage idle timer.
 *  1) idleSeconds of no touch/key  -> `warning` becomes true (show the "Are you still ordering?" modal)
 *  2) warnSeconds more, still nothing -> onExpire() (log out and clear the cart)
 * Touching the screen during stage 1 restarts it. During stage 2 only `stay()` restarts it
 * (the modal's "I'm Still Here" button), so a stray tap behind the modal can't dismiss it.
 * Pass warnSeconds = 0 to skip the warning and expire straight after the idle time.
 */
export default function useIdleWarning(idleSeconds, warnSeconds, onExpire) {
  const [idleLeft, setIdleLeft] = useState(idleSeconds)
  const [warnLeft, setWarnLeft] = useState(warnSeconds)
  const expire = useRef(onExpire)
  expire.current = onExpire

  useEffect(() => {
    const reset = () => setIdleLeft((l) => (l > 0 ? idleSeconds : l)) // ignored once the warning is up
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    const timer = setInterval(() => {
      setIdleLeft((l) => (l > 0 ? l - 1 : l))
    }, 1000)
    return () => {
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
      clearInterval(timer)
    }
  }, [idleSeconds])

  const warning = idleLeft <= 0 && warnSeconds > 0

  useEffect(() => {
    if (!warning) return undefined
    const timer = setInterval(() => setWarnLeft((w) => w - 1), 1000)
    return () => clearInterval(timer)
  }, [warning])

  useEffect(() => {
    if (idleLeft <= 0 && (warnSeconds <= 0 || warnLeft <= 0)) expire.current?.()
  }, [idleLeft, warnLeft, warnSeconds])

  const stay = useCallback(() => {
    setWarnLeft(warnSeconds)
    setIdleLeft(idleSeconds)
  }, [idleSeconds, warnSeconds])

  return { idleLeft, warning, warnLeft: Math.max(0, warnLeft), stay }
}