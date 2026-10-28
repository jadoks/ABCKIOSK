import { useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import { ArrowLeftIcon, CheckIcon, GiftIcon, MedalIcon, REWARD_ICONS, ReceiptIcon, TopUpIcon, TrophyIcon } from '../components/icons.jsx'
import { db } from '../lib/db.js'
import { peso } from '../lib/format.js'
import { REWARDS, tierInfo } from '../lib/rewards.js'

function RewardCard({ reward, points, onRedeem }) {
  const Icon = REWARD_ICONS[reward.icon]
  const short = reward.cost - points
  const can = short <= 0
  return (
    <div className="flex flex-col rounded-[14px] border border-[#222a38] bg-[#161c27] p-4">
      <div className="mb-3 flex items-start gap-4">
        <span className="grid h-[48px] w-[48px] flex-none place-items-center rounded-[10px] bg-key text-soft"><Icon className="h-6 w-6" /></span>
        <div className="min-w-0">
          <p className="text-[19px] font-semibold leading-6">{reward.title}</p>
          <p className="text-[14px] font-semibold text-amber">Cost: {reward.cost.toLocaleString()} pts</p>
          <p className="mt-[2px] font-body text-[14px] leading-[17px] text-muted">{reward.desc}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={!can}
        onClick={() => onRedeem(reward)}
        className="mt-auto flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-[#09b4d6] text-[16px] font-semibold text-[#05303b] shadow-[0_4px_14px_rgba(9,180,214,0.25)] transition active:scale-[0.98] disabled:bg-key disabled:text-muted disabled:shadow-none disabled:active:scale-100"
      >
        <GiftIcon /> {can ? 'Redeem Reward' : `Need ${short.toLocaleString()} more pts`}
      </button>
    </div>
  )
}

/* Shown after a successful redemption: the claim code to show at the counter. */
function RedeemedModal({ result, onClose }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#02050a]/85 backdrop-blur-[3px]" role="alertdialog" aria-modal="true" aria-labelledby="redeem-title">
      <div className="w-[640px] rounded-[28px] border-2 border-amber bg-[#111827] px-[48px] pb-[40px] pt-[44px] text-center shadow-[0_0_70px_rgba(255,180,84,0.28)]">
        <span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-amber/15"><CheckIcon className="h-[56px] w-[56px]" fill="#ffb454" tick="#3a2500" /></span>
        <h2 id="redeem-title" className="mt-5 text-[38px] font-bold leading-[44px]">Reward Redeemed!</h2>
        <p className="mt-2 text-[24px] font-semibold text-amber">{result.reward.title}</p>
        <p className="mt-6 text-[16px] font-semibold tracking-[0.14em] text-muted">YOUR CLAIM CODE</p>
        <p className="mt-1 text-[56px] font-bold leading-[60px] text-brand [text-shadow:0_0_26px_rgba(68,212,247,0.4)]">{result.code}</p>
        <p className="mx-auto mt-4 max-w-[480px] font-body text-[20px] leading-7 text-muted">Show this code at the Express Counter. It is also saved in your Transaction History.</p>
        <p className="mt-4 text-[20px]">Remaining points: <span className="font-bold text-amber">{result.points.toLocaleString()} pts</span></p>
        <button type="button" onClick={onClose} autoFocus
          className="mt-7 flex h-[68px] w-full items-center justify-center rounded-[16px] bg-brand text-[26px] font-semibold text-[#073242] transition active:scale-[0.98]">
          Done
        </button>
      </div>
    </div>
  )
}

export default function WalletScreen({ student, cart, onLogOut, onBack, onTopUp, onHistory }) {
  const [, force] = useState(0) // re-read balances after a redemption
  const [redeemed, setRedeemed] = useState(null)
  const [error, setError] = useState('')

  const balance = db.getWalletBalance(student.id)
  const points = db.getPoints(student.id)
  const { tier, next, toNext, progress, top } = tierInfo(points)

  const redeem = (reward) => {
    setError('')
    const res = db.redeemReward(student.id, reward.id)
    if (!res.ok) {
      setError('Not enough points for that reward.')
      force((n) => n + 1)
      return
    }
    setRedeemed(res)
    force((n) => n + 1)
  }

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} actionLabel="Back to Menu" onAction={onBack} ActionIcon={ArrowLeftIcon} />

      <div className="absolute left-[90px] right-[76px] top-[222px] flex flex-col">
        <div className="text-center">
          <h1 className="text-[40px] font-semibold leading-[44px] tracking-[-0.01em]">Student ID Wallet &amp; Rewards</h1>
          <p className="mx-auto mt-3 max-w-[560px] font-body text-[19px] leading-6 text-muted">Manage campus meal plans, track balances, and redeem food perks on campus</p>
        </div>

        {/* Wallet balance */}
        <section className="mt-5 rounded-[10px] border border-brand/60 border-t-[4px] border-t-brand bg-[#161c27] px-7 pb-7 pt-6" aria-label="Campus wallet balance">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.1em] text-brand">DIRECT STUDENT ACCOUNT</p>
              <p className="mt-1 text-[19px] font-medium">Current Campus Wallet Balance</p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-4 py-[5px] text-[12px] font-semibold tracking-[0.04em] text-mint">
              <span className="h-[8px] w-[8px] rounded-full bg-mint" /> ACTIVE • TAP CARD SYNCED
            </span>
          </div>
          <p className="mt-5 text-[64px] font-bold leading-[68px] text-brand [text-shadow:0_0_26px_rgba(68,212,247,0.3)]">{peso(balance)}</p>
          <p className="mt-1 font-body text-[17px] text-muted">Direct student debit linked to Campus ID • NFC Terminal Ready</p>
          <div className="mt-6 flex gap-4">
            <button type="button" onClick={onTopUp}
              className="flex h-[48px] flex-1 items-center justify-center gap-3 rounded-[8px] bg-[#09b4d6] text-[18px] font-semibold text-[#05303b] shadow-[0_4px_16px_rgba(9,180,214,0.3)] transition active:scale-[0.98]">
              <TopUpIcon /> Top Up Balance
            </button>
            <button type="button" onClick={onHistory}
              className="flex h-[48px] flex-1 items-center justify-center gap-3 rounded-[8px] border border-[#2b3342] bg-[#1a202b] text-[18px] font-semibold transition active:scale-[0.98]">
              <ReceiptIcon /> View Transaction History
            </button>
          </div>
        </section>

        {/* Loyalty points */}
        <section className="mt-5 rounded-[10px] border border-[#5a4620] border-t-[4px] border-t-amber bg-[#161c27] px-7 pb-6 pt-6" aria-label="Meal points">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.1em] text-amber">CAMPUS LOYALTY PROGRAM</p>
              <p className="mt-1 text-[19px] font-medium">Available Meal Points</p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-amber/50 bg-amber/10 px-4 py-[5px] text-[12px] font-semibold tracking-[0.04em] text-amber">
              <TrophyIcon /> LEVEL {tier.level} PERKS
            </span>
          </div>
          <p className="mt-4 text-[64px] font-bold leading-[68px] text-amber [text-shadow:0_0_26px_rgba(255,180,84,0.28)]">{points.toLocaleString()} pts</p>
          <p className="mt-1 flex items-center gap-2 font-body text-[17px] text-muted"><span className="h-[8px] w-[8px] rounded-full bg-amber" /> Status: {tier.label} Tier • 5% Dining Cashback Active</p>
          <div className="mt-5 flex items-center justify-between text-[12px] font-semibold text-amber">
            <span>Tier Progress</span>
            <span className="text-soft">{next ? `${toNext.toLocaleString()} pts to ${next.label} Tier (${next.min.toLocaleString()} pts)` : `${tier.label} Tier reached (${top.toLocaleString()} pts)`}</span>
          </div>
          <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#222a38]" role="progressbar" aria-valuemin={0} aria-valuemax={top} aria-valuenow={Math.min(points, top)}>
            <div className="h-full rounded-full bg-amber" style={{ width: `${progress * 100}%` }} />
          </div>
        </section>

        {/* Redeem */}
        <div className="mt-5 flex items-end justify-between">
          <h2 className="text-[22px] font-semibold">Redeem Dining Perks</h2>
          <span className="text-[13px] font-medium text-soft">Select item to deduct points</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {REWARDS.map((r) => <RewardCard key={r.id} reward={r} points={points} onRedeem={redeem} />)}
        </div>
        <p className="mt-1 h-[20px] text-center text-[16px] font-medium text-[#ff9aa2]" role="alert">{error}</p>
      </div>

      {redeemed && <RedeemedModal result={redeemed} onClose={() => setRedeemed(null)} />}
    </Frame>
  )
}
