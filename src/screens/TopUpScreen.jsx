import { useEffect, useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import Keypad from '../components/Keypad.jsx'
import QrPlaceholder from '../components/QrPlaceholder.jsx'
import CashSimulator from '../components/CashSimulator.jsx'
import { ArrowIcon, ArrowLeftIcon, CashIcon, CheckIcon, CoinIcon, PencilIcon, QrIcon, SpinnerIcon, TimerIcon, XIcon } from '../components/icons.jsx'
import useCashSession from '../hooks/useCashSession.js'
import useCountdown from '../hooks/useCountdown.js'
import {
  ACCEPTED_BILLS, ACCEPTED_COINS, QR_EXPIRY_SECONDS, SIMULATED_QR_SECONDS, SIMULATE_PAYMENTS,
  TOPUP_AMOUNTS, TOPUP_DEFAULT, TOPUP_MAX, TOPUP_MIN,
} from '../lib/config.js'
import { db } from '../lib/db.js'
import { mmss, peso } from '../lib/format.js'

const money = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const list = (a) => a.map((v) => `₱${v.toLocaleString()}`).join(', ')

/* ---------- on-screen keypad for a custom amount ---------- */
function CustomAmountModal({ initial, onSet, onClose }) {
  const [digits, setDigits] = useState(initial ? String(initial) : '')
  const value = Number(digits || 0)
  const valid = value >= TOPUP_MIN && value <= TOPUP_MAX
  const press = (k) => {
    if (k === 'clear') setDigits('')
    else if (k === 'back') setDigits((d) => d.slice(0, -1))
    else setDigits((d) => (d.length >= 5 ? d : d === '' && k === '0' ? '' : d + k))
  }
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#02050a]/85 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="custom-title">
      <div className="w-[600px] rounded-[28px] border border-[#2b3342] bg-[#111827] px-[44px] pb-[36px] pt-[36px] text-center">
        <h2 id="custom-title" className="text-[32px] font-semibold">Enter Top-Up Amount</h2>
        <p className="mt-1 font-body text-[18px] text-muted">Minimum {peso(TOPUP_MIN)} • Maximum {peso(TOPUP_MAX)}</p>
        <p className={`mt-5 rounded-[14px] bg-ink py-4 text-[56px] font-bold leading-[60px] ${digits ? 'text-brand' : 'text-[#3a4457]'}`}>{digits ? money(value) : '₱0.00'}</p>
        <Keypad onPress={press} className="mt-5 gap-3" />
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="h-[64px] flex-1 rounded-[14px] border border-[#2b3342] bg-[#161c27] text-[22px] font-semibold transition active:scale-[0.98]">Cancel</button>
          <button type="button" disabled={!valid} onClick={() => onSet(value)}
            className="h-[64px] flex-[1.4] rounded-[14px] bg-brand text-[22px] font-semibold text-[#073242] transition active:scale-[0.98] disabled:bg-key disabled:text-muted disabled:active:scale-100">
            Set Amount
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ amount, balance, onWallet, onMenu }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#02050a]/85 backdrop-blur-[3px]" role="alertdialog" aria-modal="true" aria-labelledby="topup-done">
      <div className="w-[640px] rounded-[28px] border-2 border-mint bg-[#111827] px-[48px] pb-[40px] pt-[44px] text-center shadow-[0_0_70px_rgba(63,214,180,0.25)]">
        <span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-mint/15"><CheckIcon className="h-[56px] w-[56px]" /></span>
        <h2 id="topup-done" className="mt-5 text-[38px] font-bold leading-[44px]">Top-Up Successful!</h2>
        <p className="mt-4 text-[56px] font-bold leading-[60px] text-mint">+ {money(amount)}</p>
        <p className="mt-4 font-body text-[22px] text-muted">New Campus Wallet balance</p>
        <p className="text-[44px] font-bold text-brand">{money(balance)}</p>
        <button type="button" onClick={onWallet} autoFocus
          className="mt-7 flex h-[68px] w-full items-center justify-center rounded-[16px] bg-brand text-[26px] font-semibold text-[#073242] transition active:scale-[0.98]">View Wallet</button>
        <button type="button" onClick={onMenu}
          className="mt-3 flex h-[64px] w-full items-center justify-center rounded-[16px] border border-[#2b3342] bg-[#161c27] text-[24px] font-semibold transition active:scale-[0.98]">Back to Menu</button>
      </div>
    </div>
  )
}

/* ---------- stage 1: pick amount and method ---------- */
function PickStage({ student, amount, custom, setAmount, setCustom, method, setMethod, onProceed, openKeypad }) {
  const balance = db.getWalletBalance(student.id)
  return (
    <div className="absolute left-[104px] right-[82px] top-[322px] flex flex-col">
      <div className="text-center">
        <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.01em]">Top Up Campus Wallet</h1>
        <p className="mt-2 text-[20px] text-muted">Current Balance: <span className="text-[26px] font-semibold text-brand">{peso(balance)}</span></p>
      </div>

      <p className="mt-9 text-[16px] font-semibold tracking-[0.08em] text-brand">SELECT TOP-UP AMOUNT</p>
      <div className="mt-3 grid grid-cols-2 gap-4" role="radiogroup" aria-label="Top-up amount">
        {TOPUP_AMOUNTS.map((a) => {
          const active = !custom && amount === a
          return (
            <button key={a} type="button" role="radio" aria-checked={active} onClick={() => { setCustom(false); setAmount(a) }}
              className={`flex h-[112px] items-center justify-center gap-3 rounded-[12px] text-[38px] font-bold transition active:scale-[0.98] ${
                active ? 'bg-[#09b4d6] text-[#05303b] shadow-[0_0_24px_rgba(9,180,214,0.35)]' : 'border border-[#2b3342] bg-[#161c27]'
              }`}>
              {money(a)} {active && <CheckIcon className="h-[26px] w-[26px]" fill="none" tick="#05303b" />}
            </button>
          )
        })}
      </div>
      <button type="button" onClick={openKeypad}
        className={`mt-4 flex h-[56px] items-center gap-3 rounded-[10px] border px-5 text-left text-[19px] transition active:scale-[0.99] ${custom ? 'border-brand bg-[#0f2c3a] text-brand' : 'border-[#2b3342] bg-[#121722] text-muted'}`}>
        <PencilIcon /> {custom ? `Custom amount: ${money(amount)}` : 'Or enter custom amount…'}
      </button>

      <p className="mt-8 text-[16px] font-semibold tracking-[0.08em] text-brand">SELECT PAYMENT METHOD</p>
      <div className="mt-3 flex flex-col gap-[14px]" role="radiogroup" aria-label="Payment method">
        {[
          { id: 'gcash', Icon: QrIcon, title: 'GCash / QR Ph', sub: 'Scan screen QR using mobile app' },
          { id: 'cash', Icon: CashIcon, title: 'Insert Cash (Bills or Coins)', sub: 'Feed paper bills or drop coins into the flashing hardware slots below' },
        ].map(({ id, Icon, title, sub }) => {
          const active = method === id
          return (
            <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setMethod(id)}
              className={`flex h-[82px] items-center gap-4 rounded-[10px] border px-4 text-left transition active:scale-[0.99] ${active ? 'border-brand bg-[#161c27]' : 'border-[#2b3342] bg-[#121722]'}`}>
              <span className="grid h-[48px] w-[48px] flex-none place-items-center rounded-[10px] bg-key text-brand"><Icon className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[21px] font-semibold leading-6">{title}</span>
                <span className="block truncate font-body text-[16px] text-muted">{sub}</span>
              </span>
              {active ? <CheckIcon className="h-[30px] w-[30px] flex-none" fill="#44d4f7" tick="#073242" /> : <span className="h-[26px] w-[26px] flex-none rounded-full bg-key" />}
            </button>
          )
        })}
      </div>

      <button type="button" onClick={onProceed}
        className="mt-8 flex h-[64px] items-center justify-center gap-3 rounded-[10px] bg-[#09b4d6] text-[26px] font-semibold text-[#05303b] shadow-[0_0_30px_rgba(68,212,247,0.25)] transition active:scale-[0.98]">
        Proceed to Top Up {money(amount)} <ArrowIcon />
      </button>
    </div>
  )
}

/* ---------- stage 2a: QR Ph ---------- */
function QrStage({ student, amount, onPaid }) {
  const paid = useRef(onPaid)
  paid.current = onPaid // keep the demo timer from restarting on every parent render
  const [qrKey, setQrKey] = useState(0)
  const left = useCountdown(QR_EXPIRY_SECONDS, true, qrKey)
  const expired = left <= 0

  // DEMO: pretend the payment arrives. In production the server tells us the payment cleared.
  useEffect(() => {
    if (!SIMULATE_PAYMENTS || expired) return undefined
    const t = setTimeout(() => paid.current(), SIMULATED_QR_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [expired, qrKey])

  return (
    <div className="absolute inset-x-0 top-[262px] flex flex-col items-center">
      <p className="flex h-[40px] items-center gap-3 rounded-full bg-[#161c27] px-6 text-[18px] font-semibold tracking-[0.06em] text-brand"><QrIcon className="h-5 w-5 !text-brand" /> NATIONAL QR PAYMENT RAIL</p>
      <h1 className="mt-5 text-[44px] font-bold leading-[52px]">Scan to Pay via GCash / QR Ph</h1>
      <p className="mt-2 max-w-[620px] text-center font-body text-[24px] leading-8 text-[#9aa4b8]">Open GCash, Maya, or any QR Ph enabled banking app to complete your student balance top-up.</p>

      <div className="relative mt-6 grid h-[514px] w-[514px] place-items-center rounded-[40px] bg-white">
        <QrPlaceholder seed={`topup-${student.id}-${amount}-${qrKey}`} className="h-[390px] w-[390px] flex-none">
          <span className="rounded-[8px] bg-[#09b4d6] px-5 py-2 text-center text-[#05303b] shadow-lg">
            <span className="block text-[20px] font-bold leading-5">QR Ph</span>
            <span className="block text-[10px] font-bold tracking-[0.1em]">INSTAPAY</span>
          </span>
        </QrPlaceholder>
        {expired && <div className="absolute inset-0 grid place-items-center rounded-[40px] bg-white/90 text-[#0e131b]"><p className="text-[30px] font-bold">QR Code expired</p></div>}
      </div>

      <p className="mt-8 text-[18px] font-semibold tracking-[0.14em] text-muted">AMOUNT TO CHARGE</p>
      <p className="text-[64px] font-bold leading-[68px] text-brand">{money(amount)}</p>
      {expired ? (
        <button type="button" onClick={() => setQrKey((k) => k + 1)}
          className="mt-3 flex h-[56px] items-center gap-3 rounded-full bg-[#09b4d6] px-8 text-[24px] font-semibold text-[#05303b] transition active:scale-[0.98]">Generate New QR Code</button>
      ) : (
        <p className="mt-3 flex h-[56px] items-center gap-3 rounded-full border border-amber/30 bg-[#2a2111] px-8 text-[24px] font-semibold text-amber"><SpinnerIcon className="h-6 w-6" /> Awaiting payment confirmation...</p>
      )}
      <p className="mt-3 flex items-center gap-2 font-body text-[19px] text-muted"><TimerIcon /> QR Code expires in <span className="font-mono font-bold text-soft">{mmss(left)}</span></p>
    </div>
  )
}

/* ---------- stage 2b: physical cash ---------- */
function CashStage({ amount, inserted }) {
  const pct = Math.min(100, Math.round((inserted / amount) * 100))
  const remaining = Math.max(0, amount - inserted)
  return (
    <div className="absolute left-[114px] right-[120px] top-[270px] flex flex-col items-center">
      <p className="flex h-[34px] items-center gap-3 rounded-full bg-[#161c27] px-5 text-[15px] font-semibold tracking-[0.04em] text-brand"><span className="h-[9px] w-[9px] rounded-full bg-brand" /> HARDWARE CASH VALIDATOR ONLINE</p>
      <h1 className="mt-5 text-[48px] font-bold leading-[56px]">Insert Physical Cash</h1>
      <p className="mt-2 max-w-[640px] text-center font-body text-[23px] leading-8 text-[#9aa4b8]">Please insert paper bills or drop coins into the flashing hardware slots below.</p>

      <div className="mt-8 grid w-full grid-cols-2 gap-5">
        {[{ Icon: CashIcon, label: 'ACCEPTED BILLS', v: list(ACCEPTED_BILLS) }, { Icon: CoinIcon, label: 'ACCEPTED COINS', v: list(ACCEPTED_COINS) }].map(({ Icon, label, v }) => (
          <div key={label} className="flex h-[98px] items-center gap-4 rounded-[14px] border border-[#222a38] bg-[#161c27] px-5">
            <span className="grid h-[56px] w-[56px] flex-none place-items-center rounded-[10px] bg-key text-brand"><Icon className="h-6 w-6 !text-brand" /></span>
            <div><p className="text-[14px] font-semibold tracking-[0.1em] text-muted">{label}</p><p className="whitespace-nowrap text-[19px] font-semibold">{v}</p></div>
          </div>
        ))}
      </div>

      <section className="mt-[56px] w-full rounded-[22px] border-2 border-brand bg-[#161c27] px-10 pb-8 pt-8 shadow-[0_0_34px_rgba(68,212,247,0.25)]" aria-live="polite">
        <div className="flex items-center justify-between border-b border-[#2b3342] pb-6 text-[24px]"><span className="text-muted">Target Top-Up Amount</span><span className="text-[34px] font-bold">{money(amount)}</span></div>
        <p className="mt-8 text-center text-[16px] font-semibold tracking-[0.12em] text-brand">CASH INSERTED SO FAR</p>
        <p className="text-center text-[104px] font-bold leading-[112px] text-brand [text-shadow:0_0_30px_rgba(68,212,247,0.35)]">{money(inserted)}</p>
        <div className="mt-6 h-[16px] overflow-hidden rounded-full bg-ink"><div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
        <div className="mt-3 flex justify-between text-[17px] text-muted"><span>{pct}% Completed</span><span className="font-semibold text-soft">Remaining: {money(remaining)}</span></div>
      </section>

      <p className="mt-8 flex h-[44px] items-center gap-3 rounded-full border border-amber/30 bg-[#2a2111] px-6 text-[19px] font-semibold text-amber"><SpinnerIcon /> {inserted > 0 ? 'Cash received, keep inserting…' : 'Waiting for cash insertion…'}</p>
      <div className="mt-5 w-full"><CashSimulator /></div>
    </div>
  )
}

/* ---------- screen ---------- */
export default function TopUpScreen({ student, cart, onLogOut, onBackToMenu, onBackToWallet }) {
  const [stage, setStage] = useState('pick') // pick | qr | cash | done
  const [amount, setAmount] = useState(TOPUP_DEFAULT)
  const [custom, setCustom] = useState(false)
  const [keypad, setKeypad] = useState(false)
  const [method, setMethod] = useState('gcash')
  const [result, setResult] = useState(null) // { amount, balance } after a successful top-up
  const finished = useRef(false)

  const { inserted, settle, creditLeftover } = useCashSession(student.id, stage === 'cash')

  const finish = (credited, how) => {
    if (finished.current) return
    finished.current = true
    const balance = db.creditWallet(student.id, credited, { method: how })
    setResult({ amount: credited, balance })
    setStage('done')
  }

  // cash: done as soon as the target is reached; the full amount inserted is credited (no change on top-ups)
  useEffect(() => {
    if (stage === 'cash' && inserted >= amount && inserted > 0) {
      settle()
      finish(inserted, 'cash')
    }
  }, [stage, inserted, amount]) // eslint-disable-line react-hooks/exhaustive-deps

  const paidByQr = () => finish(amount, 'gcash')

  const cancel = () => {
    creditLeftover() // cash already inserted goes to the wallet instead of being lost
    setStage('pick')
  }

  const waiting = stage === 'qr' || stage === 'cash'
  const inFlow = waiting

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar
        student={student} cart={cart} onLogOut={onLogOut} idlePaused={waiting}
        actionLabel={inFlow ? 'Cancel' : 'Back to Menu'} onAction={inFlow ? cancel : onBackToMenu} ActionIcon={inFlow ? XIcon : ArrowLeftIcon}
      />

      {stage === 'pick' && (
        <PickStage
          student={student} amount={amount} custom={custom} setAmount={setAmount} setCustom={setCustom}
          method={method} setMethod={setMethod} openKeypad={() => setKeypad(true)}
          onProceed={() => setStage(method === 'gcash' ? 'qr' : 'cash')}
        />
      )}
      {stage === 'qr' && <QrStage student={student} amount={amount} onPaid={paidByQr} />}
      {stage === 'cash' && <CashStage amount={amount} inserted={inserted} />}

      {keypad && <CustomAmountModal initial={custom ? amount : 0} onClose={() => setKeypad(false)} onSet={(v) => { setAmount(v); setCustom(true); setKeypad(false) }} />}
      {stage === 'done' && result && <SuccessModal amount={result.amount} balance={result.balance} onWallet={onBackToWallet} onMenu={onBackToMenu} />}
    </Frame>
  )
}
