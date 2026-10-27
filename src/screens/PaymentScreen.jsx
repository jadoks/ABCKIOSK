import { useEffect, useMemo, useRef, useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import Stepper from '../components/Stepper.jsx'
import QrPlaceholder from '../components/QrPlaceholder.jsx'
import {
  ArrowIcon, ArrowLeftIcon, CartIcon, CashIcon, ChevronRightIcon, CheckIcon,
  DineInIcon, QrIcon, ShieldIcon, TakeOutIcon, TapIcon, WalletIcon,
} from '../components/icons.jsx'
import { cartSummary, orderTotals } from '../lib/cart.js'
import { CASH_HOLD_MINUTES, SERVICE_TYPES } from '../lib/config.js'
import { db } from '../lib/db.js'
import { peso } from '../lib/format.js'

const PROCESSING_MS = 900 // pretend the wallet / bank is answering

/* ---------- payment method card ---------- */
function MethodCard({ active, disabled, Icon, title, badge, badgeTone, subtitle, subtitleTone, onSelect }) {
  const badgeClass =
    badgeTone === 'amber' ? 'bg-[#4a3511] text-amber' : badgeTone === 'brand' ? 'bg-[#0f6f86]/70 text-brand' : 'bg-key text-muted'
  const inner = (
    <div className={`flex items-center gap-4 ${active ? 'rounded-[10px] bg-[#161c27] py-[14px] pl-0 pr-5' : 'px-5 py-4'}`}>
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
function PanelShell({ icon, title, ticket, children }) {
  return (
    <section className="h-[322px] overflow-hidden rounded-[16px] border-t-[4px] border-brand bg-[#161c27] px-5 pt-5" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-[15px] font-semibold tracking-[0.06em] text-brand">{icon} {title}</h2>
        <span className="rounded-md bg-key px-3 py-1 text-[14px] text-soft">Ticket #{ticket}</span>
      </div>
      {children}
    </section>
  )
}

function WalletPanel({ ticket, balance, total, enough }) {
  const remaining = balance - total
  return (
    <PanelShell icon={<ShieldIcon />} title="CAMPUS ID WALLET AUTHORIZATION" ticket={ticket}>
      <div className="mt-4 flex items-center justify-between text-[20px]"><span>Current Student Balance</span><span className="font-semibold">{peso(balance)}</span></div>
      <div className="mt-2 flex items-center justify-between text-[20px] text-[#ff9f8a]"><span>Pre-Order Deduction</span><span className="font-semibold">- {peso(total)}</span></div>
      <div className="mt-4 flex items-end justify-between border-t border-[#2b3342] pt-4">
        <div>
          <p className="text-[20px] font-semibold">{enough ? 'Remaining Wallet Balance' : 'Short by'}</p>
          <p className={`text-[14px] font-medium ${enough ? 'text-mint' : 'text-[#ff9aa2]'}`}>{enough ? 'After transaction approval' : 'Choose another payment method'}</p>
        </div>
        <p className={`text-[56px] font-bold leading-none ${enough ? 'text-brand' : 'text-[#ff9aa2]'}`}>{peso(Math.abs(remaining))}</p>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-[10px] bg-ink px-4 py-3">
        <span className="grid h-[40px] w-[40px] flex-none place-items-center rounded-full bg-[#10343d] text-brand"><TapIcon /></span>
        <p className="text-[14px] font-medium leading-5">
          Tap <span className="text-brand">"Authorize &amp; Pay"</span> below or place your physical Student RFID Card on the lower contactless reader panel.
        </p>
      </div>
    </PanelShell>
  )
}

function GcashPanel({ ticket, total }) {
  return (
    <PanelShell icon={<QrIcon className="h-5 w-5" />} title="GCASH / QR PH PAYMENT" ticket={ticket}>
      <div className="mt-4 flex items-center gap-6">
        <QrPlaceholder seed={`${ticket}-${total}`} className="h-[210px] w-[210px] flex-none" />
        <div className="min-w-0">
          <p className="text-[22px] font-semibold leading-7">Scan with GCash, Maya or any mobile banking app</p>
          <p className="mt-3 font-body text-[18px] text-muted">Amount to pay</p>
          <p className="text-[48px] font-bold leading-none text-brand">{peso(total)}</p>
          <p className="mt-4 flex items-center gap-2 text-[16px] font-medium text-amber">
            <span className="h-3 w-3 animate-blink rounded-full bg-amber" /> Waiting for payment…
          </p>
          <p className="mt-1 font-body text-[14px] text-muted">Demo: the code is a placeholder. Tap the button below to simulate a received payment.</p>
        </div>
      </div>
    </PanelShell>
  )
}

function CashPanel({ ticket, total }) {
  const steps = [
    'Tap the button below to place your order and get your pickup number.',
    `Pay ${peso(total)} at the Express Counter within ${CASH_HOLD_MINUTES} minutes.`,
    'Unpaid orders are cancelled automatically after the hold time.',
  ]
  return (
    <PanelShell icon={<CashIcon className="h-5 w-5" />} title="PAY CASH AT THE EXPRESS COUNTER" ticket={ticket}>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-body text-[18px] text-muted">Amount to pay at the counter</p>
          <p className="text-[56px] font-bold leading-none text-brand">{peso(total)}</p>
        </div>
        <p className="rounded-full bg-[#4a3511] px-4 py-2 text-[16px] font-semibold text-amber">Hold time: {CASH_HOLD_MINUTES} min</p>
      </div>
      <ol className="mt-5 grid gap-3">
        {steps.map((t, i) => (
          <li key={t} className="flex items-center gap-4 text-[18px]">
            <span className="grid h-[32px] w-[32px] flex-none place-items-center rounded-full bg-key text-[16px] font-semibold text-brand">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
    </PanelShell>
  )
}

/* ---------- screen ---------- */
export default function PaymentScreen({ student, cart, serviceType, onBackToCart, onBackToMenu, onLogOut, onPay }) {
  const { lines } = cartSummary(cart)
  const { total } = orderTotals(lines)
  const balance = db.getWalletBalance(student.id)
  const enough = balance >= total

  const ticket = useMemo(() => `T-${1000 + Math.floor(Math.random() * 9000)}`, [])
  const [method, setMethod] = useState(enough ? 'wallet' : 'gcash')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const authorize = () => {
    if (busy) return
    setError('')
    setBusy(true)
    timer.current = setTimeout(() => {
      const result = onPay(method, ticket)
      if (result && !result.ok) {
        setBusy(false)
        setError(result.reason === 'insufficient' ? 'Wallet balance is too low. Please choose another payment method.' : 'Payment could not be completed. Please try again.')
      }
    }, PROCESSING_MS)
  }

  const ServiceIcon = serviceType === 'take-out' ? TakeOutIcon : DineInIcon
  const label = {
    wallet: `Authorize & Pay ${peso(total)}`,
    gcash: `I've Paid ${peso(total)} — Confirm`,
    cash: `Place Order — Pay ${peso(total)} at Counter`,
  }[method]
  const canPay = !busy && (method !== 'wallet' || enough)

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} actionLabel="Back to Menu" onAction={onBackToMenu} ActionIcon={ArrowLeftIcon} />

      <div className="absolute left-[45px] right-[29px] top-[262px] flex flex-col">
        <Stepper current={3} />

        <div className="mt-5 text-center">
          <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.01em]">Select Payment Method</h1>
          <p className="mx-auto mt-3 flex h-[44px] w-max items-center gap-3 rounded-full bg-[#161c27] px-5 text-[19px]">
            <span>Total Amount Due: <span className="text-[26px] font-semibold text-brand">{peso(total)}</span></span>
            <span className="text-muted">•</span>
            <span className="flex items-center gap-2 font-medium text-amber"><ServiceIcon className="h-5 w-5" /> {SERVICE_TYPES[serviceType] ?? 'Dine In'}</span>
          </p>
        </div>

        <div role="radiogroup" aria-label="Payment method" className="mt-6 flex flex-col gap-[11px]">
          <MethodCard
            active={method === 'wallet'} Icon={WalletIcon} onSelect={() => setMethod('wallet')}
            title="Campus ID Wallet" badge="INSTANT DEDUCTION" badgeTone="brand"
            subtitle={enough ? <>Available Balance: <span className="text-brand">{peso(balance)}</span> • 5% Dining Cashback</> : <>Available Balance: {peso(balance)} • Not enough for this order</>}
            subtitleTone={enough ? undefined : 'danger'}
          />
          <MethodCard
            active={method === 'gcash'} Icon={QrIcon} onSelect={() => setMethod('gcash')}
            title="GCash / QR Ph" badge="MOBILE PAY"
            subtitle="Scan screen QR using GCash, Maya, or mobile banking apps"
          />
          <MethodCard
            active={method === 'cash'} Icon={CashIcon} onSelect={() => setMethod('cash')}
            title="Pay Cash" badge="EXPRESS COUNTER" badgeTone="amber"
            subtitle={`Pay at the Express Counter within ${CASH_HOLD_MINUTES} minutes of ordering`}
          />
        </div>

        <div className="mt-5">
          {method === 'wallet' && <WalletPanel ticket={ticket} balance={balance} total={total} enough={enough} />}
          {method === 'gcash' && <GcashPanel ticket={ticket} total={total} />}
          {method === 'cash' && <CashPanel ticket={ticket} total={total} />}
        </div>

        <p className="mt-3 h-[22px] text-center text-[17px] font-medium leading-[22px] text-[#ff9aa2]" role="alert">{error}</p>

        <button type="button" disabled={!canPay} onClick={authorize}
          className="mt-2 flex h-[71px] items-center justify-center gap-3 rounded-[14px] bg-brand text-[30px] font-semibold text-[#073242] shadow-[0_0_30px_rgba(68,212,247,0.25)] transition active:scale-[0.98] disabled:bg-key disabled:text-muted disabled:shadow-none disabled:active:scale-100">
          {busy ? 'Processing…' : <>{label} <ArrowIcon /></>}
        </button>
        <button type="button" onClick={onBackToCart} disabled={busy}
          className="mt-3 flex h-[60px] items-center justify-center gap-3 rounded-[14px] bg-[#161c27] text-[26px] font-semibold transition active:scale-[0.98] disabled:opacity-50">
          <CartIcon /> Return to Cart
        </button>
      </div>
    </Frame>
  )
}