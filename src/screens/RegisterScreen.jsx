import { useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import Keypad from '../components/Keypad.jsx'
import { IdIcon, UserIcon, LockIcon, CheckIcon, ArrowIcon, ArrowLeftIcon } from '../components/icons.jsx'
import { db } from '../lib/db.js'
import { ID_LENGTH, PIN_LENGTH } from '../lib/config.js'

const labelCls = 'text-[12px] font-semibold leading-4 tracking-[0.08em] text-muted'
const fieldCls = 'flex h-16 items-center gap-[14px] rounded-[14px] border border-[#2b3342] bg-panel-2 px-5'
const badgeCls = 'flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold tracking-[0.04em]'

/* One small PIN box (42px) */
function MiniBox({ state }) {
  const base = 'grid h-[42px] w-[42px] place-items-center rounded-[10px] border border-[#2f3747] bg-key'
  if (state === 'filled')
    return <div className={base}><span className="h-3 w-3 rounded-full bg-brand shadow-[0_0_10px_rgba(68,212,247,0.6)]" /></div>
  if (state === 'active')
    return (
      <div className={`${base} border-brand/50`}>
        <span className="h-5 w-[2px] animate-blink bg-brand motion-reduce:animate-none" />
      </div>
    )
  return <div className={base}><span className="h-1.5 w-1.5 rounded-full bg-[#3a4150]" /></div>
}

function PinGroup({ value, isActive, onSelect, label }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${label}: ${value.length} of ${PIN_LENGTH} digits entered`}
      className={`flex h-16 w-full items-center justify-between rounded-[14px] px-[13px] transition ${
        isActive
          ? 'border-2 border-brand bg-[#13202c] shadow-[0_0_24px_rgba(68,212,247,0.25)]'
          : 'border border-[#2b3342] bg-panel-2'
      }`}
    >
      {Array.from({ length: PIN_LENGTH }, (_, i) => (
        <MiniBox key={i} state={i < value.length ? 'filled' : i === value.length && isActive ? 'active' : 'empty'} />
      ))}
    </button>
  )
}

export default function RegisterScreen({ onRegistered, onBackToLogin, onHelp }) {
  const [idDigits, setIdDigits] = useState('')
  const [create, setCreate] = useState('')
  const [confirm, setConfirm] = useState('')
  const [active, setActive] = useState('id') // 'id' | 'create' | 'confirm'
  const [error, setError] = useState('') // message shown under the buttons after a failed submit
  const idInput = useRef(null)

  /* ----- derived state ----- */
  const idComplete = idDigits.length === ID_LENGTH
  const name = idComplete ? db.lookupRegistrar(idDigits) : null
  const alreadyRegistered = idComplete && !!name && db.isRegistered(idDigits)
  const idState = !idComplete ? 'incomplete' : !name ? 'not-found' : alreadyRegistered ? 'registered' : 'verified'

  const pinsMatch = create.length === PIN_LENGTH && confirm === create
  const pinsMismatch = confirm.length === PIN_LENGTH && confirm !== create

  /* ----- keypad ----- */
  const press = (k) => {
    setError('')
    if (active === 'id') {
      if (k === 'clear') return setIdDigits('')
      if (k === 'back') return setIdDigits((d) => d.slice(0, -1))
      if (idDigits.length < ID_LENGTH) {
        const next = idDigits + k
        setIdDigits(next)
        // jump to the PIN only when the registrar knows this ID and it has no account yet
        if (next.length === ID_LENGTH && db.lookupRegistrar(next) && !db.isRegistered(next)) setActive('create')
      }
      return
    }

    const value = active === 'create' ? create : confirm
    const setValue = active === 'create' ? setCreate : setConfirm
    if (k === 'clear') return setValue('')
    if (k === 'back') return setValue(value.slice(0, -1))
    if (value.length < PIN_LENGTH) {
      const next = value + k
      setValue(next)
      if (next.length === PIN_LENGTH && active === 'create') setActive('confirm')
    }
  }

  /* ----- submit ----- */
  const fail = (message, field) => {
    setError(message)
    setActive(field)
  }

  const submit = () => {
    if (!idComplete) return fail(`Enter your ${ID_LENGTH}-digit Student ID first.`, 'id')
    if (idState === 'not-found') return fail('Student ID not found. Check your number or ask staff for help.', 'id')
    if (idState === 'registered') return fail('This Student ID already has an account. Tap Back to Log In.', 'id')
    if (create.length < PIN_LENGTH) return fail(`Create a ${PIN_LENGTH}-digit PIN.`, 'create')
    if (confirm.length < PIN_LENGTH) return fail('Enter your PIN again to confirm it.', 'confirm')
    if (create !== confirm) {
      setConfirm('')
      return fail("PINs don't match. Enter the confirm PIN again.", 'confirm')
    }
    const result = db.register(idDigits, create) // swap for your real API call later
    if (result.ok) return onRegistered?.({ id: idDigits, name: result.name })
    fail('Registration failed. Please try again or ask staff for help.', 'id')
  }

  /* ----- ID badge ----- */
  let idBadge
  if (idState === 'verified')
    idBadge = (
      <span className={`${badgeCls} bg-[#12b79a] text-[#04302a]`}>
        <CheckIcon className="h-4 w-4" fill="#04302a" tick="#12b79a" /> ID VERIFIED
      </span>
    )
  else if (idState === 'registered')
    idBadge = <span className={`${badgeCls} bg-amber/15 text-amber`}>ALREADY REGISTERED</span>
  else if (idState === 'not-found')
    idBadge = <span className={`${badgeCls} bg-danger-icon text-white`}>ID NOT FOUND</span>
  else
    idBadge = (
      <span className={`${badgeCls} bg-amber/15 text-amber`}>
        <span className="h-2 w-2 rounded-full bg-amber" />
        {idDigits.length}/{ID_LENGTH} DIGITS
      </span>
    )

  return (
    <Frame>
      <AppHeader onHelp={onHelp} />

      <div className="absolute left-[172px] top-[221px] flex w-[680px] flex-col">
        <h1 className="text-center text-[40px] font-semibold leading-[52px] tracking-[-0.01em]">Create Student Account</h1>
        <p className="mt-[7px] text-center font-body text-[17px] leading-6 text-muted">
          Register your Student ID and 6-digit PIN for fast meal pre-orders
        </p>

        {/* Form card */}
        <div className="mt-[23px] rounded-[20px] bg-[#1c2230] px-6 pb-6 pt-[23px]">
          <p className={labelCls}>STUDENT ID NUMBER</p>
          <div
            onClick={() => { setActive('id'); idInput.current?.focus() }}
            className={`${fieldCls} mt-[9px] transition ${active === 'id' ? 'border-brand/60 shadow-[0_0_24px_rgba(68,212,247,0.2)]' : ''}`}
          >
            <IdIcon />
            <input
              ref={idInput}
              value={idDigits}
              onChange={(e) => { setError(''); setIdDigits(e.target.value.replace(/\D/g, '').slice(0, ID_LENGTH)) }}
              onFocus={() => setActive('id')}
              inputMode="none" /* use the on-screen keypad, not the OS keyboard */
              autoComplete="off"
              placeholder="0000000"
              aria-label="Student ID number"
              className="min-w-0 flex-1 bg-transparent text-[26px] font-medium tracking-[0.06em] text-soft caret-brand outline-none placeholder:text-[#4a5262]"
            />
            {idBadge}
          </div>

          <p className={`${labelCls} mt-[15px]`}>STUDENT FULL NAME (LINKED TO ID)</p>
          <div className={`${fieldCls} mt-[9px]`}>
            <UserIcon />
            {idState === 'verified' ? (
              <>
                <span className="flex-1 truncate text-[26px] font-medium tracking-[0.04em]">{name}</span>
                <span className={`${badgeCls} border border-brand/40 bg-brand/10 text-brand`}>
                  <LockIcon /> AUTO-FILLED FROM REGISTRAR
                </span>
              </>
            ) : (
              <span className="text-[20px] text-[#4a5262]">Filled in after your Student ID is verified</span>
            )}
          </div>

          <div className="mt-[15px] grid grid-cols-2 gap-4">
            <div>
              <p className={labelCls}>CREATE 6-DIGIT PIN</p>
              <div className="mt-[9px]">
                <PinGroup label="Create PIN" value={create} isActive={active === 'create'} onSelect={() => setActive('create')} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className={labelCls}>CONFIRM 6-DIGIT PIN</p>
                {pinsMatch && (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-mint">
                    <CheckIcon className="h-3.5 w-3.5" /> PINs Match
                  </span>
                )}
                {pinsMismatch && <span className="text-[12px] font-semibold text-[#ff7b86]">PINs don't match</span>}
              </div>
              <div className="mt-[9px]">
                <PinGroup label="Confirm PIN" value={confirm} isActive={active === 'confirm'} onSelect={() => setActive('confirm')} />
              </div>
            </div>
          </div>
        </div>

        <Keypad className="mt-5 gap-[14px]" onPress={press} />

        <button
          type="button"
          onClick={submit}
          className="mt-6 flex h-16 items-center justify-center gap-3 rounded-2xl bg-brand text-[28px] font-semibold text-[#06323f] shadow-[0_0_30px_rgba(68,212,247,0.3)] transition active:scale-[0.98]"
        >
          Complete Registration &amp; Log In <ArrowIcon />
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-[15px] flex h-16 items-center justify-center gap-3 rounded-2xl bg-key text-[26px] font-semibold text-brand transition active:scale-[0.98]"
        >
          <ArrowLeftIcon /> Already have an account? Back to Log In
        </button>

        {/* Message area (space reserved so the layout never jumps) */}
        <p role="alert" aria-live="polite" className="mt-[18px] h-6 text-center font-body text-[18px] font-medium leading-6 text-[#ff9aa2]">
          {error}
        </p>
      </div>
    </Frame>
  )
}
