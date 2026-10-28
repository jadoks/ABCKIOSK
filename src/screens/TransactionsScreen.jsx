import { useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import { ArrowDownIcon, CashIcon, DineInIcon, GiftIcon, SandwichIcon, TakeOutIcon, TopUpIcon, WalletIcon, XIcon } from '../components/icons.jsx'
import { SEMESTER_LABEL, TRANSACTIONS_PAGE_SIZE } from '../lib/config.js'
import { db } from '../lib/db.js'
import { clock, peso } from '../lib/format.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const stamp = (iso) => {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()} • ${clock(d)}`
}

function rowIcon(t) {
  if (t.kind === 'reward') return GiftIcon
  if (t.kind === 'topup') return t.method === 'gcash' ? TopUpIcon : CashIcon
  return t.place?.includes('Dine') ? DineInIcon : t.title.includes('Panini') || t.title.includes('Sandwich') ? SandwichIcon : TakeOutIcon
}

function Row({ t }) {
  const Icon = rowIcon(t)
  const isReward = t.kind === 'reward'
  const credit = t.amount > 0
  const amount = isReward ? `- ${Math.abs(t.points).toLocaleString()} pts` : `${credit ? '+' : '-'} ${peso(Math.abs(t.amount))}`
  const tone = isReward ? 'text-amber' : credit ? 'text-brand' : 'text-soft'
  const sub = isReward ? 'Meal Points Used' : credit ? 'Credit Applied' : 'Campus Meal Deduction'
  const subTone = isReward ? 'text-amber' : credit ? 'text-mint' : 'text-muted'
  return (
    <li className="flex h-[92px] flex-none items-center gap-5 rounded-[14px] bg-[#161c27] px-7">
      <span className="grid h-[48px] w-[48px] flex-none place-items-center rounded-[12px] bg-[#1d2735] text-brand"><Icon className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[24px] font-semibold leading-7">{t.title}</p>
        <p className="truncate font-body text-[15px] text-muted">{stamp(t.at)}{t.place ? ` • ${t.place}` : ''}{t.ref && !t.place?.includes(t.ref) ? ` • Ref: ${t.ref}` : ''}</p>
      </div>
      <div className="text-right">
        <p className={`text-[32px] font-bold leading-9 ${tone}`}>{amount}</p>
        <p className={`text-[15px] font-medium ${subTone}`}>{sub}</p>
      </div>
    </li>
  )
}

export default function TransactionsScreen({ student, cart, onLogOut, onBack }) {
  const all = db.transactions(student.id)
  const [shown, setShown] = useState(TRANSACTIONS_PAGE_SIZE)
  const rows = all.slice(0, shown)

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} actionLabel="Cancel" onAction={onBack} ActionIcon={XIcon} />

      <div className="absolute left-[68px] right-[86px] top-[262px] flex flex-col">
        <div className="text-center">
          <p className="text-[14px] font-semibold tracking-[0.12em] text-muted">CAMPUS CARD E-WALLET</p>
          <h1 className="mt-1 text-[52px] font-semibold leading-[58px] tracking-[-0.01em]">Transaction History</h1>
        </div>

        <div className="mx-auto mt-6 flex h-[102px] w-[672px] items-center justify-between rounded-[16px] bg-[#161c27] px-8">
          <span className="flex items-center gap-4 text-[26px] font-medium text-soft"><WalletIcon className="h-7 w-7" /> Available Balance:</span>
          <span className="text-[38px] font-bold text-brand">{peso(db.getWalletBalance(student.id))}</span>
        </div>

        {rows.length === 0 ? (
          <div className="mt-[70px] grid h-[200px] place-items-center rounded-[14px] bg-[#161c27] text-center">
            <div>
              <p className="text-[28px] font-semibold">No transactions yet</p>
              <p className="mt-2 font-body text-[19px] text-muted">Top-ups, wallet payments and redeemed rewards will show up here.</p>
            </div>
          </div>
        ) : (
          <ul className="mt-[70px] flex flex-col gap-[14px]" aria-label="Transactions">
            {rows.map((t) => <Row key={t.id} t={t} />)}
          </ul>
        )}

        <div className="mt-8 flex flex-col items-center">
          {shown < all.length && (
            <button type="button" onClick={() => setShown((n) => n + TRANSACTIONS_PAGE_SIZE)}
              className="flex h-[64px] w-[512px] items-center justify-center gap-3 rounded-[12px] border border-[#222a38] bg-[#161c27] text-[24px] font-semibold text-brand transition active:scale-[0.98]">
              Load Older Transactions <ArrowDownIcon />
            </button>
          )}
          {all.length > 0 && (
            <p className="mt-3 text-[14px] font-medium text-muted">Showing {rows.length} of {all.length} recorded activities for {SEMESTER_LABEL}</p>
          )}
        </div>
      </div>
    </Frame>
  )
}
