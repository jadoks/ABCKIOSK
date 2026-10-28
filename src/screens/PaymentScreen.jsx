import { useEffect, useMemo, useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import Stepper from '../components/Stepper.jsx'
import QrPlaceholder from '../components/QrPlaceholder.jsx'
import CashSimulator from '../components/CashSimulator.jsx'
import {
  ArrowIcon, ArrowLeftIcon, CartIcon, CashIcon, ChevronRightIcon, CheckIcon,
  DineInIcon, QrIcon, ShieldDotIcon, ShieldIcon, SpinnerIcon, TakeOutIcon, TapIcon, TimerIcon, WalletIcon, XIcon,
} from '../components/icons.jsx'
import useCashSession from '../hooks/useCashSession.js'
import useCountdown from '../hooks/useCountdown.js'
import { cartSummary, orderTotals } from '../lib/cart.js'
import { ACCEPTED_BILLS, ACCEPTED_COINS, QR_EXPIRY_SECONDS, SERVICE_TYPES, SIMULATED_QR_SECONDS, SIMULATE_PAYMENTS } from '../lib/config.js'
import { db } from '../lib/db.js'
import { mmss, peso } from '../lib/format.js'

const PROCESSING_MS = 900 // pretend the wallet / bank is answering
const CASH_DONE_MS = 1400 // let the student see the final amount before the receipt
const PROVIDERS = ['GCash', 'Maya', 'ShopeePay', 'BDO Pay', 'BPI Mobile']
// Apps the student can choose to pay with (shown on the "choose your bank / e-wallet" step before the QR is generated)
const PAY_APPS = [
  { id: 'GCash', kind: 'E-Wallet', color: '#5fb4ff' },
  { id: 'Maya', kind: 'E-Wallet', color: '#3ddc97' },
  { id: 'ShopeePay', kind: 'E-Wallet', color: '#ff9a62' },
  { id: 'BPI', kind: 'Mobile Banking', color: '#ff8a96' },
  { id: 'BDO Pay', kind: 'Mobile Banking', color: '#6ea8ff' },
  { id: 'Other Bank', kind: 'Any QR Ph bank app', color: '#c4b5fd' },
]
const providerTone = { GCash: 'text-[#5fb4ff]', Maya: 'text-mint', ShopeePay: 'text-[#ff9a62]', 'BDO Pay': 'text-[#ff8a96]', 'BPI Mobile': 'text-[#ff8a96]' }
const list = (a) => a.map((v) => `₱${v.toLocaleString()}`).join(', ')

/* ---------- payment method card ---------- */
function MethodCard({ active, disabled, Icon, title, badge, badgeTone, subtitle, subtitleTone, onSelect }) {
  const badgeClass =
    badgeTone === 'amber' ? 'bg-[#4a3511] text-amber' : badgeTone === 'brand' ? 'bg-[#0f6f86]/70 text-brand' : 'bg-key text-muted'
  const inner = (
    <div className={`flex items-center gap-4 ${active ? 'rounded-[10px] bg-[#161c27] py-[12px] pl-0 pr-5' : 'px-5 py-[14px]'}`}>
      <span className="grid h-[56px] w-[56px] flex-none place-items-center rounded-[10px] bg-key"><Icon /></span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-3 text-[24px] font-semibold leading-7">
          {title}
          <span className={`rounded-full px-3 py-[2px] text-[13px] font-semibold tracking-[0.04em] ${badgeClass}`}>{badge}</span>
        </p>
        <p className={`truncate font-body text-[18px] leading-6 ${subtitleTone === 'danger' ? 'text-[#ff9aa2]' : 'text-muted'}`}>{subtitle}</p>
      </div>
      {active ? <CheckIcon className="h-[38px] w-[38px] flex-none" fill="#44d4f7" tick="#073242" /> : <span className="text-muted"><ChevronRightIcon /></span>}
    </div>
  )
  return (
    <button type="button" role="radio" aria-checked={active} disabled={disabled} onClick={onSelect}
      className={`block w-full rounded-[16px] text-left transition active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100 ${
        active ? 'bg-[#3fb6d3] p-[6px]' : 'bg-[#161c27]'
      }`}>
      {inner}
    </button>
  )
}

/* ---------- detail panel under the cards (fixed height so the buttons never jump) ---------- */
function PanelShell({ icon, title, ticket, children, bare = false }) {
  return (
    <section className={`h-[430px] overflow-hidden rounded-[16px] px-5 pb-3 pt-5 ${bare ? '' : 'border border-brand/70 bg-[#161c27]'}`} aria-live="polite">
      <div className={`flex items-center justify-between ${bare ? 'border-b border-[#222a38] pb-3' : ''}`}>
        <h2 className="flex items-center gap-3 text-[15px] font-semibold tracking-[0.06em] text-brand">{icon} {title}</h2>
        <span className={`text-[14px] ${bare ? 'text-muted' : 'rounded-md bg-key px-3 py-1 text-soft'}`}>Ticket #{ticket}</span>
      </div>
      {children}
    </section>
  )
}

function WalletPanel({ ticket, balance, total, enough }) {
  const remaining = balance - total
  return (
    <PanelShell icon={<ShieldIcon />} title="CAMPUS ID WALLET AUTHORIZATION" ticket={ticket}>
      <div className="mt-5 flex items-center justify-between text-[20px]"><span>Current Student Balance</span><span className="font-semibold">{peso(balance)}</span></div>
      <div className="mt-2 flex items-center justify-between text-[20px] text-[#ff9f8a]"><span>Pre-Order Deduction</span><span className="font-semibold">- {peso(total)}</span></div>
      <div className="mt-5 flex items-end justify-between border-t border-[#2b3342] pt-5">
        <div>
          <p className="text-[20px] font-semibold">{enough ? 'Remaining Wallet Balance' : 'Short by'}</p>
          <p className={`text-[14px] font-medium ${enough ? 'text-mint' : 'text-[#ff9aa2]'}`}>{enough ? 'After transaction approval' : 'Choose another payment method'}</p>
        </div>
        <p className={`text-[56px] font-bold leading-none ${enough ? 'text-brand' : 'text-[#ff9aa2]'}`}>{peso(Math.abs(remaining))}</p>
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-[10px] bg-ink px-4 py-3">
        <span className="grid h-[40px] w-[40px] flex-none place-items-center rounded-full bg-[#10343d] text-brand"><TapIcon /></span>
        <p className="text-[14px] font-medium leading-5">
          Tap <span className="text-brand">"Authorize &amp; Pay"</span> below or place your physical Student RFID Card on the lower contactless reader panel.
        </p>
      </div>
    </PanelShell>
  )
}

function GcashPanel({ ticket, lines, totals }) {
  const { count, subtotal, ecoFee, serviceFee, total } = totals
  return (
    <PanelShell icon={<QrIcon className="h-5 w-5 !text-brand" />} title="MOBILE E-WALLET PAYMENT" ticket={ticket}>
      <h3 className="mt-5 text-[22px] font-semibold leading-7">Generate Secure QR Code</h3>
      <p className="mt-1 font-body text-[18px] leading-6 text-muted">
        A QR Ph code will be generated for your <span className="font-semibold text-brand">{peso(total)}</span> {totals.serviceLabel} order. You will choose which bank or e-wallet to pay with first, then the QR code is shown.
      </p>
      <div className="mt-3 rounded-[10px] border border-[#222a38] bg-ink px-4 py-3">
        <div className="flex items-center justify-between text-[13px]"><span className="font-semibold text-soft">Supported Providers:</span><span className="font-semibold tracking-[0.06em] text-brand">BSP QR PH STANDARD</span></div>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROVIDERS.map((p) => <span key={p} className={`rounded-[6px] border border-[#2b3342] bg-[#161c27] px-3 py-1 text-[14px] font-semibold ${providerTone[p]}`}>{p}</span>)}
        </div>
        <p className="mt-2 flex items-center gap-2 font-body text-[15px] text-muted"><ShieldDotIcon className="h-4 w-4 text-brand" /> Instant clearance via Bangko Sentral ng Pilipinas national network.</p>
      </div>
      <div className="mt-3 space-y-[2px] text-[14px]">
        <div className="flex justify-between text-muted"><span>Order Subtotal ({count} {count === 1 ? 'item' : 'items'}):</span><span className="text-soft">{peso(subtotal)}</span></div>
        {ecoFee > 0 && <div className="flex justify-between text-muted"><span>Eco-Packaging Fee:</span><span className="text-soft">{peso(ecoFee)}</span></div>}
        <div className="flex justify-between text-muted"><span>Convenience / Service Fee:</span><span className="font-semibold text-mint">{serviceFee > 0 ? peso(serviceFee) : '₱0.00 (FREE)'}</span></div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-[#2b3342] pt-2 pb-1">
        <span className="text-[14px] font-semibold tracking-[0.04em]">TOTAL CHARGE</span>
        <span className="text-[30px] font-bold leading-none text-brand">{peso(total)}</span>
      </div>
    </PanelShell>
  )
}

function CashPanel({ ticket, total, inserted }) {
  const done = inserted >= total
  const remaining = Math.max(0, total - inserted)
  const change = Math.max(0, inserted - total)
  const row = 'flex h-[38px] items-center justify-between rounded-[8px] border border-[#1d2735] bg-ink px-4 text-[17px]'
  return (
    <PanelShell icon={<CashIcon className="h-5 w-5 !text-brand" />} title="HARDWARE PAYMENT ACTIVATED" ticket={ticket} bare>
      <p className="mt-4 text-center text-[18px] text-muted">Target Amount: <span className="font-semibold text-soft">{peso(total)}</span></p>
      <p className="text-center text-[80px] font-bold leading-[84px] text-brand [text-shadow:0_0_30px_rgba(68,212,247,0.4)]">{peso(inserted)}</p>
      <p className="mb-3 text-center text-[16px] font-medium tracking-[0.06em] text-muted">CASH INSERTED SO FAR</p>
      <div className="grid gap-2">
        <div className={row}><span className="flex items-center gap-3"><span className="h-[10px] w-[10px] rounded-full bg-mint" />Bill Acceptor: <span className="font-semibold text-mint">Ready</span></span><span className="text-[15px] text-muted">({list(ACCEPTED_BILLS)})</span></div>
        <div className={row}><span className="flex items-center gap-3"><span className="h-[10px] w-[10px] rounded-full bg-amber" />Coin Hopper: <span className="font-semibold text-amber">Ready</span></span><span className="text-[15px] text-muted">({list(ACCEPTED_COINS)})</span></div>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-[20px]"><span className="text-muted">Remaining Balance:</span><span className={`font-semibold ${done ? 'text-mint' : 'text-amber'}`}>{peso(remaining)}</span></div>
      <div className="mt-1 flex items-center justify-between px-1 text-[20px]"><span className="text-muted">Change Due:</span><span className={`font-semibold ${change > 0 ? 'text-brand' : 'text-[#3a4457]'}`}>{peso(change)}</span></div>
      {inserted > 0 && !done && <p className="mt-1 text-center font-body text-[13px] leading-4 text-muted">If you leave before paying in full, the cash you inserted is credited to your Campus Wallet.</p>}
    </PanelShell>
  )
}

/* ---------- step before the QR: pick which bank / e-wallet will be used ---------- */
function BankSelectStage({ ticket, total, count, serviceLabel, onSelect, onCancel }) {
  return (
    <div className="mt-5 flex flex-col items-center">
      <p className="flex h-[44px] items-center gap-3 rounded-full border border-[#222a38] bg-[#161c27] px-6 text-[20px]">
        <span className="h-[12px] w-[12px] rounded-full bg-brand" /> Ticket #{ticket} <span className="text-muted">•</span> <span className="text-brand">{serviceLabel}</span> <span className="text-muted">•</span> <span className="text-muted">{count} {count === 1 ? 'item' : 'items'}</span>
      </p>
      <h1 className="mt-4 text-[40px] font-bold leading-[46px]">Choose your Bank or E-Wallet</h1>
      <p className="mt-1 max-w-[600px] text-center font-body text-[22px] leading-7 text-[#9aa4b8]">Select the app you will pay with. Your QR Ph code is generated after you choose.</p>
      <p className="mt-4 text-[26px] text-muted">Amount Due: <span className="align-middle text-[48px] font-bold leading-[52px] text-brand">{peso(total)}</span></p>

      <div role="radiogroup" aria-label="Bank or e-wallet" className="mt-5 grid w-full grid-cols-2 gap-4">
        {PAY_APPS.map((a) => (
          <button key={a.id} type="button" role="radio" aria-checked="false" onClick={() => onSelect(a.id)}
            className="flex h-[130px] items-center gap-4 rounded-[16px] border border-[#2b3342] bg-[#161c27] px-5 text-left transition active:scale-[0.98] active:border-brand">
            <span className="grid h-[72px] w-[72px] flex-none place-items-center rounded-[14px] bg-key text-[34px] font-bold" style={{ color: a.color }}>{a.id[0]}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[28px] font-semibold leading-8" style={{ color: a.color }}>{a.id}</span>
              <span className="block font-body text-[18px] leading-6 text-muted">{a.kind}</span>
            </span>
            <span className="text-muted"><ChevronRightIcon /></span>
          </button>
        ))}
      </div>

      <button type="button" onClick={onCancel}
        className="mt-6 flex h-[56px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#ef4444]/70 bg-[#10172a] text-[19px] font-semibold text-[#ff6b6b] transition active:scale-[0.98]">
        <XIcon className="h-5 w-5" /> Cancel Payment &amp; Return to Options
      </button>
    </div>
  )
}

/* ---------- QR Ph scan screen (replaces the options after "Generate QR Code") ---------- */
function QrScanStage({ ticket, total, count, serviceLabel, seedKey, provider, onChangeProvider, onPaid, onCancel }) {
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

  const corner = 'absolute h-[34px] w-[34px] border-brand'
  return (
    <div className="mt-5 flex flex-col items-center">
      <p className="flex h-[44px] items-center gap-3 rounded-full border border-[#222a38] bg-[#161c27] px-6 text-[20px]">
        <span className="h-[12px] w-[12px] rounded-full bg-brand" /> Ticket #{ticket} <span className="text-muted">•</span> <span className="text-brand">{serviceLabel}</span> <span className="text-muted">•</span> <span className="text-muted">{count} {count === 1 ? 'item' : 'items'}</span>
      </p>
      <h1 className="mt-4 text-[40px] font-bold leading-[46px]">Scan with {provider}</h1>
      <p className="mt-1 max-w-[560px] text-center font-body text-[22px] leading-7 text-[#9aa4b8]">Open {provider === 'Other Bank' ? 'your banking app' : `your ${provider} app`} and scan the national QR Ph code below</p>

      <div className="relative mt-5 h-[468px] w-[444px]">
        <span className={`${corner} left-0 top-0 rounded-tl-[4px] border-l-[4px] border-t-[4px]`} />
        <span className={`${corner} right-0 top-0 rounded-tr-[4px] border-r-[4px] border-t-[4px]`} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-[4px] border-b-[4px] border-l-[4px]`} />
        <span className={`${corner} bottom-0 right-0 rounded-br-[4px] border-b-[4px] border-r-[4px]`} />
        <div className="absolute inset-x-[18px] inset-y-[18px] flex flex-col rounded-[28px] bg-white px-[24px] pb-[14px] pt-[24px] shadow-[0_0_40px_rgba(68,212,247,0.25)]">
          <QrPlaceholder seed={`${seedKey}-${provider}-${qrKey}`} className="mx-auto h-[330px] w-[330px]">
            <span className="grid h-[68px] w-[68px] place-items-center rounded-[14px] bg-[#0e131b] text-center shadow-lg">
              <span>
                <span className="block text-[17px] font-bold leading-5"><span className="text-[#ffd34d]">QR</span> <span className="text-[#ff7a45]">Ph</span></span>
                <span className="mx-auto mt-1 block h-[3px] w-[34px] rounded-full bg-gradient-to-r from-[#ffd34d] via-[#ff7a45] to-[#4da3ff]" />
              </span>
            </span>
          </QrPlaceholder>
          <div className="mt-auto flex items-center justify-between border-t border-[#e3e6ec] pt-3 text-[#0e131b]">
            <span className="flex items-center gap-2 text-[15px] font-bold tracking-[0.04em]"><span className="h-[9px] w-[9px] rounded-full bg-[#0891b2]" /> QR Ph OFFICIAL</span>
            <span className="font-mono text-[14px] font-semibold tracking-[0.1em] text-[#6b7280]">{provider.toUpperCase()} • ABC-{ticket.slice(2)}</span>
          </div>
          {expired && <div className="absolute inset-0 grid place-items-center rounded-[28px] bg-white/92 text-[#0e131b]"><p className="text-[28px] font-bold">QR Code expired</p></div>}
        </div>
      </div>

      <p className="mt-3 text-[26px] text-muted">Amount Due: <span className="align-middle text-[56px] font-bold leading-[60px] text-brand">{peso(total)}</span></p>
      {expired ? (
        <button type="button" onClick={() => setQrKey((k) => k + 1)}
          className="mt-3 flex h-[54px] items-center gap-3 rounded-full bg-[#09b4d6] px-8 text-[22px] font-semibold text-[#05303b] transition active:scale-[0.98]">Generate New QR Code</button>
      ) : (
        <p className="mt-3 flex h-[54px] items-center gap-3 rounded-full border border-amber/50 bg-[#2a2111] px-8 text-[22px] font-semibold text-amber"><SpinnerIcon className="h-6 w-6" /> Waiting for mobile payment confirmation…</p>
      )}
      <p className="mt-2 flex items-center gap-2 font-body text-[18px] text-muted"><TimerIcon /> QR Code expires in <span className="font-mono font-bold text-soft">{mmss(left)}</span></p>
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-[8px] border border-brand/60 bg-[#161c27] px-4 py-2 text-[18px] font-semibold text-brand">Paying with {provider}</span>
        <button type="button" onClick={onChangeProvider} className="rounded-[8px] border border-[#2b3342] bg-[#161c27] px-4 py-2 text-[18px] font-medium text-soft transition active:scale-[0.98]">Change Bank / Wallet</button>
      </div>
      <button type="button" onClick={onCancel}
        className="mt-4 flex h-[56px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#ef4444]/70 bg-[#10172a] text-[19px] font-semibold text-[#ff6b6b] transition active:scale-[0.98]">
        <XIcon className="h-5 w-5" /> Cancel Payment &amp; Return to Options
      </button>
    </div>
  )
}

/* ---------- screen ---------- */
export default function PaymentScreen({ student, cart, serviceType, onBackToCart, onBackToMenu, onLogOut, onPay }) {
  const { lines } = cartSummary(cart)
  const totals = orderTotals(lines)
  const { total } = totals
  const balance = db.getWalletBalance(student.id)
  const enough = balance >= total

  const ticket = useMemo(() => `T-${1000 + Math.floor(Math.random() * 9000)}`, [])
  const [method, setMethod] = useState(enough ? 'wallet' : 'gcash')
  const [stage, setStage] = useState('choose') // choose | bank | qr
  const [provider, setProvider] = useState(null) // bank / e-wallet picked before the QR is shown
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  /* Cash goes through the hardware validator; it is live as soon as "Pay Cash" is selected. */
  const { inserted, settle } = useCashSession(student.id, method === 'cash' && stage === 'choose')
  const cashPaid = useRef(false)
  useEffect(() => {
    if (method !== 'cash' || cashPaid.current || total <= 0 || inserted < total) return
    cashPaid.current = true
    timer.current = setTimeout(() => {
      settle() // from here on the cash belongs to this order (leaving earlier credits it to the wallet instead)
      const result = onPay('cash', ticket, { tendered: inserted, change: inserted - total })
      if (result && !result.ok) {
        cashPaid.current = false
        setError('Payment could not be completed. Your cash was credited to your wallet.')
      }
    }, CASH_DONE_MS)
  }, [method, inserted, total]) // eslint-disable-line react-hooks/exhaustive-deps
  const cashLocked = method === 'cash' && inserted > 0 // can't switch away once money is in the machine

  const pay = (m = method) => {
    if (busy) return
    setError('')
    setBusy(true)
    timer.current = setTimeout(() => {
      const result = onPay(m, ticket)
      if (result && !result.ok) {
        setBusy(false)
        setError(result.reason === 'insufficient' ? 'Wallet balance is too low. Please choose another payment method.' : 'Payment could not be completed. Please try again.')
      }
    }, PROCESSING_MS)
  }

  const serviceLabel = serviceType === 'take-out' ? 'Take-Out' : SERVICE_TYPES[serviceType] ?? 'Dine In'
  const ServiceIcon = serviceType === 'take-out' ? TakeOutIcon : DineInIcon
  const showBank = stage === 'bank'
  const showQr = stage === 'qr' && !!provider
  const canPay = !busy && (method !== 'wallet' || enough)

  const [primaryLabel, onPrimary] =
    method === 'wallet' ? [`Authorize & Pay ${peso(total)}`, () => pay('wallet')]
    : method === 'gcash' ? [`Choose Bank & Show QR ${peso(total)}`, () => { setError(''); setStage('bank') }]
    : [null, null]

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} actionLabel="Back to Menu" onAction={onBackToMenu} ActionIcon={ArrowLeftIcon} idlePaused={showQr || showBank || (method === 'cash' && inserted > 0)} />

      <div className="absolute left-[45px] right-[29px] top-[219px] flex flex-col">
        <Stepper current={3} />

        {showBank ? (
          <BankSelectStage
            ticket={ticket} total={total} count={totals.count} serviceLabel={serviceLabel}
            onSelect={(p) => { setProvider(p); setStage('qr') }} onCancel={() => { setProvider(null); setStage('choose') }}
          />
        ) : showQr ? (
          <QrScanStage
            ticket={ticket} total={total} count={totals.count} serviceLabel={serviceLabel} seedKey={`${ticket}-${total}`}
            provider={provider} onChangeProvider={() => setStage('bank')}
            onPaid={() => pay('gcash')} onCancel={() => { setProvider(null); setStage('choose') }}
          />
        ) : (
          <>
            <div className="mt-4 text-center">
              <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.01em]">Select Payment Method</h1>
              <p className="mx-auto mt-2 flex h-[44px] w-max items-center gap-3 rounded-full bg-[#161c27] px-5 text-[19px]">
                <span>Total Amount Due: <span className="text-[26px] font-semibold text-brand">{peso(total)}</span></span>
                <span className="text-muted">•</span>
                <span className="flex items-center gap-2 font-medium text-amber"><ServiceIcon className="h-5 w-5" /> {SERVICE_TYPES[serviceType] ?? 'Dine In'}</span>
              </p>
            </div>

            <div role="radiogroup" aria-label="Payment method" className="mt-5 flex flex-col gap-[10px]">
              <MethodCard
                active={method === 'wallet'} Icon={WalletIcon} disabled={cashLocked} onSelect={() => setMethod('wallet')}
                title="Campus ID Wallet" badge="INSTANT DEDUCTION" badgeTone="brand"
                subtitle={enough ? <>Available Balance: <span className="text-brand">{peso(balance)}</span> • 5% Dining Cashback</> : <>Available Balance: {peso(balance)} • Not enough for this order</>}
                subtitleTone={enough ? undefined : 'danger'}
              />
              <MethodCard
                active={method === 'gcash'} Icon={QrIcon} disabled={cashLocked} onSelect={() => setMethod('gcash')}
                title="GCash / QR Ph" badge="MOBILE PAY"
                subtitle="Scan screen QR using GCash, Maya, or mobile banking apps"
              />
              <MethodCard
                active={method === 'cash'} Icon={CashIcon} onSelect={() => setMethod('cash')}
                title="Pay Cash" badge="HARDWARE ACCEPTOR" badgeTone="amber"
                subtitle="Feed paper bills or drop coins into the hardware slots below."
              />
            </div>

            <div className="mt-4">
              {method === 'wallet' && <WalletPanel ticket={ticket} balance={balance} total={total} enough={enough} />}
              {method === 'gcash' && <GcashPanel ticket={ticket} lines={lines} totals={{ ...totals, serviceLabel }} />}
              {method === 'cash' && <CashPanel ticket={ticket} total={total} inserted={inserted} />}
            </div>

            <p className="mt-1 h-[22px] text-center text-[17px] font-medium leading-[22px] text-[#ff9aa2]" role="alert">{error}</p>

            {primaryLabel ? (
              <button type="button" disabled={!canPay} onClick={onPrimary}
                className="mt-1 flex h-[71px] items-center justify-center gap-3 rounded-[14px] bg-brand text-[30px] font-semibold text-[#073242] shadow-[0_0_30px_rgba(68,212,247,0.25)] transition active:scale-[0.98] disabled:bg-key disabled:text-muted disabled:shadow-none disabled:active:scale-100">
                {busy ? 'Processing…' : <>{primaryLabel} <ArrowIcon /></>}
              </button>
            ) : (
              <div className="mt-1"><CashSimulator /></div>
            )}
            <button type="button" onClick={onBackToCart} disabled={busy}
              className="mt-3 flex h-[60px] items-center justify-center gap-3 rounded-[14px] bg-[#161c27] text-[26px] font-semibold transition active:scale-[0.98] disabled:opacity-50">
              <CartIcon /> Return to Cart
            </button>
          </>
        )}
      </div>
    </Frame>
  )
}