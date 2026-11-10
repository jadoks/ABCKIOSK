import { useEffect, useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import Keypad from '../components/Keypad.jsx'
import { WarningIcon, IdIcon, CheckIcon, ArrowIcon, UserPlusIcon } from '../components/icons.jsx'
import { api, setToken } from '../lib/api.js'
import { ID_LENGTH, PIN_LENGTH, MAX_ATTEMPTS } from '../lib/config.js'

/* ---------- pieces ---------- */
function PinBox({ state }) {
  const base = 'grid h-[64px] place-items-center rounded-[14px] bg-key'
  if (state === 'filled')
    return <div className={base}><span className="h-4 w-4 rounded-full bg-brand shadow-[0_0_14px_rgba(68,212,247,0.6)]" /></div>
  if (state === 'active')
    return (
      <div className={`${base} border border-brand/40 bg-[#1b2a38] shadow-[0_0_26px_rgba(68,212,247,0.25)]`}>
        <span className="h-[26px] w-[2px] animate-blink bg-brand motion-reduce:animate-none" />
      </div>
    )
  return <div className={base}><span className="h-2 w-2 rounded-full bg-[#3a4150]" /></div>
}

/* ---------- screen ---------- */
export default function LoginScreen({ onSuccess, onRegister, onHelp }) {
  const [idDigits, setIdDigits] = useState('')
  const [pin, setPin] = useState('')
  const [active, setActive] = useState('id') // which field the keypad types into: 'id' | 'pin'
  const [failed, setFailed] = useState(0)
  const [unregistered, setUnregistered] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('') // network / server problems
  const [lockedUntil, setLockedUntil] = useState(0) // ms timestamp from the server's lockout, 0 = not locked
  const [lockSeconds, setLockSeconds] = useState(0)
  const idInput = useRef(null)

  const idComplete = idDigits.length === ID_LENGTH

  const locked = lockedUntil > 0
  const remaining = MAX_ATTEMPTS - failed

  // The server owns the lockout. When its time is up, unlock the keypad again.
  useEffect(() => {
    if (!lockedUntil) return
    const unlock = () => { setLockedUntil(0); setFailed(0) }
    const ms = lockedUntil - Date.now()
    if (ms <= 0) return unlock()
    const t = setTimeout(unlock, ms)
    return () => clearTimeout(t)
  }, [lockedUntil])

  const press = (k) => {
    if (locked) return
    setUnregistered(false)
    setServerError('')

    if (active === 'id') {
      if (k === 'clear') return setIdDigits('')
      if (k === 'back') return setIdDigits((d) => d.slice(0, -1))
      if (idDigits.length < ID_LENGTH) {
        const next = idDigits + k
        setIdDigits(next)
        if (next.length === ID_LENGTH) setActive('pin') // jump to PIN once the ID is complete
      }
      return
    }

    if (k === 'clear') return setPin('')
    if (k === 'back') return setPin((p) => p.slice(0, -1))
    setPin((p) => (p.length < PIN_LENGTH ? p + k : p))
  }

  const login = async () => {
    if (locked || busy) return
    if (!idComplete) return setActive('id')
    if (pin.length < PIN_LENGTH) return setActive('pin')
    setBusy(true)
    setServerError('')
    try {
      const res = await api.login(idDigits, pin)
      setToken(res.token)
      await onSuccess?.({ id: res.student.id, name: res.student.name, course: res.student.course, balance: res.balance, points: res.points })
    } catch (e) {
      setPin('')
      if (e.code === 'not-registered') setUnregistered(true)
      else if (e.code === 'wrong-pin') setFailed(MAX_ATTEMPTS - (e.body?.attemptsLeft ?? MAX_ATTEMPTS - 1))
      else if (e.code === 'locked') {
        const secs = Math.max(1, e.body?.retryAfterSeconds ?? 60)
        setFailed(MAX_ATTEMPTS)
        setLockSeconds(secs)
        setLockedUntil(Date.now() + secs * 1000)
      } else if (e.status === 0) setServerError('Cannot reach the kiosk server. Please ask staff for help.')
      else if (e.status === 429) setServerError('Too many attempts. Please wait a moment and try again.')
      else setServerError('Something went wrong. Please try again or ask staff for help.')
    } finally {
      setBusy(false)
    }
  }

  const lockMinutes = Math.max(1, Math.ceil(lockSeconds / 60))
  const notice = serverError
    ? serverError
    : unregistered
    ? 'This Student ID is not registered yet. Tap Register Account below.'
    : locked
    ? `Account locked for ${lockMinutes} minute${lockMinutes === 1 ? '' : 's'} after too many wrong PINs. Please try again later or ask staff for help.`
    : `Invalid PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining (Account locks after ${MAX_ATTEMPTS} failed attempts).`

  return (
    <Frame>
      <AppHeader onHelp={onHelp} />

      {/* Form column */}
      <div className="absolute left-[207px] top-[194px] flex w-[620px] flex-col">
        <h1 className="text-center text-[40px] font-semibold leading-[52px] tracking-[-0.01em]">Student Log In</h1>
        <p className="mt-0.5 text-center font-body text-[17px] leading-6 text-muted">
          Tap your student PIN to view balance &amp; pre-order meals
        </p>

        {/* Security notice (space reserved so the layout never jumps) */}
        <div className="mt-[50px] h-[88px]" role="alert" aria-live="polite">
          {(failed > 0 || unregistered || serverError) && (
            <div className="flex h-full items-center gap-4 rounded-2xl bg-danger px-[14px]">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-danger-icon"><WarningIcon /></span>
              <div>
                <p className="text-[12px] font-bold leading-[14px] tracking-[0.08em] text-[#f2a1a8]">SECURITY NOTICE</p>
                <p className="font-body text-[17px] leading-[22px] text-soft">{notice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Student ID */}
        <label className="mt-[49px] text-[12px] font-semibold leading-4 tracking-[0.12em] text-[#9aa1b0]">STUDENT ID NUMBER</label>
        <div
          onClick={() => { setActive('id'); idInput.current?.focus() }}
          className={`mt-[7px] flex h-16 items-center gap-[14px] rounded-2xl bg-key px-5 transition ${
            active === 'id' ? 'ring-1 ring-brand/50 shadow-[0_0_26px_rgba(68,212,247,0.2)]' : ''
          }`}
        >
          <IdIcon />
          <input
            ref={idInput}
            value={idDigits}
            onChange={(e) => setIdDigits(e.target.value.replace(/\D/g, '').slice(0, ID_LENGTH))}
            onFocus={() => setActive('id')}
            inputMode="none" /* use the on-screen keypad, not the OS keyboard */
            autoComplete="off"
            placeholder="0000000"
            aria-label="Student ID number"
            className="min-w-0 flex-1 bg-transparent text-[26px] font-medium tracking-[0.04em] text-soft caret-brand outline-none placeholder:text-[#4a5262]"
          />
          {idComplete ? (
            <span className="flex h-7 items-center gap-1.5 rounded-full bg-verified px-3 text-[12px] font-bold tracking-[0.08em] text-mint">
              <CheckIcon /> VERIFIED
            </span>
          ) : (
            <span className="flex h-7 items-center gap-1.5 rounded-full bg-amber/15 px-3 text-[12px] font-bold tracking-[0.08em] text-amber">
              <span className="h-2 w-2 rounded-full bg-amber" />
              {idDigits.length}/{ID_LENGTH} DIGITS
            </span>
          )}
        </div>

        {/* PIN */}
        <div className="mt-[49px] flex items-center justify-between">
          <span className="text-[12px] font-semibold leading-4 tracking-[0.12em] text-[#9aa1b0]">6-DIGIT ACCESS PIN</span>
          <span className="text-[13px] font-semibold text-amber">● Touch keypad below</span>
        </div>
        <div onClick={() => setActive('pin')} className="mt-[7px] grid grid-cols-6 gap-3" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <PinBox key={i} state={i < pin.length ? 'filled' : i === pin.length && active === 'pin' ? 'active' : 'empty'} />
          ))}
        </div>

        {/* Keypad */}
        <Keypad className="mt-[54px] gap-3" onPress={press} />

        {/* Actions */}
        <button
          type="button"
          onClick={login}
          disabled={locked || busy}
          className="mt-[58px] flex h-16 items-center justify-center gap-2 rounded-2xl bg-brand text-[22px] font-semibold text-[#06323f] shadow-[0_0_30px_rgba(68,212,247,0.3)] transition active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? 'Logging in…' : <>Log In <ArrowIcon /></>}
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="mt-[30px] flex h-16 items-center justify-center gap-3 rounded-2xl bg-key text-[22px] font-semibold text-brand transition active:scale-[0.98]"
        >
          <UserPlusIcon /> New Student? Register Account
        </button>
      </div>
    </Frame>
  )
}
