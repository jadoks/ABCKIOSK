import { useEffect, useState } from 'react'

/* Counts down from `seconds` while `running`. Restarts whenever `resetKey` changes. */
export default function useCountdown(seconds, running = true, resetKey = 0) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => { setLeft(seconds) }, [seconds, resetKey])
  useEffect(() => {
    if (!running) return undefined
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(t)
  }, [running, resetKey])
  return left
}
