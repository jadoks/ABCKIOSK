import { ACCEPTED_BILLS, ACCEPTED_COINS, SIMULATE_HARDWARE } from '../lib/config.js'
import { cashAcceptor } from '../lib/cashAcceptor.js'

/* DEMO ONLY (SIMULATE_HARDWARE in config.js): taps here pretend a bill / coin went into the validator. */
export default function CashSimulator() {
  if (!SIMULATE_HARDWARE) return null
  const btn = 'h-[44px] min-w-[72px] rounded-[10px] bg-key px-3 text-[18px] font-semibold transition active:scale-95'
  return (
    <div className="rounded-[12px] border border-dashed border-[#3a4457] px-4 py-3 text-center">
      <p className="text-[12px] font-semibold tracking-[0.12em] text-muted">DEMO • CASH VALIDATOR SIMULATOR</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {ACCEPTED_BILLS.map((v) => <button key={`b${v}`} type="button" className={`${btn} text-brand`} onClick={() => cashAcceptor.emit(v)}>₱{v.toLocaleString()}</button>)}
        <span className="mx-1 h-6 w-px bg-[#3a4457]" />
        {ACCEPTED_COINS.map((v) => <button key={`c${v}`} type="button" className={`${btn} text-amber`} onClick={() => cashAcceptor.emit(v)}>₱{v} coin</button>)}
      </div>
    </div>
  )
}
