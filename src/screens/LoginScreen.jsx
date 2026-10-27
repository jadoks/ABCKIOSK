import { useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import Keypad from '../components/Keypad.jsx'
import { WarningIcon, IdIcon, CheckIcon, ArrowIcon, UserPlusIcon } from '../components/icons.jsx'
import { db } from '../lib/db.js'
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
  const idInput = useRef(null)

  const idComplete = idDigits.length === ID_LENGTH

  const locked = failed >= MAX_ATTEMPTS
  const remaining = MAX_ATTEMPTS - failed

  const press = (k) => {
    if (locked) return
    setUnregistered(false)

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

  const login = () => {
    if (locked) return
    if (!idComplete) return setActive('id')
    if (pin.length < PIN_LENGTH) return setActive('pin')
    const result = db.verifyLogin(idDigits, pin) // swap for your real API call later
    if (result.ok) return onSuccess?.({ id: idDigits, name: result.name })
    setPin('')
    if (result.reason === 'not-registered') return setUnregistered(true)
    setFailed((f) => f + 1)
  }

  const notice = unregistered
    ? 'This Student ID is not registered yet. Tap Register Account below.'
    : locked
    ? 'Account locked after 5 failed attempts. Please ask staff for help.'
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
          {(failed > 0 || unregistered) && (
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
          disabled={locked}
          className="mt-[58px] flex h-16 items-center justify-center gap-2 rounded-2xl bg-brand text-[22px] font-semibold text-[#06323f] shadow-[0_0_30px_rgba(68,212,247,0.3)] transition active:scale-[0.98] disabled:opacity-40"
        >
          Log In <ArrowIcon />
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
