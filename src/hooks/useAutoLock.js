import { useEffect, useRef, useState } from 'react'

/* Counts down while the screen is untouched. Any tap/key resets it. Calls onExpire at 0. */
export default function useAutoLock(seconds, onExpire) {
  const [left, setLeft] = useState(seconds)
  const expire = useRef(onExpire)
  expire.current = onExpire

  useEffect(() => {
    const reset = () => setLeft(seconds)
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    const timer = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => {
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
      clearInterval(timer)
    }
  }, [seconds])

  useEffect(() => {
    if (left <= 0) expire.current?.()
  }, [left])

  return left
}
