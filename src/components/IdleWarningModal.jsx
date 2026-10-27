import { useEffect, useRef } from 'react'
import { HandIcon, LockIcon, TrashIcon } from './icons.jsx'
import { peso, shortName } from '../lib/format.js'

const RADIUS = 48
const CIRC = 2 * Math.PI * RADIUS

/* "Are you still ordering?" overlay. Lives inside the scaled stage, so it fits every display. */
export default function IdleWarningModal({ student, count, total, idleSeconds, warnSeconds, warnLeft, onStay, onLogOut }) {
  const stayRef = useRef(null)
  useEffect(() => { stayRef.current?.focus() }, [])
  const fraction = warnSeconds > 0 ? warnLeft / warnSeconds : 0

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#02050a]/85 backdrop-blur-[3px]" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-desc">
      <div className="relative w-[700px] overflow-hidden rounded-[28px] border-2 border-amber bg-[#111827] px-[56px] pb-[48px] pt-[50px] text-center shadow-[0_0_70px_rgba(255,180,84,0.28)]">
        {/* shrinking bar along the top edge */}
        <span aria-hidden="true" className="absolute left-0 top-0 h-[8px] bg-amber transition-[width] duration-1000 ease-linear" style={{ width: `${fraction * 100}%` }} />

        <div className="relative mx-auto h-[140px] w-[140px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#3a3326" strokeWidth="8" />
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#ffb454" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - fraction)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[44px] font-bold text-amber" aria-live="off">{warnLeft}s</span>
        </div>

        <p className="mx-auto mt-5 flex w-max items-center gap-3 rounded-full border border-amber/60 bg-amber/10 px-6 py-[7px] text-[16px] font-bold tracking-[0.1em] text-amber">
          <span className="h-[9px] w-[9px] rounded-full bg-amber" /> AUTO-CLEARING CART IN {warnLeft} SECOND{warnLeft === 1 ? '' : 'S'}
        </p>

        <h2 id="idle-title" className="mt-6 whitespace-nowrap text-[44px] font-bold leading-[52px]">Are You Still Ordering?</h2>
        <p id="idle-desc" className="mx-auto mt-4 max-w-[560px] font-body text-[23px] leading-[34px] text-[#9aa4b8]">
          No touch activity detected for {idleSeconds} seconds. To protect your Student ID balance and privacy on this public kiosk, your active session will close and your cart will be cleared.
        </p>

        <div className="mt-8 flex items-center rounded-[14px] border-l-[5px] border-amber bg-[#0e131b] px-6 py-4 text-left">
          <LockIcon className="h-6 w-6 flex-none text-amber" />
          <div className="ml-4 flex-1 border-r border-[#2b3342]">
            <p className="font-body text-[16px] text-[#9aa4b8]">Protected Session</p>
            <p className="text-[20px] font-semibold">ID {student?.id} ({shortName(student?.name)})</p>
          </div>
          <div className="pl-6 text-right">
            <p className="font-body text-[16px] text-[#9aa4b8]">Active Cart</p>
            <p className="text-[20px] font-semibold text-brand">{count > 0 ? `${count} ${count === 1 ? 'Item' : 'Items'} (${peso(total)})` : 'Empty'}</p>
          </div>
        </div>

        <button ref={stayRef} type="button" onClick={onStay}
          className="mt-8 flex h-[78px] w-full items-center justify-center gap-4 rounded-[16px] bg-[#38bdf8] text-[28px] font-semibold text-[#06283a] shadow-[0_0_30px_rgba(56,189,248,0.3)] transition active:scale-[0.98]">
          <HandIcon /> I'm Still Here — Keep My Order
        </button>
        <button type="button" onClick={onLogOut}
          className="mt-4 flex h-[72px] w-full items-center justify-center gap-3 rounded-[16px] border-2 border-[#ef4444] bg-[#1c2230] text-[25px] font-semibold text-[#ef4444] transition active:scale-[0.98]">
          <TrashIcon className="h-7 w-7" /> Clear Cart &amp; Log Out Now
        </button>
      </div>
    </div>
  )
}