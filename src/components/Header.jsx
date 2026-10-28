import { useEffect, useRef, useState } from 'react'
import { Logo } from './Frame.jsx'
import { HelpIcon, XIcon } from './icons.jsx'

const HELP_AUTO_CLOSE_SECONDS = 30
const TIPS = [
  ['Browse & order', 'Tap a menu item to add it to your cart, then press Checkout.'],
  ['Pay by Wallet', 'Tap “Authorize & Pay” or tap your Student RFID card on the reader.'],
  ['Pay by QR Ph', 'Choose your bank or e-wallet first, then scan the QR with that app.'],
  ['Pay by Cash', 'Insert bills or coins in the hardware slots. Any extra is returned as change.'],
  ['Need a person?', 'Ask the canteen staff at the counter and quote your ticket number.'],
]

/* Help / Reset: opens a help sheet instead of instantly wiping the session.
   `onHelp` is the screen's reset action (log out, clear the cart, back to the start). */
export default function AppHeader({ onHelp }) {
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(HELP_AUTO_CLOSE_SECONDS)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setLeft(HELP_AUTO_CLOSE_SECONDS)
    closeRef.current?.focus()
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [open])
  useEffect(() => { if (open && left <= 0) setOpen(false) }, [open, left]) // don't leave the sheet up on an idle kiosk

  const reset = () => { setOpen(false); onHelp?.() }

  return (
    <header className="absolute left-10 right-[34px] top-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo className="h-14 w-14 rounded-[14px]" />
        <div>
          <p className="text-[24px] font-bold leading-7 tracking-[0.08em]">ABC KIOSK</p>
          <p className="text-[13px] font-medium leading-4 tracking-[0.1em] text-brand">CAMPUS DINING EXPRESS</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex h-14 items-center gap-3 rounded-2xl bg-panel px-6 text-[18px] font-medium transition active:scale-95"
      >
        <HelpIcon />
        Reset / Help
      </button>

      {open && (
        // the stage is transformed, so `fixed` here covers exactly the 1034x1448 kiosk screen
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#02050a]/85 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <div className="relative w-[720px] rounded-[28px] border-2 border-brand/70 bg-[#111827] px-[48px] pb-[40px] pt-[40px] shadow-[0_0_70px_rgba(68,212,247,0.22)]">
            <button type="button" aria-label="Close help" onClick={() => setOpen(false)}
              className="absolute right-5 top-5 grid h-[48px] w-[48px] place-items-center rounded-full bg-key text-soft transition active:scale-95">
              <XIcon className="h-5 w-5" />
            </button>
            <p className="flex items-center gap-3 text-[16px] font-semibold tracking-[0.08em] text-brand"><HelpIcon /> KIOSK HELP</p>
            <h2 id="help-title" className="mt-2 text-[40px] font-bold leading-[46px]">How can we help?</h2>

            <ul className="mt-5 space-y-3">
              {TIPS.map(([title, body]) => (
                <li key={title} className="rounded-[12px] bg-[#161c27] px-5 py-3">
                  <p className="text-[21px] font-semibold text-soft">{title}</p>
                  <p className="font-body text-[18px] leading-6 text-muted">{body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-[12px] border-l-[5px] border-amber bg-[#0e131b] px-5 py-3">
              <p className="text-[19px] font-semibold text-amber">Reset Kiosk</p>
              <p className="font-body text-[17px] leading-6 text-muted">Signs you out, clears your cart and returns to the start screen. Cash already inserted stays credited to your Campus Wallet.</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button ref={closeRef} type="button" onClick={() => setOpen(false)}
                className="h-[64px] rounded-[14px] bg-brand text-[24px] font-semibold text-[#073242] transition active:scale-[0.98]">
                Keep Ordering
              </button>
              <button type="button" onClick={reset}
                className="h-[64px] rounded-[14px] border border-[#ef4444]/70 bg-[#10172a] text-[24px] font-semibold text-[#ff6b6b] transition active:scale-[0.98]">
                Reset &amp; Start Over
              </button>
            </div>
            <p className="mt-3 text-center font-body text-[15px] text-muted">This window closes automatically in {Math.max(left, 0)}s</p>
          </div>
        </div>
      )}
    </header>
  )
}