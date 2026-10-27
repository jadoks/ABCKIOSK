import { useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import useDragScroll from '../hooks/useDragScroll.js'
import { ArrowIcon, ArrowLeftIcon, BagIcon, CheckIcon, DineInIcon, MinusIcon, PlusIcon, TakeOutIcon } from '../components/icons.jsx'
import { cartSummary, ECO_FEE_PER_ITEM, orderTotals } from '../lib/cart.js'
import { peso } from '../lib/format.js'

const MAX_QTY = 9

/* Order type choices (labels live in SERVICE_TYPES in lib/config.js) */
const SERVICE_OPTIONS = [
  { id: 'dine-in', label: 'Dine In', hint: 'Eat here at the campus dining area', Icon: DineInIcon },
  { id: 'take-out', label: 'Take Out', hint: 'Packed to go in eco-packaging', Icon: TakeOutIcon },
]

/* ---------- small pieces ---------- */
function TrashIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  )
}
/* Same photo as the menu card: .jpg first, then the illustrated .svg, then an empty box. */
function Thumb({ item }) {
  const [src, setSrc] = useState(item.image)
  const [failed, setFailed] = useState(false)
  return (
    <div className="h-[88px] w-[112px] flex-none overflow-hidden rounded-[12px] bg-gradient-to-br from-[#1f2d3e] to-[#111824]">
      {!failed && (
        <img
          src={src}
          alt=""
          draggable={false}
          decoding="async"
          onError={() => (src !== item.fallback && item.fallback ? setSrc(item.fallback) : setFailed(true))}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}

function Line({ item, qty, onChange }) {
  return (
    <li className="flex h-[120px] flex-none items-center gap-4 rounded-[16px] border-l-[4px] border-brand bg-[#161c27] pl-4 pr-5">
      <Thumb item={item} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[24px] font-semibold leading-7">{item.name}</p>
        <p className="truncate font-body text-[17px] text-muted">{item.short ?? item.desc}</p>
        <p className="mt-1 text-[13px] font-semibold text-brand">{peso(item.price)} each</p>
      </div>

      <div className="flex items-center gap-2 rounded-[14px] bg-ink p-2">
        <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onChange(qty - 1)}
          className="grid h-[56px] w-[56px] place-items-center rounded-[10px] bg-key transition active:scale-95"><MinusIcon /></button>
        <span className="grid h-[56px] w-[64px] place-items-center rounded-[10px] bg-[#0f3a4a] text-[24px] font-semibold text-brand">{qty}</span>
        <button type="button" aria-label={`Add one more ${item.name}`} onClick={() => onChange(qty + 1)} disabled={qty >= MAX_QTY}
          className="grid h-[56px] w-[56px] place-items-center rounded-[10px] bg-[#09b4d6] text-[#05303b] transition active:scale-95 disabled:opacity-40"><PlusIcon /></button>
      </div>

      <p className="w-[130px] text-right text-[30px] font-bold">{peso(item.price * qty)}</p>
      <button type="button" aria-label={`Delete ${item.name}`} onClick={() => onChange(0)}
        className="grid h-[48px] w-[48px] place-items-center rounded-[10px] bg-key text-[#ff8f8f] transition active:scale-95"><TrashIcon /></button>
    </li>
  )
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex h-[48px] items-center justify-between">
      <span className="font-body text-[18px] text-muted">{label}</span>
      <span className="text-[21px] font-semibold">{children}</span>
    </div>
  )
}

/* ---------- screen ---------- */
export default function CartScreen({ student, cart, serviceType: initialType = null, onCartChange, onBack, onLogOut, onProceed }) {
  const { lines } = cartSummary(cart)
  const { count, subtotal, ecoFee, serviceFee, total } = orderTotals(lines)
  const listRef = useDragScroll()

  const [serviceType, setServiceType] = useState(initialType) // 'dine-in' | 'take-out' | null (must be chosen)

  const setQty = (id, qty) => {
    const next = { ...cart }
    const clamped = Math.max(0, Math.min(MAX_QTY, qty))
    if (clamped === 0) delete next[id]
    else next[id] = clamped
    onCartChange(next)
  }
  const clearAll = () => {
    onCartChange({})
    onBack()
  }

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} actionLabel="Back to Menu" onAction={onBack} ActionIcon={ArrowLeftIcon} />

      {lines.length === 0 ? (
        <div className="absolute left-[45px] right-[29px] top-[420px] grid justify-items-center gap-5 text-center text-muted">
          <span className="grid h-[110px] w-[110px] place-items-center rounded-[28px] bg-[#0f3a4a]"><BagIcon /></span>
          <p className="text-[34px] font-semibold text-soft">Your order is empty</p>
          <p className="font-body text-[20px]">Go back to the menu and add something tasty.</p>
          <button type="button" onClick={onBack}
            className="mt-4 h-[72px] w-[360px] rounded-[16px] bg-brand text-[26px] font-semibold text-[#073242] transition active:scale-95">
            Back to Menu
          </button>
        </div>
      ) : (
        <div className="absolute left-[45px] right-[29px] top-[268px] flex flex-col gap-5">
          <div className="text-center">
            <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.01em]">Review Your Pre-Order</h1>
            <p className="mt-2 font-body text-[18px] text-muted">Adjust quantities below — totals and fees recalculate automatically</p>
          </div>

          {/* Items (drag or swipe to scroll when there are more than two) */}
          <ul ref={listRef} aria-label="Order items"
            className="flex max-h-[330px] touch-pan-y flex-col gap-5 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lines.map(({ item, qty }) => (
              <Line key={item.id} item={item} qty={qty} onChange={(q) => setQty(item.id, q)} />
            ))}
          </ul>

          {/* Dine In / Take Out */}
          <section className="rounded-[16px] bg-[#161c27] p-5" aria-label="Dine in or take out">
            <h2 className="flex items-center gap-3 text-[16px] font-semibold tracking-[0.08em]">
              <DineInIcon className="h-5 w-5 text-brand" /> DINE IN OR TAKE OUT?
            </h2>
            <div role="radiogroup" aria-label="Order type" className="mt-4 flex gap-5">
              {SERVICE_OPTIONS.map(({ id, label, hint, Icon }) => {
                const active = serviceType === id
                return (
                  <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setServiceType(id)}
                    className={`relative flex h-[84px] flex-1 items-center gap-4 rounded-[12px] px-5 text-left transition active:scale-[0.98] ${
                      active ? 'bg-brand text-[#073242]' : 'bg-key text-soft'
                    }`}>
                    <Icon className="h-9 w-9 flex-none" />
                    <span className="min-w-0">
                      <span className="block text-[28px] font-semibold leading-8">{label}</span>
                      <span className={`block truncate font-body text-[15px] leading-5 ${active ? 'text-[#0b4a5e]' : 'text-muted'}`}>{hint}</span>
                    </span>
                    {active && <CheckIcon className="absolute right-4 top-4 h-6 w-6" fill="#073242" tick="#44d4f7" />}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Totals */}
          <section className="rounded-[16px] bg-[#161c27] px-5 py-4" aria-label="Order totals">
            <SummaryRow label={`Items Subtotal (${count} ${count === 1 ? 'item' : 'items'})`}>{peso(subtotal)}</SummaryRow>
            <SummaryRow label={`Eco-Packaging Fee (${peso(ECO_FEE_PER_ITEM)}/item)`}>{peso(ecoFee)}</SummaryRow>
            <div className="flex h-[48px] items-center justify-between">
              <span className="font-body text-[18px] text-muted">Kiosk System Service Fee</span>
              <span className="flex items-center gap-2 text-[21px] font-semibold text-mint">
                <CheckIcon className="h-4 w-4" /> {peso(serviceFee)} (Free for Students)
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#2b3342] pt-5">
              <div>
                <p className="text-[22px] font-semibold tracking-[0.04em]">TOTAL AMOUNT DUE</p>
                <p className="text-[13px] font-medium text-amber">All local taxes &amp; eco-levies included</p>
              </div>
              <p className="text-[60px] font-bold leading-none text-brand">{peso(total)}</p>
            </div>
          </section>

          <button type="button" disabled={!serviceType} onClick={() => onProceed(serviceType)}
            className="mt-2 flex h-[64px] items-center justify-center gap-3 rounded-[14px] bg-brand text-[26px] font-semibold text-[#073242] transition active:scale-[0.98] disabled:bg-key disabled:text-muted disabled:active:scale-100">
            {serviceType ? <>Proceed to Payment ({peso(total)}) <ArrowIcon /></> : 'Choose Dine In or Take Out to continue'}
          </button>
          <button type="button" onClick={clearAll}
            className="flex h-[64px] items-center justify-center gap-3 rounded-[14px] bg-[#161c27] text-[26px] font-semibold text-amber transition active:scale-[0.98]">
            <TrashIcon /> Clear Cart &amp; Start Over
          </button>
        </div>
      )}
    </Frame>
  )
}