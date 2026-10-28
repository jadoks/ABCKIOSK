import useIdleWarning from '../hooks/useIdleWarning.js'
import { cartSummary, orderTotals } from '../lib/cart.js'
import { AUTO_LOCK_SECONDS, IDLE_WARNING_SECONDS } from '../lib/config.js'
import { mmss, shortName } from '../lib/format.js'
import IdleWarningModal from './IdleWarningModal.jsx'
import { ClockIcon, LogoutIcon, UserCircleIcon } from './icons.jsx'

/* Logged-in student, auto-lock countdown and Log Out. Reusable on every post-login screen. */
/* Pass `cart` ({ [itemId]: qty }) on ordering screens to get the "Are you still ordering?" warning before auto-logout;
   without it (e.g. the confirmation screen) the student is logged out straight after the idle time. */
/* idlePaused keeps the session alive while a QR / cash payment is waiting on the hardware or the phone. */
/* Right-hand button defaults to Log Out; the cart passes actionLabel="Back to Menu". */
export default function SessionBar({ student, cart, onLogOut, actionLabel = 'Log Out', onAction = onLogOut, ActionIcon = LogoutIcon, idlePaused = false }) {
  const warn = cart ? IDLE_WARNING_SECONDS : 0
  const { idleLeft: left, warning, warnLeft, stay } = useIdleWarning(AUTO_LOCK_SECONDS, warn, onLogOut, idlePaused)
  const urgent = left <= 10

  const { count } = cart ? cartSummary(cart) : { count: 0 }
  const { total } = cart ? orderTotals(cartSummary(cart).lines) : { total: 0 }

  return (
    <>
    <div className="absolute left-6 right-6 top-[134px] flex h-16 items-center justify-between rounded-full bg-panel px-[26px]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1d3a47]"><UserCircleIcon /></span>
        <span className="text-[19px] font-medium">ID: {student?.id} ({shortName(student?.name)})</span>
      </div>

      <div
        className={`absolute left-1/2 flex h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 text-[17px] font-semibold ${
          urgent ? 'text-[#ff9aa2]' : 'text-amber'
        }`}
        aria-live="off"
      >
        <ClockIcon /> Touch Auto-Lock: {mmss(left)}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="flex h-10 items-center gap-2 rounded-[10px] bg-key px-4 text-[17px] font-medium transition active:scale-95"
      >
        <ActionIcon /> {actionLabel}
      </button>
    </div>
    {warning && (
      <IdleWarningModal student={student} count={count} total={total} idleSeconds={AUTO_LOCK_SECONDS}
        warnSeconds={IDLE_WARNING_SECONDS} warnLeft={warnLeft} onStay={stay} onLogOut={onLogOut} />
    )}
    </>
  )
}